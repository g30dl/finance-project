import { useEffect, useMemo, useState } from 'react';
import { off, onValue, ref } from 'firebase/database';
import { db } from '../services/firebase';
import { isUserIncome } from '../utils/transactionHelpers';

const DEFAULT_PERSONAL_STATS = {
  received: 0,
  spent: 0,
  balance: 0,
  categoryBreakdown: {},
  transactionCount: 0,
};

const DEFAULT_REQUEST_STATS = {
  total: 0,
  approved: 0,
  rejected: 0,
  pending: 0,
  approvalRate: 0,
  requestCount: 0,
};

const getItemTimestamp = (item) =>
  Number(item?.fecha ?? item?.fechaSolicitud ?? item?.fechaRespuesta ?? 0);

const filterByPeriod = (item, period) => {
  const timestamp = getItemTimestamp(item);
  if (!timestamp) return false;

  if (period === 'all') return true;

  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  switch (period) {
    case 'week':
      return timestamp >= now - 7 * dayMs;
    case '3months':
      return timestamp >= now - 90 * dayMs;
    case 'year':
      return timestamp >= now - 365 * dayMs;
    case 'month':
    default:
      return timestamp >= now - 30 * dayMs;
  }
};

export const usePersonReport = (userId, period = 'month') => {
  const [transactions, setTransactions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(Boolean(userId));
  const [loadingRequests, setLoadingRequests] = useState(Boolean(userId));
  const [transactionsError, setTransactionsError] = useState(null);
  const [requestsError, setRequestsError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setLoadingTransactions(false);
      setTransactionsError(null);
      return undefined;
    }

    setLoadingTransactions(true);
    setTransactionsError(null);
    const transactionsRef = ref(db, 'familia_finanzas/transacciones');

    const handleValue = (snapshot) => {
      try {
        if (!snapshot.exists()) {
          setTransactions([]);
          setTransactionsError(null);
          return;
        }

        const filtered = Object.values(snapshot.val())
          .filter(Boolean)
          .filter((transaction) => {
            if (transaction.estado && transaction.estado !== 'completada') return false;
            const isUserTx =
              transaction.usuario === userId ||
              transaction.cuentaOrigen === userId ||
              transaction.cuentaDestino === userId;

            return isUserTx && filterByPeriod(transaction, period);
          })
          .map((transaction) => ({
            ...transaction,
            _timestamp: getItemTimestamp(transaction),
          }))
          .sort((a, b) => (b._timestamp || 0) - (a._timestamp || 0));

        setTransactions(filtered);
        setTransactionsError(null);
      } catch (err) {
        console.error('Error loading transactions report:', err);
        setTransactionsError('Error al cargar transacciones');
      } finally {
        setLoadingTransactions(false);
      }
    };

    const handleError = (firebaseError) => {
      console.error('Firebase error:', firebaseError);
      setTransactionsError('Error de conexion');
      setLoadingTransactions(false);
    };

    onValue(transactionsRef, handleValue, handleError);

    return () => {
      off(transactionsRef, 'value', handleValue);
    };
  }, [userId, period]);

  useEffect(() => {
    if (!userId) {
      setRequests([]);
      setLoadingRequests(false);
      setRequestsError(null);
      return undefined;
    }

    setLoadingRequests(true);
    setRequestsError(null);
    const requestsRef = ref(db, 'familia_finanzas/solicitudes');

    const handleValue = (snapshot) => {
      try {
        if (!snapshot.exists()) {
          setRequests([]);
          setRequestsError(null);
          return;
        }

        const filtered = Object.values(snapshot.val())
          .filter(Boolean)
          .filter((request) => request.usuario === userId)
          .filter((request) => filterByPeriod(request, period))
          .map((request) => ({
            ...request,
            _timestamp: getItemTimestamp(request),
          }))
          .sort((a, b) => (b._timestamp || 0) - (a._timestamp || 0));

        setRequests(filtered);
        setRequestsError(null);
      } catch (err) {
        console.error('Error loading requests report:', err);
        setRequestsError('Error al cargar solicitudes');
      } finally {
        setLoadingRequests(false);
      }
    };

    const handleError = (firebaseError) => {
      console.error('Firebase error:', firebaseError);
      setRequestsError('Error de conexion');
      setLoadingRequests(false);
    };

    onValue(requestsRef, handleValue, handleError);

    return () => {
      off(requestsRef, 'value', handleValue);
    };
  }, [userId, period]);

  const personalStats = useMemo(() => {
    if (!transactions.length || !userId) return DEFAULT_PERSONAL_STATS;

    let received = 0;
    let spent = 0;
    const categoryBreakdown = {};

    transactions.forEach((transaction) => {
      if (!transaction) return;
      const amount = Number(transaction.cantidad) || 0;
      const income = isUserIncome(transaction, userId);

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
      transactionCount: transactions.length,
    };
  }, [transactions, userId]);

  const requestStats = useMemo(() => {
    if (!requests.length) return DEFAULT_REQUEST_STATS;

    let total = 0;
    let approved = 0;
    let rejected = 0;
    let pending = 0;

    requests.forEach((request) => {
      if (!request) return;
      const amount = Number(request.cantidad) || 0;
      total += amount;

      switch (request.estado) {
        case 'aprobada':
          approved += amount;
          break;
        case 'rechazada':
          rejected += amount;
          break;
        case 'pendiente':
          pending += amount;
          break;
        default:
          break;
      }
    });

    const approvalRate = total > 0 ? (approved / total) * 100 : 0;

    return {
      total,
      approved,
      rejected,
      pending,
      approvalRate,
      requestCount: requests.length,
    };
  }, [requests]);

  return {
    personalStats,
    requestStats,
    transactions,
    requests,
    loading: loadingTransactions || loadingRequests,
    error: transactionsError || requestsError,
  };
};
