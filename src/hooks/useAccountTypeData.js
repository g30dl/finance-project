import { useMemo } from 'react';
import { useFirebaseData } from './useFirebaseData';

const DEFAULT_ACCOUNT_DATA = {
  totalRecibido: 0,
  totalGastado: 0,
  balance: 0,
  porCategoria: {},
  porUsuario: {},
  ultimosMeses: [],
  transacciones: {
    ingresos: 0,
    egresos: 0,
  },
};

const getAmount = (transaction) => Number(transaction?.cantidad) || 0;
const getTimestamp = (transaction) =>
  Number(
    transaction?.fecha ??
      transaction?.fechaSolicitud ??
      transaction?.fechaRespuesta ??
      0
  );

const sumByRange = (transactions, start, end) => {
  if (!transactions.length) return 0;
  return transactions.reduce((sum, transaction) => {
    const timestamp = getTimestamp(transaction);
    if (timestamp >= start && timestamp <= end) {
      return sum + getAmount(transaction);
    }
    return sum;
  }, 0);
};

const buildMonthlyTrend = (ingresos, egresos, monthsBack = 6) => {
  const now = new Date();
  const months = [];

  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      1,
      0,
      0,
      0
    ).getTime();
    const end = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0,
      23,
      59,
      59
    ).getTime();
    const label = monthDate.toLocaleDateString('es-MX', {
      month: 'short',
      year: 'numeric',
    });

    const ingresosSum = sumByRange(ingresos, start, end);
    const egresosSum = sumByRange(egresos, start, end);

    months.push({
      mes: label,
      ingresos: ingresosSum,
      egresos: egresosSum,
      balance: ingresosSum - egresosSum,
    });
  }

  return months;
};

export const useAccountTypeData = () => {
  const {
    data: transactions,
    loading,
    error,
  } = useFirebaseData('familia_finanzas/transacciones');

  const casaData = useMemo(() => {
    if (!transactions) return DEFAULT_ACCOUNT_DATA;

    const ingresos = [];
    const egresos = [];

    Object.values(transactions)
      .filter(Boolean)
      .forEach((transaction) => {
        if (transaction.estado && transaction.estado !== 'completada') return;

        if (
          transaction.tipo === 'deposito_casa' ||
          (transaction.tipo === 'transferencia_personal_casa' &&
            transaction.cuentaDestino === 'dinero_casa')
        ) {
          ingresos.push(transaction);
        }

        if (
          transaction.tipo === 'solicitud_aprobada' ||
          transaction.tipo === 'gasto_recurrente' ||
          (transaction.tipo === 'transferencia_casa_personal' &&
            transaction.cuentaOrigen === 'dinero_casa')
        ) {
          egresos.push(transaction);
        }
      });

    const totalRecibido = ingresos.reduce(
      (sum, transaction) => sum + getAmount(transaction),
      0
    );
    const totalGastado = egresos.reduce(
      (sum, transaction) => sum + getAmount(transaction),
      0
    );

    const porCategoria = {};
    egresos.forEach((transaction) => {
      const category = transaction.categoria;
      if (category) {
        porCategoria[category] = (porCategoria[category] || 0) + getAmount(transaction);
      }
    });

    return {
      totalRecibido,
      totalGastado,
      balance: totalRecibido - totalGastado,
      porCategoria,
      porUsuario: {},
      ultimosMeses: buildMonthlyTrend(ingresos, egresos, 6),
      transacciones: {
        ingresos: ingresos.length,
        egresos: egresos.length,
      },
    };
  }, [transactions]);

  const personalData = useMemo(() => {
    if (!transactions) return DEFAULT_ACCOUNT_DATA;

    const ingresos = [];
    const egresos = [];

    Object.values(transactions)
      .filter(Boolean)
      .forEach((transaction) => {
        if (transaction.estado && transaction.estado !== 'completada') return;

        if (
          transaction.tipo === 'deposito_personal' ||
          (transaction.tipo === 'transferencia_casa_personal' &&
            transaction.cuentaOrigen === 'dinero_casa')
        ) {
          ingresos.push(transaction);
        }

        if (
          transaction.tipo === 'gasto_personal' ||
          (transaction.tipo === 'transferencia_personal_casa' &&
            transaction.cuentaDestino === 'dinero_casa')
        ) {
          egresos.push(transaction);
        }
      });

    const totalRecibido = ingresos.reduce(
      (sum, transaction) => sum + getAmount(transaction),
      0
    );
    const totalGastado = egresos.reduce(
      (sum, transaction) => sum + getAmount(transaction),
      0
    );

    const porUsuario = {};
    egresos.forEach((transaction) => {
      const userId = transaction.usuario || transaction.cuentaOrigen;
      if (!userId || userId === 'dinero_casa') return;
      porUsuario[userId] = (porUsuario[userId] || 0) + getAmount(transaction);
    });

    return {
      totalRecibido,
      totalGastado,
      balance: totalRecibido - totalGastado,
      porCategoria: {},
      porUsuario,
      ultimosMeses: buildMonthlyTrend(ingresos, egresos, 6),
      transacciones: {
        ingresos: ingresos.length,
        egresos: egresos.length,
      },
    };
  }, [transactions]);

  const comparativa = useMemo(() => {
    const totalRecibido = casaData.totalRecibido + personalData.totalRecibido;
    const totalGastado = casaData.totalGastado + personalData.totalGastado;

    return {
      totalRecibido,
      totalGastado,
      balance: totalRecibido - totalGastado,
      porcentajes: {
        casaRecibido:
          totalRecibido > 0 ? (casaData.totalRecibido / totalRecibido) * 100 : 0,
        personalRecibido:
          totalRecibido > 0 ? (personalData.totalRecibido / totalRecibido) * 100 : 0,
        casaGastado:
          totalGastado > 0 ? (casaData.totalGastado / totalGastado) * 100 : 0,
        personalGastado:
          totalGastado > 0 ? (personalData.totalGastado / totalGastado) * 100 : 0,
      },
    };
  }, [casaData, personalData]);

  return {
    casaData,
    personalData,
    comparativa,
    loading,
    error,
  };
};
