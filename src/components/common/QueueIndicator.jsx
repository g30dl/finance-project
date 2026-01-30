import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

function QueueIndicator() {
  const { queueCount, syncing, syncQueue, isOnline } = useOfflineQueue();
  const [syncMessage, setSyncMessage] = useState('');
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleSynced = (event) => {
      const detail = event?.detail;
      if (!detail || !detail.processed) return;
      const processed = Number(detail.processed) || 0;
      if (processed <= 0) return;

      setSyncMessage(
        `Conexion restaurada. Se sincronizo${processed > 1 ? 'ron' : ''} ${processed} operacion${
          processed > 1 ? 'es' : ''
        }.`
      );

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setSyncMessage('');
      }, 4000);
    };

    window.addEventListener('offline-queue-synced', handleSynced);

    return () => {
      window.removeEventListener('offline-queue-synced', handleSynced);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (queueCount === 0 && !syncing && !syncMessage) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 space-y-2">
      {syncMessage ? (
        <div className="rounded-full border border-success/30 bg-success/10 px-4 py-2 text-xs font-semibold text-success shadow-lg">
          {syncMessage}
        </div>
      ) : null}
      <button
        type="button"
        onClick={syncQueue}
        disabled={syncing || !isOnline}
        className="flex items-center gap-2 rounded-full bg-info px-4 py-2 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        aria-label="Sincronizar operaciones pendientes"
      >
        {syncing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span>{syncing ? 'Sincronizando...' : `${queueCount} en cola`}</span>
      </button>
    </div>
  );
}

export default QueueIndicator;
