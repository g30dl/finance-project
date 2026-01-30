import { useCallback, useEffect, useState } from 'react';
import { getQueueCount, isOnline as resolveOnline, processQueue } from '../services/offlineQueue';

export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(resolveOnline());
  const [queueCount, setQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const updateQueueCount = useCallback(async () => {
    try {
      const count = await getQueueCount();
      setQueueCount(count);
    } catch (error) {
      console.warn('No se pudo leer la cola offline', error);
    }
  }, []);

  const syncQueue = useCallback(async () => {
    if (!resolveOnline()) return { processed: 0, failed: 0, total: 0 };
    setSyncing(true);
    try {
      const result = await processQueue();
      await updateQueueCount();
      return result;
    } finally {
      setSyncing(false);
    }
  }, [updateQueueCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return () => {};

    const handleOnline = async () => {
      setIsOnline(true);
      await syncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-queue-updated', updateQueueCount);

    updateQueueCount();

    if (resolveOnline()) {
      syncQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-queue-updated', updateQueueCount);
    };
  }, [syncQueue, updateQueueCount]);

  return {
    isOnline,
    queueCount,
    syncing,
    syncQueue,
    updateQueueCount,
  };
};
