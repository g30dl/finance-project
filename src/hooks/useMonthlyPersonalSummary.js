import { useEffect, useMemo, useState } from 'react';
import { off, onValue, ref } from 'firebase/database';
import { db } from '../services/firebase';
import { isUserIncome } from '../utils/transactionHelpers';

const DEFAULT_SUMMARY = {
  received: 0,
  spent: 0,
  balance: 0,
  categoryBreakdown: {},
};

const VALID_TYPES = new Set([
  'deposito_personal',
  'transferencia_casa_personal',
  'transferencia_personal_casa',
  'transferencia_personal_personal',
  'gasto_personal',
  'solicitud_aprobada',
]);

const getMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startOfMonth = new Date(year, month, 1, 0, 0, 0).getTime();
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59).getTime();

  return { startOfMonth, endOfMonth };
};

export const useMonthlyPersonalSummary = (userId) => {
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

        const { startOfMonth, endOfMonth } = getMonthRange();
        const monthTransactions = Object.values(snapshot.val())
          .filter((transaction) => {
            if (!transaction) return false;
            if (!VALID_TYPES.has(transaction.tipo)) return false;
            if (transaction.estado && transaction.estado !== 'completada') return false;

            const fecha = transaction.fecha || transaction.fechaSolicitud || 0;
            const inRange = fecha >= startOfMonth && fecha <= endOfMonth;
            const isUserTx =
              transaction.usuario === userId ||
              transaction.cuentaOrigen === userId ||
              transaction.cuentaDestino === userId;

            return inRange && isUserTx;
          })
          .map((transaction) => ({
            ...transaction,
            _timestamp: transaction.fecha || transaction.fechaSolicitud || 0,
          }))
          .sort((a, b) => (b._timestamp || 0) - (a._timestamp || 0));

        setTransactions(monthTransactions);
        setError(null);
      } catch (err) {
        console.error('Error processing monthly summary:', err);
        setError('Error al calcular resumen');
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

  const summary = useMemo(() => {
    if (!transactions.length) return DEFAULT_SUMMARY;

    let received = 0;
    let spent = 0;
    const categoryBreakdown = {};

    transactions.forEach((transaction) => {
      const amount = Number(transaction.cantidad) || 0;
      const income =
        transaction.tipo === 'solicitud_aprobada'
          ? transaction.usuario === userId
          : isUserIncome(transaction, userId);

      if (income) {
        received += amount;
      } else {
        spent += amount;
        const category = transaction.categoria;
        if (category && category !== 'N/A') {
          categoryBreakdown[category] = (categoryBreakdown[category] || 0) + amount;
        }
      }
    });

    return {
      received,
      spent,
      balance: received - spent,
      categoryBreakdown,
    };
  }, [transactions, userId]);

  return { summary, loading, error };
};
