import { getUserById } from './database';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

const STORAGE_KEYS = {
  userId: 'userId',
  userName: 'userName',
  userRole: 'userRole',
  sessionExpiry: 'sessionExpiry',
};

const safeStorage = {
  get(key) {
    if (typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },
  set(key, value) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      return;
    }
  },
  remove(key) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      return;
    }
  },
};

const buildUser = (userId, userName, role) => ({
  userId,
  userName,
  role,
});

const persistSession = (user) => {
  const expiry = Date.now() + SESSION_DURATION_MS;
  safeStorage.set(STORAGE_KEYS.userId, user.userId);
  safeStorage.set(STORAGE_KEYS.userName, user.userName);
  safeStorage.set(STORAGE_KEYS.userRole, user.role);
  safeStorage.set(STORAGE_KEYS.sessionExpiry, String(expiry));
  return expiry;
};

export const loginAsUser = (userId, userName) => {
  const user = buildUser(userId, userName, 'solicitante');
  persistSession(user);
  return { success: true, user };
};

export const loginAsAdmin = async (pin) => {
  if (!/^\d{6}$/.test(pin)) {
    return { success: false, error: 'PIN incorrecto. Intenta nuevamente.' };
  }

  const admin = ADMIN_PINS[pin];
  if (!admin) {
    return { success: false, error: 'PIN incorrecto. Intenta nuevamente.' };
  }

  try {
    const adminRecord = await getUserById(admin.userId);
    if (!adminRecord || adminRecord.rol !== 'admin') {
      return {
        success: false,
        error: 'No tienes permiso para acceder a esta pagina.',
      };
    }

    const userName = adminRecord.nombre || admin.userName;
    const user = buildUser(admin.userId, userName, 'admin');
    persistSession(user);
    return { success: true, user };
  } catch (error) {
    console.error('Error al validar administrador:', error);
    return { success: false, error: 'No se pudo validar el administrador.' };
  }
};

export const logout = () => {
  Object.values(STORAGE_KEYS).forEach((key) => safeStorage.remove(key));
  return { success: true };
};

export const getCurrentUser = () => {
  const userId = safeStorage.get(STORAGE_KEYS.userId);
  const userName = safeStorage.get(STORAGE_KEYS.userName);
  const role = safeStorage.get(STORAGE_KEYS.userRole);
  const expiryRaw = safeStorage.get(STORAGE_KEYS.sessionExpiry);

  if (!userId || !userName || !role || !expiryRaw) {
    return null;
  }

  const expiry = Number(expiryRaw);
  if (!Number.isFinite(expiry) || expiry < Date.now()) {
    logout();
    return null;
  }

  return buildUser(userId, userName, role);
};

export const isAuthenticated = () => getCurrentUser() !== null;

export const isAdmin = () => getCurrentUser()?.role === 'admin';
