import { get, ref, update } from 'firebase/database';
import { db } from './firebase';
import { calcularProximaEjecucion } from '../utils/recurringHelpers';

const CASA_BALANCE_PATH = 'familia_finanzas/cuentas/dinero_casa/saldo';
const CASA_LAST_UPDATE_PATH = 'familia_finanzas/cuentas/dinero_casa/ultimaActualizacion';
const RECURRING_PATH = 'familia_finanzas/gastosRecurrentes';
const NOTIFICATIONS_PATH = 'familia_finanzas/notificaciones';
const TRANSACTIONS_PATH = 'familia_finanzas/transacciones';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const getExecutionKey = (expense) => {
  const scheduledAt = Number(expense?.proximaEjecucion || 0);
  if (Number.isFinite(scheduledAt) && scheduledAt > 0) {
    return scheduledAt;
  }
  return Date.now();
};

const buildExecutionIds = (expense) => {
  const key = getExecutionKey(expense);
  const baseId = expense?.id || 'gasto';
  return {
    executionKey: key,
    transactionId: `recurrente_${baseId}_${key}`,
    notificationId: `notif_recurrente_${baseId}_${key}`,
  };
};

/**
 * Obtiene todos los gastos recurrentes activos
 */
export const getActiveRecurringExpenses = async () => {
  try {
    const snapshot = await get(ref(db, RECURRING_PATH));
    if (!snapshot.exists()) return [];

    return Object.entries(snapshot.val() || {})
      .map(([id, expense]) => ({
        ...(expense || {}),
        id: expense?.id || id,
      }))
      .filter((expense) => expense?.activo === true);
  } catch (error) {
    console.error('Error fetching recurring expenses:', error);
    throw error;
  }
};

/**
 * Verifica si un gasto esta vencido (debe ejecutarse)
 */
export const isExpenseOverdue = (expense) => {
  if (!expense?.activo) return false;
  const now = Date.now();
  const dueAt = Number(expense?.proximaEjecucion || 0);
  if (!Number.isFinite(dueAt) || dueAt <= 0) return false;

  const lastExecution = Number(expense?.ultimaEjecucion || 0);
  if (lastExecution && lastExecution >= dueAt) {
    return false;
  }

  return dueAt <= now;
};

/**
 * Ejecuta un gasto recurrente individual
 */
export const executeRecurringExpense = async (expense, adminId) => {
  try {
    if (!expense?.id) {
      throw new Error('Gasto recurrente invalido');
    }

    const name = expense.nombre || 'Gasto recurrente';
    const amount = Number(expense.monto);
    if (!amount || Number.isNaN(amount) || amount <= 0) {
      throw new Error(`Monto invalido para ${name}`);
    }

    const dueAt = Number(expense.proximaEjecucion || 0);
    const lastExecution = Number(expense.ultimaEjecucion || 0);
    if (!Number.isFinite(dueAt) || dueAt <= 0) {
      throw new Error('Fecha de ejecucion invalida');
    }

    if (lastExecution && lastExecution >= dueAt) {
      return {
        success: true,
        skipped: true,
        expense,
      };
    }

    const casaSnapshot = await get(ref(db, CASA_BALANCE_PATH));
    if (!casaSnapshot.exists()) {
      throw new Error('Cuenta Dinero Casa no encontrada');
    }

    const casaBalance = Number(casaSnapshot.val()) || 0;
    if (casaBalance < amount) {
      return {
        success: false,
        error: `Saldo insuficiente para ${name}. Disponible: $${casaBalance.toFixed(2)}`,
        expense,
      };
    }

    const timestamp = Date.now();
    const { executionKey, transactionId, notificationId } = buildExecutionIds(expense);
    const newCasaBalance = casaBalance - amount;

    const transaction = {
      id: transactionId,
      tipo: 'gasto_recurrente',
      categoria: expense.categoria,
      concepto: `${name} (automatico)`,
      cantidad: amount,
      cuentaOrigen: 'dinero_casa',
      cuentaDestino: null,
      fecha: timestamp,
      ejecutadaPor: adminId || 'sistema',
      estado: 'completada',
      requiereAprobacion: false,
      gastoRecurrenteId: expense.id,
      ejecucionProgramada: executionKey,
      saldosResultantes: {
        dinero_casa: newCasaBalance,
      },
    };

    const dayOfMonth = Number(expense.diaMes);
    let nuevaProximaEjecucion = calcularProximaEjecucion(dayOfMonth, dueAt);
    while (nuevaProximaEjecucion <= Date.now()) {
      nuevaProximaEjecucion = calcularProximaEjecucion(dayOfMonth, nuevaProximaEjecucion);
    }

    const notification = {
      id: notificationId,
      tipo: 'gasto_recurrente_ejecutado',
      destinatario: 'todos_admins',
      gastoRecurrenteId: expense.id,
      transaccionId: transactionId,
      monto: amount,
      nombre: name,
      fecha: timestamp,
      leida: false,
      mensaje: `Se ejecuto el pago recurrente: ${name} - $${amount.toFixed(2)}`,
    };

    const updates = {};
    updates[CASA_BALANCE_PATH] = newCasaBalance;
    updates[CASA_LAST_UPDATE_PATH] = timestamp;
    updates[`${TRANSACTIONS_PATH}/${transactionId}`] = transaction;
    updates[`${RECURRING_PATH}/${expense.id}/proximaEjecucion`] = nuevaProximaEjecucion;
    updates[`${RECURRING_PATH}/${expense.id}/ultimaEjecucion`] = timestamp;
    updates[`${NOTIFICATIONS_PATH}/${notificationId}`] = notification;

    await update(ref(db), updates);

    return {
      success: true,
      transaction,
      newBalance: newCasaBalance,
      expense,
    };
  } catch (error) {
    console.error(`Error ejecutando ${expense?.nombre || 'gasto recurrente'}:`, error);
    return {
      success: false,
      error: error?.message || 'Error al ejecutar gasto recurrente',
      expense,
    };
  }
};

