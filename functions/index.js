const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.database();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const NOTIF_PATH = 'familia_finanzas/notificaciones';
const USERS_PATH = 'familia_finanzas/usuarios';
const TOKENS_PATH = 'familia_finanzas/push_tokens';

const NOTIF_TITLE_MAP = {
  nueva_solicitud: 'Nueva solicitud',
  solicitud_aprobada: 'Solicitud aprobada',
  solicitud_rechazada: 'Solicitud rechazada',
  transferencia_recibida: 'Transferencia recibida',
  deposito_personal: 'Deposito recibido',
  deposito_recibido: 'Deposito recibido',
  gasto_personal: 'Gasto registrado',
  gasto_recurrente: 'Gasto recurrente',
  gasto_recurrente_ejecutado: 'Gasto recurrente ejecutado',
  gasto_recurrente_fallo: 'Gasto recurrente fallido',
  gasto_recurrente_proximo: 'Gasto recurrente proximo',
  saldo_bajo: 'Saldo bajo',
};

const NOTIF_URL_MAP = {
  nueva_solicitud: '/requests',
  solicitud_aprobada: '/notificaciones',
  solicitud_rechazada: '/notificaciones',
  transferencia_recibida: '/notificaciones',
  deposito_personal: '/notificaciones',
  deposito_recibido: '/notificaciones',
  gasto_personal: '/notificaciones',
  gasto_recurrente: '/notificaciones',
  gasto_recurrente_ejecutado: '/notificaciones',
  gasto_recurrente_fallo: '/notificaciones',
  gasto_recurrente_proximo: '/notificaciones',
  saldo_bajo: '/notificaciones',
};

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

const resolveNotificationTitle = (notification = {}) => {
  return NOTIF_TITLE_MAP[notification.tipo] || 'Familia Finanzas';
};

const resolveNotificationUrl = (notification = {}) => {
  if (notification.url) return notification.url;
  if (notification.tipo && NOTIF_URL_MAP[notification.tipo]) {
    return NOTIF_URL_MAP[notification.tipo];
  }
  if (notification.destinatario === 'todos_admins') {
    return '/requests';
  }
  return '/notificaciones';
};

const getAdminUserIds = async () => {
  const snap = await db.ref(USERS_PATH).once('value');
  const users = snap.val() || {};
  return Object.entries(users)
    .filter(([, user]) => user?.rol === 'admin' && user?.activo !== false)
    .map(([userId]) => userId);
};

const collectTokensForUsers = async (userIds = []) => {
  const entries = [];
  await Promise.all(
    userIds.map(async (userId) => {
      const snap = await db.ref(`${TOKENS_PATH}/${userId}`).once('value');
      const tokens = snap.val() || {};
      Object.keys(tokens).forEach((token) => {
        if (token) entries.push({ token, userId });
      });
    })
  );
  return entries;
};

const removeInvalidTokens = async (tokenList, tokenOwnersMap) => {
  const deletes = [];
  tokenList.forEach((token) => {
    const owners = tokenOwnersMap.get(token);
    if (!owners) return;
    owners.forEach((userId) => {
      deletes.push(db.ref(`${TOKENS_PATH}/${userId}/${token}`).remove());
    });
  });
  if (deletes.length) {
    await Promise.all(deletes);
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

// Envia push cuando se crea una notificacion en la base de datos
exports.sendPushOnNotificationCreate = functions.database
  .ref(`${NOTIF_PATH}/{notifId}`)
  .onCreate(async (snap, context) => {
    const notification = snap.val() || {};
    const destinatario = notification.destinatario;

    if (!destinatario) {
      console.log('sendPushOnNotificationCreate: destinatario vacio.');
      return null;
    }

    let targetUserIds = [];
    if (destinatario === 'todos_admins') {
      targetUserIds = await getAdminUserIds();
    } else {
      targetUserIds = [String(destinatario)];
    }

    if (!targetUserIds.length) {
      console.log('sendPushOnNotificationCreate: sin usuarios destino.');
      return null;
    }

    const tokenEntries = await collectTokensForUsers(targetUserIds);
    if (!tokenEntries.length) {
      console.log('sendPushOnNotificationCreate: sin tokens registrados.');
      return null;
    }

    const tokenOwners = new Map();
    tokenEntries.forEach(({ token, userId }) => {
      if (!tokenOwners.has(token)) {
        tokenOwners.set(token, new Set());
      }
      tokenOwners.get(token).add(userId);
    });

    const tokens = Array.from(tokenOwners.keys());
    const title = String(resolveNotificationTitle(notification) || 'Familia Finanzas');
    const body = notification.mensaje ? String(notification.mensaje) : '';
    const url = resolveNotificationUrl(notification);

    const data = {
      notificationId: notification.id || context.params.notifId,
      type: notification.tipo || '',
      url,
      title,
      body,
    };

    const response = await admin.messaging().sendEachForMulticast({ tokens, data });

    const invalidTokens = [];
    response.responses.forEach((resp, index) => {
      if (resp.success) return;
      const code = resp.error?.code || '';
      if (
        code === 'messaging/registration-token-not-registered' ||
        code === 'messaging/invalid-registration-token'
      ) {
        invalidTokens.push(tokens[index]);
      } else {
        console.warn('FCM error:', code, resp.error?.message || resp.error);
      }
    });

    if (invalidTokens.length) {
      await removeInvalidTokens(invalidTokens, tokenOwners);
    }

    console.log(
      `sendPushOnNotificationCreate: enviados ${response.successCount}, fallidos ${response.failureCount}.`
    );

    return null;
  });
