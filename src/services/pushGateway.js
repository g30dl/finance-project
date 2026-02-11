import { auth } from './firebase';

const PUSH_ENDPOINT = (import.meta.env.VITE_PUSH_ENDPOINT || '').trim();
const TIMEOUT_MS = 8000;

const buildEndpoint = () => {
  if (!PUSH_ENDPOINT) return '';
  return PUSH_ENDPOINT.endsWith('/')
    ? `${PUSH_ENDPOINT}send-notification`
    : `${PUSH_ENDPOINT}/send-notification`;
};

export const triggerPushNotification = async (notificationId) => {
  if (!PUSH_ENDPOINT) return { success: false, skipped: true, reason: 'missing-endpoint' };
  if (!notificationId) return { success: false, skipped: true, reason: 'missing-id' };
  if (typeof window === 'undefined') return { success: false, skipped: true, reason: 'server' };
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { success: false, skipped: true, reason: 'offline' };
  }

  const token = await auth.currentUser?.getIdToken?.().catch(() => null);
  if (!token) return { success: false, skipped: true, reason: 'missing-token' };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(buildEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notificationId }),
      signal: controller.signal,
    });

    if (!response.ok) {
      return { success: false, skipped: false, reason: 'request-failed' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, skipped: false, reason: 'request-error' };
  } finally {
    clearTimeout(timeout);
  }
};
