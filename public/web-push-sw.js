/* eslint-disable no-undef */
// Service Worker para Web Push API (Sin FCM)

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

const playNotificationSound = async () => {
  try {
    // Crear un AudioContext y reproducir el sonido
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Fetch del archivo de sonido
    const response = await fetch('/notification-sound.mp3');
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  } catch (error) {
    console.warn('No se pudo reproducir sonido de notificación:', error);
    // No es crítico si falla el sonido
  }
};

self.addEventListener('push', (event) => {
  if (!event.data) {
    console.warn('Push recibido sin datos');
    return;
  }

  let payloadData = {};
  try {
    payloadData = event.data.json();
  } catch (error) {
    payloadData = { body: event.data.text() };
  }

  const title = payloadData.title || 'Familia Finanzas';
  const body = payloadData.body || '';
  const icon = '/icons/icon-192.png';
  const tag = payloadData.notificationId || Date.now().toString();

  const notificationOptions = {
    body,
    icon,
    badge: '/icons/icon-192.png',
    tag,
    requireInteraction: false,
    data: {
      ...payloadData,
      url: resolveNotificationUrl(payloadData),
    },
  };

  // Reproducir sonido
  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
      .then(() => playNotificationSound())
      .catch((error) => {
        console.error('Error mostrando notificación:', error);
      })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification?.data || {};
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

self.addEventListener('notificationclose', (event) => {
  // Opcional: Registrar cuando el usuario cierre la notificación
  console.log('Notificación cerrada:', event.notification?.tag);
});
