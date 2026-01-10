import { useMemo } from 'react';
import { useFirebaseData } from './useFirebaseData';

const CASA_BALANCE_PATH = 'familia_finanzas/cuentas/dinero_casa/saldo';

export const useBalance = (accountType, userId) => {
  const path = useMemo(() => {
    if (accountType === 'casa') {
      return CASA_BALANCE_PATH;
    }

    if (accountType === 'personal' && userId) {
      return `familia_finanzas/cuentas/personales/${userId}/saldo`;
    }

    return null;
  }, [accountType, userId]);

  const { data, loading, error } = useFirebaseData(path);

  const balance = useMemo(() => {
    if (data == null) return null;
    const value = Number(data);
    return Number.isFinite(value) ? value : 0;
  }, [data]);

  const resolvedError = useMemo(() => {
    if (accountType === 'personal' && !userId) {
      return 'Falta userId para cuenta personal.';
    }
    return error;
  }, [accountType, userId, error]);

  const resolvedLoading = path ? loading : false;

  return { balance, loading: resolvedLoading, error: resolvedError };
};
