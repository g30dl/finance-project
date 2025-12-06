import { useEffect, useState } from 'react';

export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const enqueue = (item) => setQueue((prev) => [...prev, item]);
  const clearQueue = () => setQueue([]);

  return { isOnline, queue, enqueue, clearQueue };
};
