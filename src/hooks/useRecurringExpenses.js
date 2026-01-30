import { useEffect, useRef, useState } from 'react';
import { checkNotificationNeeded, processOverdueExpenses } from '../services/recurringExpenses';

const SESSION_KEY = 'ff_recurring_processed_v1';

export const useRecurringExpenses = (adminId, enabled = true) => {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !adminId) return;
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let mounted = true;

    const run = async () => {
      let shouldSkip = false;
      const hasWindow = typeof window !== 'undefined';
      try {
        if (hasWindow && window.sessionStorage) {
          if (sessionStorage.getItem(SESSION_KEY)) {
            shouldSkip = true;
          }
        }
      } catch (storageError) {
        console.warn('No se pudo acceder a sessionStorage', storageError);
      }

      if (hasWindow && window.__recurringProcessing) {
        shouldSkip = true;
      }

      if (shouldSkip) {
        if (mounted) {
          setResult({
            success: true,
            processed: 0,
            successful: 0,
            failed: 0,
            skipped: true,
          });
        }
        return;
      }

      if (hasWindow) {
        window.__recurringProcessing = true;
      }

      setProcessing(true);
      setError(null);

      try {
        const processResult = await processOverdueExpenses(adminId);
        await checkNotificationNeeded();

        if (mounted) {
          setResult(processResult);
        }
      } catch (err) {
        console.error('Error en useRecurringExpenses:', err);
        if (mounted) {
          setError(err?.message || 'Error procesando gastos recurrentes');
        }
      } finally {
        if (mounted) {
          setProcessing(false);
        }
        try {
          if (hasWindow && window.sessionStorage) {
            sessionStorage.setItem(SESSION_KEY, String(Date.now()));
          }
        } catch (storageError) {
          console.warn('No se pudo guardar sessionStorage', storageError);
        } finally {
          if (hasWindow) {
            window.__recurringProcessing = false;
          }
        }
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [adminId, enabled]);

  return {
    processing,
    result,
    error,
  };
};
