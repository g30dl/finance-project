/* eslint-disable no-undef */
// NOTE: This file cannot access Vite env vars; load config from /public/firebase-messaging-config.js.
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

let firebaseConfig = null;
try {
  importScripts('/firebase-messaging-config.js');
  firebaseConfig = self.FIREBASE_MESSAGING_CONFIG || null;
} catch (error) {
  console.warn('FCM config file missing: /firebase-messaging-config.js');
}

if (!firebaseConfig) {
  try {
    importScripts('/__/firebase/init.js');
    firebaseConfig = firebase.app()?.options || null;
  } catch (error) {
    // ignore - not on Firebase Hosting or init.js unavailable
  }
}

if (!firebaseConfig && !firebase.apps?.length) {
  console.warn('FCM config no disponible. Notificaciones push deshabilitadas.');
} else if (!firebase.apps?.length) {
  firebase.initializeApp(firebaseConfig);
}

const resolveNotificationUrl = (data = {}) => {
  if (data.url) return data.url;
  const type = data.type || data.tipo;
  if (type === 'request_status') return '/notificaciones';
  if (type === 'new_request' || type === 'nueva_solicitud') return '/requests';
  if (type === 'solicitud_aprobada' || type === 'solicitud_rechazada') return '/notificaciones';
  if (
    type === 'transferencia_recibida' ||
    type === 'deposito_recibido' ||
    type === 'deposito_personal' ||
    type === 'gasto_personal' ||
    type === 'saldo_bajo' ||
    type?.startsWith?.('gasto_recurrente')
  ) {
    return '/notificaciones';
  }
  return '/';
};

const getNotificationActions = (data = {}) => {
  const type = data.type || data.tipo;
  if (type === 'request_status') {
    return [
      { action: 'view', title: 'Ver estado' },
      { action: 'later', title: 'Mas tarde' },
    ];
  }

  if (type === 'new_request' || type === 'nueva_solicitud') {
    return [
      { action: 'view', title: 'Ver solicitud' },
      { action: 'later', title: 'Mas tarde' },
    ];
  }

  return [];
};

const messaging = firebase.apps?.length ? firebase.messaging() : null;

if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification || {};
    const data = payload.data || {};
    const title = notification.title || data.title || 'Familia Finanzas';
    const body = notification.body || data.body || '';
    const icon = notification.icon || '/icons/icon-192.png';
    const tag = data.notificationId || data.id;

    const actions = getNotificationActions(data);

    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/icons/icon-192.png',
      actions,
      tag,
      data: {
        ...data,
        url: resolveNotificationUrl(data),
      },
    });
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification?.data || {};

  if (event.action === 'later') {
    return;
  }

  const urlToOpen = data.url || resolveNotificationUrl(data);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
      return null;
    })
  );
});
