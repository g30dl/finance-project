import { get, onValue, push, ref, update } from 'firebase/database';
import { db } from './firebase';

const ensureDb = () => {
  if (!db) {
    throw new Error('Database is not configured. Set Firebase env vars first.');
  }
  return db;
};

const USERS_PATH = 'familia_finanzas/usuarios';
const CASA_BALANCE_PATH = 'familia_finanzas/cuentas/dinero_casa/saldo';
const PERSONAL_ACCOUNTS_PATH = 'familia_finanzas/cuentas/personales';

export const createRequest = (data) => {
  const requestRef = ref(ensureDb(), 'requests');
  return push(requestRef, {
    ...data,
    status: data?.status || 'pending',
    createdAt: Date.now(),
  });
};

export const watchRequests = (callback) => {
  const requestRef = ref(ensureDb(), 'requests');
  return onValue(requestRef, (snapshot) => {
    const value = snapshot.val() || {};
    callback(value);
  });
};

export const updateRequestStatus = (id, status) => {
  const requestRef = ref(ensureDb(), `requests/${id}`);
  return update(requestRef, { status, updatedAt: Date.now() });
};

export const getUsers = async () => {
  try {
    const snapshot = await get(ref(ensureDb(), USERS_PATH));
    const value = snapshot.val() || {};
    return Object.entries(value).map(([userId, user]) => ({
      userId,
      ...user,
    }));
  } catch (error) {
    console.error('Error al leer usuarios:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  if (!userId) return null;

  try {
    const snapshot = await get(ref(ensureDb(), `${USERS_PATH}/${userId}`));
    if (!snapshot.exists()) return null;
    return snapshot.val();
  } catch (error) {
    console.error('Error al leer usuario:', error);
    throw error;
  }
};

export const getCasaBalance = async () => {
  try {
    const snapshot = await get(ref(ensureDb(), CASA_BALANCE_PATH));
    const value = snapshot.val();
    return Number(value) || 0;
  } catch (error) {
    console.error('Error al leer saldo de casa:', error);
    throw error;
  }
};

export const getPersonalBalance = async (userId) => {
  if (!userId) return 0;

  try {
    const snapshot = await get(
      ref(ensureDb(), `${PERSONAL_ACCOUNTS_PATH}/${userId}/saldo`)
    );
    const value = snapshot.val();
    return Number(value) || 0;
  } catch (error) {
    console.error('Error al leer saldo personal:', error);
    throw error;
  }
};

export const getAllPersonalAccounts = async () => {
  try {
    const snapshot = await get(ref(ensureDb(), PERSONAL_ACCOUNTS_PATH));
    return snapshot.val() || {};
  } catch (error) {
    console.error('Error al leer cuentas personales:', error);
    throw error;
  }
};
