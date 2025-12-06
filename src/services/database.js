import { ref, push, onValue, update } from 'firebase/database';
import { db } from './firebase';

const ensureDb = () => {
  if (!db) {
    throw new Error('Database is not configured. Set Firebase env vars first.');
  }
  return db;
};

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
  const requestRef = ref(ensureDb(), equests/);
  return update(requestRef, { status, updatedAt: Date.now() });
};
