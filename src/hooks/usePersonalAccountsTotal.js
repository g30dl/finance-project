import { useMemo } from 'react';

export const usePersonalAccountsTotal = (accounts) => {
  return useMemo(() => {
    if (!accounts) return 0;

    const accountsArray = Array.isArray(accounts)
      ? accounts
      : Object.values(accounts);

    return accountsArray.reduce((sum, account) => {
      if (account?.activa === false) return sum;
      return sum + (Number(account?.saldo) || 0);
    }, 0);
  }, [accounts]);
};
