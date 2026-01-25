const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.database();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const resolveUserIdByUid = async (uid, options = {}) => {
  const { attempts = 6, delayMs = 500 } = options;

  for (let i = 0; i < attempts; i += 1) {
    const snap = await db.ref(`familia_finanzas/auth_map/${uid}`).once('value');
    const userId = snap.val();
    if (userId) return userId;

    if (i < attempts - 1) {
      await sleep(delayMs);
    }
  }

  return null;
};

const getRoleContext = async (uid, options = {}) => {
  const userId = await resolveUserIdByUid(uid, options);
  if (!userId) return { userId: null, role: null };

  const userSnap = await db.ref(`familia_finanzas/usuarios/${userId}`).once('value');
  const userData = userSnap.val() || {};

  return {
    userId,
    role: userData.rol || 'solicitante',
  };
};

const assertCallerIsAdmin = async (uid) => {
  const { role } = await getRoleContext(uid, { attempts: 8, delayMs: 500 });
  if (role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'No autorizado');
  }
};

// Sincroniza el custom claim del usuario autenticado usando auth_map
exports.syncMyRole = functions.https.onCall(async (_data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesion');
  }

  const uid = context.auth.uid;
  const { userId, role } = await getRoleContext(uid, { attempts: 8, delayMs: 500 });

  if (!userId || !role) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'No se encontro el mapping auth_map para este usuario'
    );
  }

  await admin.auth().setCustomUserClaims(uid, { role });

  return { success: true, uid, userId, role };
});

// Establecer role manualmente (valida admin por database, no por claim)
exports.setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Debes iniciar sesion');
  }

  await assertCallerIsAdmin(context.auth.uid);

  const { uid, role } = data || {};

  if (!uid || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'uid y role son requeridos');
  }

  await admin.auth().setCustomUserClaims(uid, { role });

  return { success: true, uid, role };
});

// Intenta asignar role al crear usuario (puede no encontrar auth_map aun)
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
  try {
    const { userId, role } = await getRoleContext(user.uid, { attempts: 6, delayMs: 500 });

    if (!userId) {
      console.log('onUserCreate: auth_map no encontrado para uid:', user.uid);
      return;
    }

    await admin.auth().setCustomUserClaims(user.uid, { role });
  } catch (error) {
    console.error('Error asignando custom claims en onUserCreate:', error);
  }
});
