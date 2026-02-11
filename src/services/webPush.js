import { auth } from './firebase';

const PUSH_ENDPOINT = (import.meta.env.VITE_PUSH_ENDPOINT || '').trim();
const TIMEOUT_MS = 8000;

const buildEndpoint = (path) => {
  if (!PUSH_ENDPOINT) return '';
  return PUSH_ENDPOINT.endsWith('/')
    ? `${PUSH_ENDPOINT}${path}`
    : `${PUSH_ENDPOINT}/${path}`;
};

const getAuthToken = async () => {
  const token = await auth.currentUser?.getIdToken?.().catch(() => null);
  return token;
};

export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return { success: false, skipped: true, reason: 'no-sw-support' };
  }

  try {
    const registration = await navigator.serviceWorker.register('/web-push-sw.js', {
      scope: '/',
    });
    console.log('Service Worker registrado:', registration);
    return { success: true, registration };
  } catch (error) {
    console.error('Error registrando Service Worker:', error);
    return { success: false, skipped: false, reason: 'sw-registration-failed' };
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return { success: false, skipped: true, reason: 'no-notification-support' };
  }

  if (Notification.permission === 'granted') {
    return { success: true, permission: 'granted' };
  }

  if (Notification.permission === 'denied') {
    return { success: false, skipped: true, permission: 'denied' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return { success: true, permission: 'granted' };
    }
    return { success: false, skipped: true, permission };
  } catch (error) {
    console.error('Error solicitando permisos de notificación:', error);
    return { success: false, skipped: false, reason: 'permission-request-failed' };
  }
};

export const subscribeToPushNotifications = async () => {
  if (!PUSH_ENDPOINT) {
    return { success: false, skipped: true, reason: 'missing-endpoint' };
  }

  if (!('serviceWorker' in navigator)) {
    return { success: false, skipped: true, reason: 'no-sw-support' };
  }

  if (!('PushManager' in window)) {
    return { success: false, skipped: true, reason: 'no-push-support' };
  }

  const token = await getAuthToken();
  if (!token) {
    return { success: false, skipped: true, reason: 'missing-token' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // 1. Obtener la clave VAPID pública del servidor
    const publicKeyResponse = await fetch(buildEndpoint('public-key'), {
      signal: controller.signal,
    });

    if (!publicKeyResponse.ok) {
      return { success: false, skipped: false, reason: 'failed-to-get-public-key' };
    }

    const { publicKey } = await publicKeyResponse.json();
    if (!publicKey) {
      return { success: false, skipped: false, reason: 'invalid-public-key' };
    }

    // 2. Obtener el Service Worker registration
    const registration = await navigator.serviceWorker.ready;

    // 3. Suscribirse a push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // 4. Enviar la suscripción al servidor
    const subscribeResponse = await fetch(buildEndpoint('subscribe'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(subscription.toJSON()),
      signal: controller.signal,
    });

    if (!subscribeResponse.ok) {
      return { success: false, skipped: false, reason: 'subscribe-failed' };
    }

    console.log('Suscripción a push exitosa');
    return { success: true, subscription };
  } catch (error) {
    console.error('Error en suscripción:', error);
    return { success: false, skipped: false, reason: 'subscription-error' };
  } finally {
    clearTimeout(timeout);
  }
};

export const unsubscribeFromPushNotifications = async () => {
  if (!PUSH_ENDPOINT) {
    return { success: false, skipped: true, reason: 'missing-endpoint' };
  }

  if (!('serviceWorker' in navigator)) {
    return { success: false, skipped: true, reason: 'no-sw-support' };
  }

  const token = await getAuthToken();
  if (!token) {
    return { success: false, skipped: true, reason: 'missing-token' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return { success: true, skipped: true, reason: 'no-active-subscription' };
    }

    // Notificar al servidor
    await fetch(buildEndpoint('unsubscribe'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
      signal: controller.signal,
    });

    // Desuscribirse del push manager
    await subscription.unsubscribe();
    console.log('Desuscripción exitosa');
    return { success: true };
  } catch (error) {
    console.error('Error en desuscripción:', error);
    return { success: false, skipped: false, reason: 'unsubscribe-error' };
  } finally {
    clearTimeout(timeout);
  }
};

export const isPushNotificationSupported = () => {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

// Utilidad para convertir la clave VAPID de base64url a Uint8Array
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};
