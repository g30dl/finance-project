import { get, ref, update } from 'firebase/database';
import { db } from './firebase';

const MAX_AMOUNT = 10000;
const MIN_CONCEPT_LENGTH = 10;

export const createPersonalExpense = async (expenseData) => {
  try {
    const { userId, amount, category, concept, transactionId, createdAt } =
      expenseData || {};
    const parsedAmount = Number(amount);

    if (!userId) {
      throw new Error('Usuario no disponible.');
    }

    if (!parsedAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Ingresa un monto valido mayor a 0');
    }

    if (parsedAmount > MAX_AMOUNT) {
      throw new Error(`El monto no puede exceder $${MAX_AMOUNT}`);
    }

    if (!category || !category.trim()) {
      throw new Error('Selecciona una categoria');
    }

    if (!concept || !concept.trim()) {
      throw new Error('Describe para que usaras el dinero');
    }

    if (concept.trim().length < MIN_CONCEPT_LENGTH) {
      throw new Error(`El concepto debe tener al menos ${MIN_CONCEPT_LENGTH} caracteres`);
    }

    const resolvedTransactionId = transactionId || `trans_${Date.now()}`;
    const transactionRef = ref(db, `familia_finanzas/transacciones/${resolvedTransactionId}`);
    const existingTransaction = transactionId ? await get(transactionRef) : null;

    if (existingTransaction?.exists()) {
      const transaction = existingTransaction.val();
      return {
        success: true,
        newBalance: transaction?.saldosResultantes?.[userId] ?? null,
        transactionId: resolvedTransactionId,
        transaction,
      };
    }

    const balanceRef = ref(db, `familia_finanzas/cuentas/personales/${userId}/saldo`);
    const balanceSnapshot = await get(balanceRef);

    if (!balanceSnapshot.exists()) {
      throw new Error('Cuenta personal no encontrada');
    }

    const currentBalance = Number(balanceSnapshot.val()) || 0;

    if (currentBalance < parsedAmount) {
      throw new Error(
        `Saldo insuficiente. Disponible: $${currentBalance.toFixed(2)}, Solicitado: $${parsedAmount.toFixed(2)}`
      );
    }

    const newBalance = currentBalance - parsedAmount;
    const timestamp = Date.now();
    const transactionDate = Number(createdAt) || timestamp;

    const transaction = {
      id: resolvedTransactionId,
      tipo: 'gasto_personal',
      usuario: userId,
      cuentaOrigen: userId,
      cuentaDestino: null,
      cantidad: parsedAmount,
      categoria: category,
      concepto: concept.trim(),
      fecha: transactionDate,
      ejecutadaPor: userId,
      estado: 'completada',
      requiereAprobacion: false,
      saldosResultantes: {
        [userId]: newBalance,
      },
    };

    const updates = {};
    updates[`familia_finanzas/cuentas/personales/${userId}/saldo`] = newBalance;
    updates[`familia_finanzas/cuentas/personales/${userId}/ultimaActualizacion`] = timestamp;
    updates[`familia_finanzas/transacciones/${resolvedTransactionId}`] = transaction;

    await update(ref(db), updates);

    return {
      success: true,
      newBalance,
      transactionId: resolvedTransactionId,
      transaction,
    };
  } catch (error) {
    console.error('Error creating personal expense:', error);
    throw error;
  }
};

export const validatePersonalExpense = (data) => {
  const errors = {};
  const amount = Number(data?.amount);
  const concept = data?.concept || '';

  if (!amount || Number.isNaN(amount) || amount <= 0) {
    errors.amount = 'Ingresa un monto valido mayor a 0';
  } else if (amount > MAX_AMOUNT) {
    errors.amount = `El monto no puede exceder $${MAX_AMOUNT}`;
  }

  if (!data?.category || !data.category.trim()) {
    errors.category = 'Selecciona una categoria';
  }

  if (!concept.trim()) {
    errors.concept = 'Describe para que usaras el dinero';
  } else if (concept.trim().length < MIN_CONCEPT_LENGTH) {
    errors.concept = `El concepto debe tener al menos ${MIN_CONCEPT_LENGTH} caracteres`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
