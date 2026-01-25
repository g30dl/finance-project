import { useEffect, useMemo, useState } from 'react';
import { off, onValue, ref, update } from 'firebase/database';
import { db } from '../services/firebase';

export const useNotifications = (userId, role) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);
    const notifsRef = ref(db, 'familia_finanzas/notificaciones');

    const handleValue = (snapshot) => {
      try {
        const all = Object.values(snapshot.val() || {}).filter(Boolean);
        const filtered = all.filter((notification) => {
          if (!notification.destinatario) return false;
          if (notification.destinatario === userId) return true;
          return role === 'admin' && notification.destinatario === 'todos_admins';
        });

        const sorted = filtered.sort(
          (a, b) => Number(b.fecha || 0) - Number(a.fecha || 0)
        );

        setNotifications(sorted);
        setError(null);
      } catch (err) {
        console.error('Error reading notifications:', err);
        setError('Error al cargar notificaciones');
      } finally {
        setLoading(false);
      }
    };

    const handleError = (firebaseError) => {
      console.error('Error listening notifications:', firebaseError);
      setError('Error de conexion');
      setLoading(false);
    };

    onValue(notifsRef, handleValue, handleError);

    return () => {
      off(notifsRef, 'value', handleValue);
    };
  }, [userId, role]);

  const markAsRead = async (notifId) => {
    if (!notifId) return;
    await update(ref(db, `familia_finanzas/notificaciones/${notifId}`), {
      leida: true,
    });
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.leida).length,
    [notifications]
  );

  return { notifications, loading, error, unreadCount, markAsRead };
};
