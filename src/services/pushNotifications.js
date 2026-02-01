import { deleteToken, getMessaging, getToken, isSupported } from 'firebase/messaging';
import { ref, remove, set } from 'firebase/database';
import app, { db } from './firebase';

const STORAGE_KEY = 'ff_push_token_v1';
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const FCM_SCOPE = '/firebase-cloud-messaging-push-scope';

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

const getMessagingSafe = async () => {
  if (!VAPID_KEY) return null;
  if (typeof window === 'undefined' || !('Notification' in window)) return null;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  return getMessaging(app);
};

const getServiceWorkerRegistration = async () => {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration(FCM_SCOPE);
    if (existing) return existing;
    return await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: FCM_SCOPE,
    });
  } catch (error) {
    return null;
  }
};

export const registerPushToken = async (userId) => {
  if (!userId) {
    return { success: false, error: 'Usuario no identificado.' };
  }
  if (!VAPID_KEY) {
    return { success: false, error: 'VAPID key no configurada.' };
  }

  if (typeof Notification === 'undefined') {
    return { success: false, error: 'Notificaciones no soportadas.' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { success: false, error: 'Permiso de notificaciones denegado.' };
  }

  const messaging = await getMessagingSafe();
  if (!messaging) {
    return { success: false, error: 'Messaging no disponible en este dispositivo.' };
  }

  const swRegistration = await getServiceWorkerRegistration();

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: swRegistration || undefined,
  }).catch(() => null);

  if (!token) {
    return { success: false, error: 'No se pudo obtener token de notificaciones.' };
  }

  const tokenPath = `familia_finanzas/push_tokens/${userId}/${token}`;
  await set(ref(db, tokenPath), {
    token,
    createdAt: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  });

  safeStorage.set(STORAGE_KEY, token);

  return { success: true, token };
};

export const unregisterPushToken = async (userId) => {
  const token = safeStorage.get(STORAGE_KEY);

  const messaging = await getMessagingSafe();
  if (messaging) {
    try {
      await deleteToken(messaging);
    } catch (error) {
      // ignore delete errors
    }
  }

  if (userId && token) {
    const tokenPath = `familia_finanzas/push_tokens/${userId}/${token}`;
    await remove(ref(db, tokenPath));
  }

  safeStorage.remove(STORAGE_KEY);

  return { success: true };
};
