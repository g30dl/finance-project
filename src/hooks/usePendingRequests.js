import { useEffect, useState } from 'react';
import { off, onValue, ref } from 'firebase/database';
import { db } from '../services/firebase';

export const usePendingRequests = (enabled = true) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const requestsRef = ref(db, 'familia_finanzas/solicitudes');

    const handleValue = (snapshot) => {
      try {
        if (!snapshot.exists()) {
          setRequests([]);
          setLoading(false);
          return;
        }

        const pending = Object.values(snapshot.val())
          .filter((request) => request.estado === 'pendiente')
          .sort((a, b) => (a.fechaSolicitud || 0) - (b.fechaSolicitud || 0));

        setRequests(pending);
        setError(null);
      } catch (err) {
        console.error('Error processing pending requests:', err);
        setError('Error al cargar solicitudes');
      } finally {
        setLoading(false);
      }
    };

    const handleError = (firebaseError) => {
      console.error('Error listening to pending requests:', firebaseError);
      setError('Error de conexion');
      setLoading(false);
    };

    onValue(requestsRef, handleValue, handleError);

    return () => {
      off(requestsRef, 'value', handleValue);
    };
  }, [enabled]);

  return {
    requests,
    count: requests.length,
    loading,
    error,
  };
};
