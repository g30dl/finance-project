import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CATEGORIES } from '../utils/constants';
import { useFirebase } from '../hooks/useFirebase';
import {
  createRequest as createDbRequest,
  updateRequestStatus as updateDbRequestStatus,
  watchRequests,
} from '../services/database';

const STORAGE_KEY = 'ff_requests';

const normalizeRequests = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  return Object.entries(data).map(([id, value]) => ({ id, ...value }));
};

const sortRequests = (items) =>
  [...items].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

const loadStoredRequests = () => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? sortRequests(JSON.parse(stored)) : [];
  } catch (error) {
    console.warn('No se pudo leer solicitudes locales', error);
    return [];
  }
};

const persistRequests = (items) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('No se pudo guardar solicitudes locales', error);
  }
};

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { isConfigured } = useFirebase();
  const [requests, setRequests] = useState(() => loadStoredRequests());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    persistRequests(requests);
  }, [requests]);

  useEffect(() => {
    if (!isConfigured) return undefined;
    setLoading(true);
    const unsubscribe = watchRequests((snapshot) => {
      const parsed = sortRequests(normalizeRequests(snapshot));
      setRequests(parsed);
      setLoading(false);
    });
    return () => unsubscribe?.();
  }, [isConfigured]);

  const addRequest = useCallback(
    async (payload) => {
      const now = Date.now();
      const newRequest = {
        id: payload.id || crypto.randomUUID?.() || String(now),
        amount: Number(payload.amount) || 0,
        category: payload.category,
        reason: payload.reason,
        requesterId: payload.requesterId,
        requesterName: payload.requesterName,
        status: payload.status || 'pending',
        createdAt: payload.createdAt || now,
        updatedAt: payload.updatedAt || now,
      };

      setRequests((prev) => sortRequests([newRequest, ...prev]));

      if (isConfigured) {
        try {
          await createDbRequest(newRequest);
        } catch (error) {
          console.warn('No se pudo guardar en Firebase', error);
        }
      }

      return newRequest;
    },
    [isConfigured]
  );

  const updateStatus = useCallback(
    async (id, status) => {
      setRequests((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status, updatedAt: Date.now() } : item
        )
      );

      if (isConfigured) {
        try {
          await updateDbRequestStatus(id, status);
        } catch (error) {
          console.warn('No se pudo actualizar en Firebase', error);
        }
      }
    },
    [isConfigured]
  );

  const value = useMemo(
    () => ({
      requests,
      categories: CATEGORIES,
      addRequest,
      updateStatus,
      loading,
    }),
    [requests, addRequest, updateStatus, loading]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider');
  }
  return context;
};
