import { useEffect, useMemo, useState } from 'react';
import { off, onValue, ref } from 'firebase/database';
import { db } from '../services/firebase';

export const useUserRequests = (userId) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setRequests([]);
      setLoading(false);
      setError(null);
      return;
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

        const allRequests = snapshot.val();
        const userRequests = Object.values(allRequests)
          .filter((request) => request.usuario === userId)
          .sort((a, b) => (b.fechaSolicitud || 0) - (a.fechaSolicitud || 0));

        setRequests(userRequests);
        setError(null);
      } catch (err) {
        console.error('Error processing requests:', err);
        setError('Error al cargar solicitudes');
      } finally {
        setLoading(false);
      }
    };

    const handleError = (firebaseError) => {
      console.error('Error listening to requests:', firebaseError);
      setError('Error de conexion');
      setLoading(false);
    };

    onValue(requestsRef, handleValue, handleError);

    return () => {
      off(requestsRef, 'value', handleValue);
    };
  }, [userId]);

  const getByStatus = (status) =>
    requests.filter((request) => request.estado === status);

  const counts = useMemo(() => {
    const pending = getByStatus('pendiente').length;
    const approved = getByStatus('aprobada').length;
    const rejected = getByStatus('rechazada').length;

    return {
      total: requests.length,
      pending,
      approved,
      rejected,
    };
  }, [requests]);

  return {
    requests,
    loading,
    error,
    counts,
    getPending: () => getByStatus('pendiente'),
    getApproved: () => getByStatus('aprobada'),
    getRejected: () => getByStatus('rechazada'),
    getByStatus,
  };
};
