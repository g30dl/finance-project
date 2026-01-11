import { useEffect, useMemo, useState } from 'react';
import { off, onValue, ref } from 'firebase/database';
import { db } from '../services/firebase';
import { filterUserTransactions, getMonthYear } from '../utils/transactionHelpers';

const VALID_TYPES = new Set([
  'gasto_personal',
  'deposito_personal',
  'transferencia_casa_personal',
  'transferencia_personal_casa',
  'transferencia_personal_personal',
]);

export const usePersonalTransactions = (userId) => {
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

        const filtered = filterUserTransactions(snapshot.val(), userId)
          .filter((transaction) => VALID_TYPES.has(transaction.tipo))
          .map((transaction) => ({
            ...transaction,
            _timestamp: transaction.fecha || transaction.fechaSolicitud || 0,
          }))
          .sort((a, b) => (b._timestamp || 0) - (a._timestamp || 0));

        setTransactions(filtered);
        setError(null);
      } catch (err) {
        console.error('Error processing transactions:', err);
        setError('Error al cargar transacciones');
      } finally {
        setLoading(false);
      }
    };

    const handleError = (firebaseError) => {
      console.error('Error listening to transactions:', firebaseError);
      setError('Error de conexion');
      setLoading(false);
    };

    onValue(transactionsRef, handleValue, handleError);

    return () => {
      off(transactionsRef, 'value', handleValue);
    };
  }, [userId]);

  const groupedByMonth = useMemo(() => {
    const groups = [];
    const map = new Map();

    transactions.forEach((transaction) => {
      const label = getMonthYear(transaction._timestamp);
      if (!map.has(label)) {
        const group = { label, items: [] };
        map.set(label, group);
        groups.push(group);
      }
      map.get(label).items.push(transaction);
    });

    return groups;
  }, [transactions]);

  return {
    transactions,
    groupedByMonth,
    loading,
    error,
    isEmpty: transactions.length === 0,
  };
};
