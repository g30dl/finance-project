import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  CUSTOM_CLAIMS_STORAGE_KEYS,
  getStoredRole,
  storeUserRole,
} from '../services/customClaims';

const safeSet = (key, value) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // noop
  }
};

const safeRemove = (key) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // noop
  }
};

export const useAuthListener = ({ role, onAuthChange } = {}) => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser?.uid) {
        safeSet(CUSTOM_CLAIMS_STORAGE_KEYS.firebaseUid, firebaseUser.uid);

        const resolvedRole = getStoredRole(firebaseUser.uid) || role || null;
        if (resolvedRole) {
          storeUserRole(firebaseUser.uid, resolvedRole);
          safeSet('firebase_role', resolvedRole);
        }

        onAuthChange?.(firebaseUser);
        return;
      }

      safeRemove(CUSTOM_CLAIMS_STORAGE_KEYS.firebaseUid);
      safeRemove('firebase_role');
      onAuthChange?.(null);
    });

    return () => unsubscribe();
  }, [role, onAuthChange]);
};

export default useAuthListener;
