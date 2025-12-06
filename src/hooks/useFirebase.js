import { useMemo } from 'react';
import app, { db } from '../services/firebase';

export const useFirebase = () =>
  useMemo(
    () => ({ app, db, isConfigured: Boolean(app && db) }),
    []
  );
