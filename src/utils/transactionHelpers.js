export const isUserIncome = (transaction, userId) => {
  if (!transaction || !userId) return false;

  const { tipo, cuentaOrigen, cuentaDestino } = transaction;

  switch (tipo) {
    case 'deposito_personal':
      return true;
    case 'gasto_personal':
      return false;
    case 'transferencia_casa_personal':
      return cuentaDestino === userId;
    case 'transferencia_personal_casa':
      return cuentaDestino === userId;
    case 'transferencia_personal_personal':
      return cuentaDestino === userId;
    default:
      return false;
  }
};

export const getTransactionLabel = (transaction, userId) => {
  if (!transaction) return 'Movimiento';

  const category = getCategoryLabel(transaction.categoria);
  const isIncome = isUserIncome(transaction, userId);

  switch (transaction.tipo) {
    case 'gasto_personal':
      return category ? `Gasto en ${category}` : 'Gasto personal';
    case 'deposito_personal':
      return 'Deposito personal';
    case 'transferencia_casa_personal':
      return 'Transferencia desde Casa';
    case 'transferencia_personal_casa':
      return 'Transferencia a Casa';
    case 'transferencia_personal_personal':
      return isIncome ? 'Transferencia recibida' : 'Transferencia enviada';
    default:
      return 'Movimiento personal';
  }
};

export const filterUserTransactions = (allTransactions, userId) => {
  if (!allTransactions || !userId) return [];

  const values = Array.isArray(allTransactions)
    ? allTransactions
    : Object.values(allTransactions);

  return values.filter((transaction) => {
    if (!transaction) return false;
    return (
      transaction.usuario === userId ||
      transaction.cuentaOrigen === userId ||
      transaction.cuentaDestino === userId
    );
  });
};

export const getUserBalance = (transaction, userId) => {
  if (!transaction || !userId) return null;
  const balances = transaction.saldosResultantes;
  if (!balances || typeof balances !== 'object') return null;
  return Object.prototype.hasOwnProperty.call(balances, userId)
    ? balances[userId]
    : null;
};

export const getMonthYear = (timestamp) => {
  if (!timestamp) return 'Sin fecha';
  return new Intl.DateTimeFormat('es-MX', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(timestamp));
};

export const getCategoryLabel = (category) => {
  if (!category) return '';
  return String(category).replace(/_/g, ' ');
};
