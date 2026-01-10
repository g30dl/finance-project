import { useEffect, useState } from 'react';
import { off, onValue, ref } from 'firebase/database';
import { db } from '../services/firebase';

export const useFirebaseData = (path) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!path) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const dataRef = ref(db, path);
    const handleValue = (snapshot) => {
      setData(snapshot.val());
      setLoading(false);
      setError(null);
    };

    const handleError = (firebaseError) => {
      console.error('Error reading from Firebase:', firebaseError);
      setError(firebaseError?.message || 'Error al leer datos.');
      setLoading(false);
    };

    onValue(dataRef, handleValue, handleError);

    return () => {
      off(dataRef, 'value', handleValue);
    };
  }, [path]);

  return { data, loading, error };
};
