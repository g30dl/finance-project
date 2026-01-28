import { useEffect, useMemo, useState } from 'react';
import { off, onValue, ref } from 'firebase/database';
import { db } from '../services/firebase';
import { isUserIncome } from '../utils/transactionHelpers';

const VALID_TYPES = new Set([
  'deposito_personal',
  'transferencia_casa_personal',
  'transferencia_personal_casa',
  'transferencia_personal_personal',
  'gasto_personal',
  'solicitud_aprobada',
]);

const getMonthRange = (offset = 0) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + offset;
  const start = new Date(year, month, 1, 0, 0, 0).getTime();
  const end = new Date(year, month + 1, 0, 23, 59, 59).getTime();
  return { start, end };
};

const getChangePercent = (current, previous) => {
  if (!previous) {
    return current ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

export const useMonthlyStats = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    const transactionsRef = ref(db, 'familia_finanzas/transacciones');

    const handleValue = (snapshot) => {
      try {
        if (!snapshot.exists()) {
          setTransactions([]);
          setLoading(false);
          return;
        }

        const values = Object.values(snapshot.val() || {});
        const filtered = values.filter((transaction) => {
          if (!transaction) return false;
          if (!VALID_TYPES.has(transaction.tipo)) return false;
          if (transaction.estado && transaction.estado !== 'completada') return false;
          return (
            transaction.usuario === userId ||
            transaction.cuentaOrigen === userId ||
            transaction.cuentaDestino === userId
          );
        });

        setTransactions(filtered);
        setError(null);
      } catch (err) {
        console.error('Error processing monthly stats:', err);
        setError('Error al cargar estadisticas');
      } finally {
        setLoading(false);
      }
    };

    const handleError = (firebaseError) => {
      console.error('Firebase error:', firebaseError);
      setError('Error de conexion');
      setLoading(false);
    };

    onValue(transactionsRef, handleValue, handleError);

    return () => {
      off(transactionsRef, 'value', handleValue);
    };
  }, [userId]);

  const stats = useMemo(() => {
    const currentRange = getMonthRange(0);
    const previousRange = getMonthRange(-1);

    const totals = {
      current: { ingresos: 0, gastos: 0 },
      previous: { ingresos: 0, gastos: 0 },
    };

    transactions.forEach((transaction) => {
      const amount = Number(transaction.cantidad) || 0;
      const timestamp =
        Number(transaction.fecha || transaction.fechaSolicitud || transaction.fechaRespuesta || 0);

      const bucket =
        timestamp >= currentRange.start && timestamp <= currentRange.end
          ? totals.current
          : timestamp >= previousRange.start && timestamp <= previousRange.end
            ? totals.previous
            : null;

      if (!bucket) return;

      const income = isUserIncome(transaction, userId);
      if (income) {
        bucket.ingresos += amount;
      } else {
        bucket.gastos += amount;
      }
    });

    const ingresosChange = getChangePercent(totals.current.ingresos, totals.previous.ingresos);
    const gastosChange = getChangePercent(totals.current.gastos, totals.previous.gastos);

    return {
      ingresos: totals.current.ingresos,
      gastos: totals.current.gastos,
      balance: totals.current.ingresos - totals.current.gastos,
      ingresosChange,
      gastosChange,
    };
  }, [transactions, userId]);

  return { ...stats, loading, error };
};
