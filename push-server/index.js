const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const webpush = require('web-push');

const {
  FIREBASE_SERVICE_ACCOUNT,
  FIREBASE_DATABASE_URL,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  ALLOWED_ORIGINS,
  PORT = '8080',
} = process.env;

if (!FIREBASE_DATABASE_URL) {
  throw new Error('Missing FIREBASE_DATABASE_URL env var.');
}

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error('Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY env vars.');
}

let serviceAccount = null;
if (FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

if (!serviceAccount) {
  throw new Error('Missing FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS.');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: FIREBASE_DATABASE_URL,
});

const db = admin.database();

// Configurar Web Push con claves VAPID
webpush.setVapidDetails(
  'mailto:notificaciones@familia-finanzas.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const NOTIF_PATH = 'familia_finanzas/notificaciones';
const USERS_PATH = 'familia_finanzas/usuarios';
const SUBSCRIPTIONS_PATH = 'familia_finanzas/push_subscriptions';
const AUTH_MAP_PATH = 'familia_finanzas/auth_map';

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const resolveUserIdByUid = async (uid, options = {}) => {
  const { attempts = 6, delayMs = 400 } = options;
  for (let i = 0; i < attempts; i += 1) {
    const snap = await db.ref(`${AUTH_MAP_PATH}/${uid}`).once('value');
    const userId = snap.val();
    if (userId) return userId;
    if (i < attempts - 1) {
      await sleep(delayMs);
    }
  }
  return null;
};

const getRoleContext = async (uid) => {
  const mappedUserId = await resolveUserIdByUid(uid, { attempts: 6, delayMs: 400 });
  const userId = mappedUserId || uid;
  const userSnap = await db.ref(`${USERS_PATH}/${userId}`).once('value');
  const userData = userSnap.val() || {};
  return {
    userId: String(userId || ''),
    role: userData.rol || null,
  };
};

const getAdminUserIds = async () => {
  const snap = await db.ref(USERS_PATH).once('value');
  const users = snap.val() || {};
  return Object.entries(users)
    .filter(([, user]) => user?.rol === 'admin' && user?.activo !== false)
    .map(([userId]) => String(userId));
};

const collectSubscriptionsForUsers = async (userIds = []) => {
  const entries = [];
  await Promise.all(
    userIds.map(async (userId) => {
      const snap = await db.ref(`${SUBSCRIPTIONS_PATH}/${userId}`).once('value');
      const subscriptions = snap.val() || {};
      Object.keys(subscriptions).forEach((subscriptionKey) => {
        const subscription = subscriptions[subscriptionKey];
        if (subscription?.endpoint) {
          entries.push({
            endpoint: subscription.endpoint,
            auth: subscription.auth,
            p256dh: subscription.p256dh,
            userId,
            subscriptionKey,
          });
        }
      });
    })
  );
  return entries;
};

const removeInvalidSubscriptions = async (invalidSubscriptions) => {
  const deletes = [];
  invalidSubscriptions.forEach(({ userId, subscriptionKey }) => {
    deletes.push(db.ref(`${SUBSCRIPTIONS_PATH}/${userId}/${subscriptionKey}`).remove());
  });
  if (deletes.length) {
    await Promise.all(deletes);
  }
};

const chunkArray = (items, size) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const sendWebPushNotifications = async (subscriptions, payloadData) => {
  let successCount = 0;
  let failureCount = 0;
  const invalidSubscriptions = [];

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(subscription.endpoint, JSON.stringify(payloadData));
      successCount += 1;
    } catch (error) {
      failureCount += 1;
      const code = error?.statusCode || 0;

      // 410 Gone significa que la suscripción ya no es válida
      if (code === 410 || code === 404) {
        invalidSubscriptions.push(subscription);
      } else if (code === 401 || code === 403) {
        // Credenciales inválidas - probablemente suscripción corrupta
        invalidSubscriptions.push(subscription);
      } else {
        console.warn('Web Push error:', code, error?.message || error);
      }
    }
  }

  return { successCount, failureCount, invalidSubscriptions };
};

const app = express();

