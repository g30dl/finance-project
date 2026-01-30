import { get, ref } from 'firebase/database';
import { createRequest } from './requests';
import { createPersonalExpense } from './personalExpenses';
import { db } from './firebase';
import {
  addToQueue,
  getQueuedOperations,
  removeFromQueue,
  updateOperation,
} from '../utils/indexedDBHelper';

let processingPromise = null;

const CASA_BALANCE_PATH = 'familia_finanzas/cuentas/dinero_casa/saldo';

const notifyQueueUpdate = () => {
  if (typeof window === 'undefined') return;

  const event =
    typeof window.CustomEvent === 'function'
      ? new CustomEvent('offline-queue-updated')
      : new Event('offline-queue-updated');

  window.dispatchEvent(event);
};

const notifyQueueSynced = (detail) => {
  if (typeof window === 'undefined') return;
  if (!detail || !detail.processed) return;

  const event =
    typeof window.CustomEvent === 'function'
      ? new CustomEvent('offline-queue-synced', { detail })
      : new Event('offline-queue-synced');

  window.dispatchEvent(event);
};

const buildOperationId = (type) => {
  const suffix = Math.random().toString(36).slice(2, 8);
  const timestamp = Date.now();
  if (type === 'CREATE_REQUEST') return `offline_req_${timestamp}_${suffix}`;
  if (type === 'CREATE_EXPENSE') return `offline_exp_${timestamp}_${suffix}`;
  return `offline_op_${timestamp}_${suffix}`;
};

export const isOnline = () => {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
};

const withOfflineMetadata = (operation) => {
  const timestamp = Number(operation.timestamp) || Date.now();
  const payload = {
    ...(operation.payload || {}),
    createdAt: operation.payload?.createdAt || timestamp,
  };

  return {
    ...operation,
    id: operation.id || buildOperationId(operation.type),
    timestamp,
    payload,
  };
};

export const enqueueOrExecute = async (operation) => {
  if (!operation?.type) {
    throw new Error('Operacion invalida');
  }
  if (isOnline()) {
    const result = await executeOperation(operation);
    return {
      success: true,
      queued: false,
      result,
    };
  }

  const toQueue = withOfflineMetadata(operation);
  const queued = await addToQueue(toQueue);
  notifyQueueUpdate();

  return {
    success: true,
    queued: true,
    id: queued.id,
    message: 'Operacion guardada. Se sincronizara al recuperar conexion.',
  };
};

const executeOperation = async (operation) => {
  switch (operation.type) {
    case 'CREATE_REQUEST':
      return createRequest({
        ...(operation.payload || {}),
        requestId: (() => {
          const baseId = operation.payload?.requestId || operation.id;
          if (!baseId) return undefined;
          const normalized = String(baseId);
          return normalized.startsWith('solicitud_') ? normalized : `solicitud_${normalized}`;
        })(),
        createdAt: operation.payload?.createdAt || operation.timestamp,
      });
    case 'CREATE_EXPENSE':
      return createPersonalExpense({
        ...(operation.payload || {}),
        transactionId: (() => {
          const baseId = operation.payload?.transactionId || operation.id || Date.now();
          const normalized = String(baseId);
          return normalized.startsWith('trans_') ? normalized : `trans_${normalized}`;
        })(),
        createdAt: operation.payload?.createdAt || operation.timestamp,
      });
    default:
      throw new Error(`Tipo de operacion desconocida: ${operation.type}`);
  }
};

const canProcessRequest = async (operation) => {
  const amount = Number(operation?.payload?.amount);
  if (!amount || Number.isNaN(amount)) {
    throw new Error('Monto invalido en solicitud');
  }

  const snapshot = await get(ref(db, CASA_BALANCE_PATH));
  const casaBalance = Number(snapshot.val()) || 0;

  if (casaBalance < amount) {
    const error = new Error(
      `Saldo insuficiente en Dinero Casa. Disponible: $${casaBalance.toFixed(2)}`
    );
    error.code = 'INSUFFICIENT_FUNDS';
    throw error;
  }

  return true;
};

export const processQueue = async () => {
  if (!isOnline()) {
    return { processed: 0, failed: 0, total: 0 };
  }

  if (processingPromise) {
    return processingPromise;
  }

  processingPromise = (async () => {
    const operations = await getQueuedOperations();
    let processed = 0;
    let failed = 0;

    for (const op of operations) {
      try {
        if (op.type === 'CREATE_REQUEST') {
          await canProcessRequest(op);
        }

        await updateOperation(op.id, { status: 'syncing', lastError: null });
        await executeOperation(op);
        await removeFromQueue(op.id);
        processed += 1;
      } catch (error) {
        if (error?.code === 'INSUFFICIENT_FUNDS') {
          await updateOperation(op.id, {
            status: 'pending',
            lastError: error?.message || 'Saldo insuficiente para sincronizar',
          });
          failed += 1;
          continue;
        }

        const nextRetries = Number(op.retries || 0) + 1;
        const reachedMax = nextRetries >= Number(op.maxRetries || 3);
        await updateOperation(op.id, {
          status: reachedMax ? 'failed' : 'pending',
          retries: nextRetries,
          lastError: error?.message || 'Error al sincronizar',
        });
        failed += 1;
      }
    }

    notifyQueueSynced({ processed, failed, total: operations.length });
    notifyQueueUpdate();
    return { processed, failed, total: operations.length };
  })();

  try {
    return await processingPromise;
  } finally {
    processingPromise = null;
  }
};

export const getQueueCount = async () => {
  const operations = await getQueuedOperations();
  return operations.length;
};