/**
 * Procesa todos los gastos recurrentes vencidos
 */
export const processOverdueExpenses = async (adminId) => {
  try {
    const expenses = await getActiveRecurringExpenses();
    const overdueExpenses = expenses.filter(isExpenseOverdue);

    if (overdueExpenses.length === 0) {
      return {
        success: true,
        processed: 0,
        successful: 0,
        failed: 0,
        skipped: 0,
        results: [],
      };
    }

    const results = await Promise.all(
      overdueExpenses.map((expense) => executeRecurringExpense(expense, adminId))
    );

    const successful = results.filter((result) => result.success && !result.skipped);
    const failed = results.filter((result) => !result.success);
    const skipped = results.filter((result) => result.skipped);

    if (failed.length > 0) {
      await createFailureSummaryNotification(failed, adminId);
    }

    return {
      success: true,
      processed: overdueExpenses.length,
      successful: successful.length,
      failed: failed.length,
      skipped: skipped.length,
      results,
    };
  } catch (error) {
    console.error('Error processing overdue expenses:', error);
    throw error;
  }
};

/**
 * Crea notificacion de resumen de fallos
 */
const createFailureSummaryNotification = async (failedResults, adminId) => {
  if (!failedResults?.length) return;
  const timestamp = Date.now();
  const notificationId = `notif_recurrente_fallos_${timestamp}`;

  const failedNames = failedResults
    .map((result) => result?.expense?.nombre)
    .filter(Boolean)
    .join(', ');

  const notification = {
    id: notificationId,
    tipo: 'gasto_recurrente_fallo',
    destinatario: 'todos_admins',
    fecha: timestamp,
    leida: false,
    ejecutadaPor: adminId || 'sistema',
    mensaje: `No se pudieron ejecutar ${failedResults.length} gastos recurrentes: ${failedNames}. Revisa el saldo de Dinero Casa.`,
    detalles: failedResults.map((result) => ({
      nombre: result?.expense?.nombre,
      monto: result?.expense?.monto,
      error: result?.error,
    })),
  };

  await update(ref(db), {
    [`${NOTIFICATIONS_PATH}/${notificationId}`]: notification,
  });
};

/**
 * Verifica gastos que necesitan notificacion previa
 */
export const checkNotificationNeeded = async () => {
  try {
    const expenses = await getActiveRecurringExpenses();
    const now = Date.now();

    for (const expense of expenses) {
      if (!expense.notificarAntes) continue;

      const diasMs = Number(expense.diasNotificacion || 0) * ONE_DAY_MS;
      const scheduledAt = Number(expense.proximaEjecucion || 0);
      if (!Number.isFinite(scheduledAt) || scheduledAt <= 0) continue;

      const notifyAt = scheduledAt - diasMs;
      const windowStart = notifyAt - 12 * 60 * 60 * 1000;
      const windowEnd = notifyAt + 12 * 60 * 60 * 1000;

      if (now < windowStart || now > windowEnd) continue;

      const lastNotifiedRef = ref(
        db,
        `${RECURRING_PATH}/${expense.id}/ultimaNotificacion`
      );
      const lastNotifiedSnapshot = await get(lastNotifiedRef);
      const lastNotified = Number(lastNotifiedSnapshot.val() || 0);

      if (lastNotified && now - lastNotified < ONE_DAY_MS) {
        continue;
      }

      await createUpcomingPaymentNotification(expense);

      await update(ref(db), {
        [`${RECURRING_PATH}/${expense.id}/ultimaNotificacion`]: now,
      });
    }
  } catch (error) {
    console.error('Error checking notifications:', error);
  }
};

/**
 * Crea notificacion de proximo pago
 */
const createUpcomingPaymentNotification = async (expense) => {
  const timestamp = Date.now();
  const notificationId = `notif_proximo_pago_${expense.id}_${timestamp}`;

  const scheduledAt = Number(expense.proximaEjecucion || 0);
  const diasRestantes = Math.ceil((scheduledAt - timestamp) / ONE_DAY_MS);
  const name = expense.nombre || 'Gasto recurrente';
  const amount = Number(expense.monto || 0);

  const notification = {
    id: notificationId,
    tipo: 'gasto_recurrente_proximo',
    destinatario: 'todos_admins',
    gastoRecurrenteId: expense.id,
    monto: amount,
    fecha: timestamp,
    leida: false,
    mensaje: `Proximo pago en ${diasRestantes} dias: ${name} - $${amount.toFixed(2)}`,
  };

  await update(ref(db), {
    [`${NOTIFICATIONS_PATH}/${notificationId}`]: notification,
  });
};