const allowedOrigins = (ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    methods: ['POST', 'GET', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '256kb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/public-key', (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

app.post('/subscribe', async (req, res) => {
  try {
    const authHeader = req.get('authorization') || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Missing bearer token.' });
    }

    const decoded = await admin.auth().verifyIdToken(match[1]);
    const { userId } = await getRoleContext(decoded.uid);
    if (!userId) {
      return res.status(403).json({ success: false, error: 'Usuario no autorizado.' });
    }

    const subscription = req.body;
    if (!subscription?.endpoint) {
      return res.status(400).json({ success: false, error: 'Suscripcion inválida.' });
    }

    // Usar el endpoint como clave única para evitar duplicados
    const subscriptionKey = Buffer.from(subscription.endpoint).toString('base64').slice(0, 20);

    await db.ref(`${SUBSCRIPTIONS_PATH}/${userId}/${subscriptionKey}`).set({
      endpoint: subscription.endpoint,
      auth: subscription.keys?.auth || '',
      p256dh: subscription.keys?.p256dh || '',
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('subscribe error:', error);
    return res.status(500).json({ success: false, error: 'Error al guardar suscripcion.' });
  }
});

app.post('/unsubscribe', async (req, res) => {
  try {
    const authHeader = req.get('authorization') || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Missing bearer token.' });
    }

    const decoded = await admin.auth().verifyIdToken(match[1]);
    const { userId } = await getRoleContext(decoded.uid);
    if (!userId) {
      return res.status(403).json({ success: false, error: 'Usuario no autorizado.' });
    }

    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ success: false, error: 'Endpoint requerido.' });
    }

    const subscriptionKey = Buffer.from(endpoint).toString('base64').slice(0, 20);
    await db.ref(`${SUBSCRIPTIONS_PATH}/${userId}/${subscriptionKey}`).remove();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('unsubscribe error:', error);
    return res.status(500).json({ success: false, error: 'Error al desuscribir.' });
  }
});

app.post('/send-notification', async (req, res) => {
  try {
    const authHeader = req.get('authorization') || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Missing bearer token.' });
    }

    const decoded = await admin.auth().verifyIdToken(match[1]);
    const { userId, role } = await getRoleContext(decoded.uid);
    if (!userId || !role) {
      return res.status(403).json({ success: false, error: 'Usuario no autorizado.' });
    }

    const notificationId = String(req.body?.notificationId || '').trim();
    if (!notificationId) {
      return res.status(400).json({ success: false, error: 'notificationId requerido.' });
    }

    const notifSnap = await db.ref(`${NOTIF_PATH}/${notificationId}`).once('value');
    if (!notifSnap.exists()) {
      return res.status(404).json({ success: false, error: 'Notificacion no encontrada.' });
    }

    const notification = notifSnap.val() || {};
    const destinatario = notification.destinatario;
    if (!destinatario) {
      return res.status(400).json({ success: false, error: 'Notificacion sin destinatario.' });
    }

    if (destinatario === 'todos_admins') {
      const isOwner =
        notification?.usuario && String(notification.usuario) === String(userId);
      const isAllowedUserNotification = notification?.tipo === 'nueva_solicitud' && isOwner;
      if (role !== 'admin' && !isAllowedUserNotification) {
        return res.status(403).json({ success: false, error: 'No autorizado.' });
      }
    } else if (role !== 'admin' && String(destinatario) !== String(userId)) {
      return res.status(403).json({ success: false, error: 'No autorizado.' });
    }

    const targetUserIds =
      destinatario === 'todos_admins' ? await getAdminUserIds() : [String(destinatario)];

    if (!targetUserIds.length) {
      return res.status(200).json({ success: true, sent: 0, skipped: true });
    }

    const subscriptionEntries = await collectSubscriptionsForUsers(targetUserIds);
    if (!subscriptionEntries.length) {
      return res.status(200).json({ success: true, sent: 0, skipped: true });
    }

    const payloadData = {
      notificationId: String(notification.id || notificationId),
      type: String(notification.tipo || ''),
      url: String(resolveNotificationUrl(notification) || '/'),
      title: String(resolveNotificationTitle(notification) || 'Familia Finanzas'),
      body: String(notification.mensaje || ''),
      sound: 'notification-sound.mp3',
    };

    const result = await sendWebPushNotifications(subscriptionEntries, payloadData);
    if (result.invalidSubscriptions.length) {
      await removeInvalidSubscriptions(result.invalidSubscriptions);
    }

    return res.status(200).json({
      success: true,
      sent: result.successCount,
      failed: result.failureCount,
    });
  } catch (error) {
    console.error('send-notification error:', error);
    return res.status(500).json({ success: false, error: 'Error enviando notificacion.' });
  }
});

app.listen(Number(PORT), () => {
  console.log(`Push server listening on ${PORT}`);
});
