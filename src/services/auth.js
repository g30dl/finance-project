import {
  EmailAuthProvider,
  GoogleAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { get, ref, set } from 'firebase/database';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from './firebase';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const ADMIN_WHITELIST = ADMIN_EMAILS.length > 0 ? ADMIN_EMAILS : FALLBACK_ADMIN_EMAILS;

const AUTH_MAP_PATH = 'familia_finanzas/auth_map';
const USERS_PATH = 'familia_finanzas/usuarios';

const normalizeEmail = (email) => (email || '').trim().toLowerCase();
const isEmailAllowed = (email) => ADMIN_WHITELIST.includes(normalizeEmail(email));
const GOOGLE_PROVIDER_ID = 'google.com';

export const ensureAuthSession = async () => {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const result = await signInAnonymously(auth);
  return result.user;
};

const linkAuthToUserId = async (authUid, userId) => {
  if (!authUid || !userId) return;
  await set(ref(db, `${AUTH_MAP_PATH}/${authUid}`), userId);
};

const getAllUsers = async () => {
  const snapshot = await get(ref(db, USERS_PATH));
  return snapshot.exists() ? snapshot.val() : {};
};

const getUserById = async (userId) => {
  if (!userId) return null;
  const snapshot = await get(ref(db, `${USERS_PATH}/${userId}`));
  if (!snapshot.exists()) return null;
  return { userId, ...snapshot.val() };
};

const findAdminUserRecord = async (firebaseUser) => {
  const allUsers = await getAllUsers();
  const email = normalizeEmail(firebaseUser.email);

  // 1) Si ya existe por UID, usarlo.
  if (allUsers[firebaseUser.uid]?.rol === 'admin') {
    return { userId: firebaseUser.uid, ...allUsers[firebaseUser.uid] };
  }

  // 2) Buscar por email dentro de usuarios existentes.
  const entry = Object.entries(allUsers).find(([, user]) => {
    return normalizeEmail(user?.email) === email && user?.rol === 'admin';
  });

  if (entry) {
    const [userId, user] = entry;
    return { userId, ...user };
  }

  return null;
};

const ensureAdminInDatabase = async (firebaseUser) => {
  const existingByUid = await getUserById(firebaseUser.uid);
  if (existingByUid && existingByUid.rol !== 'admin') {
    throw new Error('Esta cuenta no tiene permisos de administrador.');
  }

  const existing = await findAdminUserRecord(firebaseUser);
  if (existing) return existing;

  const userId = firebaseUser.uid;
  const payload = {
    email: firebaseUser.email,
    nombre: firebaseUser.displayName || 'Admin',
    rol: 'admin',
    activo: true,
    fechaRegistro: Date.now(),
  };

  await set(ref(db, `${USERS_PATH}/${userId}`), payload);
  return { userId, ...payload };
};

const syncRoleClaimSafe = async () => {
  try {
    const callable = httpsCallable(functions, 'syncMyRole');
    await callable();
  } catch (error) {
    console.warn('No se pudo sincronizar el role claim:', error?.message || error);
  }
};

const getSignInMethods = async (email) => {
  if (!email) return [];
  return fetchSignInMethodsForEmail(auth, email);
};
const signInAdminWithPassword = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    throw new Error('Ingresa tu correo y contrasena.');
  }
  if (!isEmailAllowed(normalizedEmail)) {
    throw new Error('Email no autorizado');
  }
  const methods = await getSignInMethods(normalizedEmail);
  if (methods.includes('password')) {
    return signInWithEmailAndPassword(auth, normalizedEmail, password);
  }
  if (methods.length === 0) {
    throw new Error('Primero ingresa con Google para activar tu cuenta.');
  }
  if (methods.includes(GOOGLE_PROVIDER_ID) && !methods.includes('password')) {
    const provider = new GoogleAuthProvider();
    const popupResult = await signInWithPopup(auth, provider);
    const popupEmail = normalizeEmail(popupResult.user.email);
    if (popupEmail !== normalizedEmail) {
      await signOut(auth);
      throw new Error('Debes usar el mismo correo para vincular la contrasena.');
    }
    const credential = EmailAuthProvider.credential(normalizedEmail, password);
    try {
      await linkWithCredential(popupResult.user, credential);
    } catch (error) {
      if (error?.code !== 'auth/provider-already-linked') {
        throw error;
      }
    }
    return popupResult;
  }
  throw new Error('Esta cuenta requiere otro metodo de acceso.');
};
const signInAdmin = async ({ method, email, password } = {}) => {
  if (method === 'password') {
    return signInAdminWithPassword(email, password);
  }
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

const buildUserFromDatabase = async (firebaseUser) => {
  if (!firebaseUser?.uid) return null;

  const mapSnap = await get(ref(db, `${AUTH_MAP_PATH}/${firebaseUser.uid}`));
  const hasMapping = mapSnap.exists();
  const mappedUserId = hasMapping ? mapSnap.val() : null;
  const appUserId = mappedUserId || firebaseUser.uid;

  // Un usuario anonimo sin mapping no debe contar como sesion activa en la app.
  if (firebaseUser.isAnonymous && !hasMapping) {
    return null;
  }

  const userRecord = await getUserById(appUserId);
  const token = await firebaseUser.getIdTokenResult();

  const roleFromClaims = token?.claims?.role;
  const roleFromDb = userRecord?.rol;
  const role = roleFromClaims || roleFromDb || (firebaseUser.isAnonymous ? 'solicitante' : null);

  if (!role) return null;

  return {
    userId: appUserId,
    userName:
      userRecord?.nombre || firebaseUser.displayName || firebaseUser.email || 'Usuario',
    email: firebaseUser.email || userRecord?.email || null,
    role,
    firebaseUid: firebaseUser.uid,
  };
};

// Login como Admin con Google o correo/contraseña
export const loginAsAdmin = async (credentials = {}) => {
  try {
    const method = credentials?.method === 'password' ? 'password' : 'google';
    const result = await signInAdmin({
      method,
      email: credentials?.email,
      password: credentials?.password,
    });
    const firebaseUser = result.user;

    const email = normalizeEmail(firebaseUser.email);
    if (!isEmailAllowed(email)) {
      await signOut(auth);
      return { success: false, error: 'Email no autorizado' };
    }

    const adminRecord = await ensureAdminInDatabase(firebaseUser);

    // Vincular UID de auth con el userId de la app
    await linkAuthToUserId(firebaseUser.uid, adminRecord.userId);

    // Intentar sincronizar claims reales si ya existen functions
    await syncRoleClaimSafe();
    await firebaseUser.getIdToken(true);
    const token = await firebaseUser.getIdTokenResult(true);
    const claimRole = token?.claims?.role;

    if (claimRole && claimRole !== 'admin') {
      return {
        success: false,
        error: 'Cuenta sin permisos. Contacta al administrador para activar tu rol.',
      };
    }

    const user = await buildUserFromDatabase(firebaseUser);
    if (!user || user.role !== 'admin') {
      return {
        success: false,
        error:
          'Cuenta sin permisos. Asegura el custom claim role=admin o el rol en database.',
      };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Error login admin:', error);
    return { success: false, error: error?.message || 'Error al iniciar sesion' };
  }
};

// Login como Solicitante (Anonymous)
export const loginAsUser = async (userId, userName) => {
  try {
    if (!userId) {
      return { success: false, error: 'Usuario invalido' };
    }

    const result = await signInAnonymously(auth);
    const firebaseUid = result.user.uid;

    // Vincular UID de Firebase con userId de la app
    await linkAuthToUserId(firebaseUid, userId);

    // Asegurar que el usuario exista en database
    const existing = await getUserById(userId);
    if (!existing) {
      await set(ref(db, `${USERS_PATH}/${userId}`), {
        nombre: userName || userId,
        rol: 'solicitante',
        activo: true,
        fechaRegistro: Date.now(),
      });
    }

    const user = await buildUserFromDatabase(result.user);
    return {
      success: true,
      user: user || {
        userId,
        userName: userName || existing?.nombre || 'Solicitante',
        role: 'solicitante',
        firebaseUid,
      },
    };
  } catch (error) {
    console.error('Error login solicitante:', error);
    return { success: false, error: error?.message || 'Error al iniciar sesion' };
  }
};

// Logout
export const logout = async () => {
  try {
    if (auth.currentUser && !auth.currentUser.isAnonymous) {
      await signOut(auth);
    }
    return { success: true };
  } catch (error) {
    console.error('Error en logout:', error);
    return { success: false, error: error?.message || 'Error al cerrar sesion' };
  }
};

// Obtener usuario actual desde Firebase + Database
export const getCurrentUser = async () => {
  if (!auth.currentUser) return null;
  try {
    return await buildUserFromDatabase(auth.currentUser);
  } catch (error) {
    console.error('Error obteniendo usuario actual:', error);
    return null;
  }
};

export const getUserFromDatabase = buildUserFromDatabase;

