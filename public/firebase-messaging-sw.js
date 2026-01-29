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
  console.warn('FCM config no disponible. Notificaciones push deshabilitadas.');
} else {
  firebase.initializeApp(firebaseConfig);
}

const resolveNotificationUrl = (data = {}) => {
  if (data.url) return data.url;
  if (data.type === 'request_status') return '/notificaciones';
  if (data.type === 'new_request') return '/requests';
  return '/';
};

const getNotificationActions = (data = {}) => {
  if (data.type === 'request_status') {
    return [
      { action: 'view', title: 'Ver estado' },
      { action: 'later', title: 'Mas tarde' },
    ];
  }

  if (data.type === 'new_request') {
    return [
      { action: 'view', title: 'Ver solicitud' },
      { action: 'later', title: 'Mas tarde' },
    ];
  }

  return [];
};

const messaging = firebaseConfig ? firebase.messaging() : null;

if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    const notification = payload.notification || {};
    const data = payload.data || {};
    const title = notification.title || 'Familia Finanzas';
    const body = notification.body || '';
    const icon = notification.icon || '/icons/icon-192.png';

    const actions = getNotificationActions(data);

    self.registration.showNotification(title, {
      body,
      icon,
      badge: '/icons/icon-192.png',
      actions,
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
