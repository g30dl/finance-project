import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';
import app from './firebase';

let analyticsPromise = null;

const getAnalyticsSafe = () => {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }
  if (!import.meta?.env?.VITE_FIREBASE_MEASUREMENT_ID) {
    return Promise.resolve(null);
  }

  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(app) : null))
      .catch(() => null);
  }

  return analyticsPromise;
};

export const trackEvent = (eventName, params = {}) => {
  if (!eventName) return;
  void getAnalyticsSafe().then((analytics) => {
    if (analytics) {
      logEvent(analytics, eventName, params);
    }
  });
};
