const DB_NAME = 'familia_finanzas_offline';
const STORE_NAME = 'operationsQueue';
const DB_VERSION = 1;

const requestToPromise = (request) =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const transactionComplete = (tx) =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });

export const initDB = () =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB no disponible'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });

export const addToQueue = async (operation) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  const item = {
    id: operation.id || `offline_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: operation.type,
    payload: operation.payload,
    timestamp: Number(operation.timestamp) || Date.now(),
    retries: 0,
    maxRetries: operation.maxRetries || 3,
    status: 'pending',
    lastError: null,
    syncedAt: null,
  };

  await requestToPromise(store.add(item));
  await transactionComplete(tx);
  db.close();
  return item;
};

export const getQueuedOperations = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const all = await requestToPromise(store.getAll());
  await transactionComplete(tx);
  db.close();

  return all.filter(
    (op) =>
      (op.status === 'pending' || op.status === 'syncing') &&
      Number(op.retries) < Number(op.maxRetries || 0)
  );
};

export const removeFromQueue = async (id) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await requestToPromise(store.delete(id));
  await transactionComplete(tx);
  db.close();
};

export const updateOperation = async (id, updates) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const operation = await requestToPromise(store.get(id));

  if (operation) {
    const next = { ...operation, ...updates };
    await requestToPromise(store.put(next));
  }

  await transactionComplete(tx);
  db.close();
};

export const cleanupQueue = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const all = await requestToPromise(store.getAll());
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  all.forEach((op) => {
    if (op.timestamp < thirtyDaysAgo || op.retries >= op.maxRetries) {
      store.delete(op.id);
    }
  });

  await transactionComplete(tx);
  db.close();
};

export { DB_NAME, STORE_NAME };
