import { useMemo } from 'react';
import { formatCurrency } from '../utils/helpers';

export const useSystemAlerts = ({
  personalAccounts = {},
  casaBalance = 0,
  pendingRequests = 0,
  onViewRequests,
}) => {
  return useMemo(() => {
    const alertsList = [];
    const casaValue = Number(casaBalance) || 0;

    if (pendingRequests > 0) {
      alertsList.push({
        id: 'pending-requests',
        type: 'info',
        message: `${pendingRequests} solicitud${
          pendingRequests > 1 ? 'es' : ''
        } pendiente${pendingRequests > 1 ? 's' : ''} de aprobacion`,
        action: onViewRequests
          ? {
              text: 'Ver ahora',
              onClick: onViewRequests,
            }
          : null,
      });
    }

    if (casaValue < 100) {
      alertsList.push({
        id: 'casa-low',
        type: casaValue < 50 ? 'danger' : 'warning',
        message: `Dinero Casa con saldo ${
          casaValue < 50 ? 'critico' : 'bajo'
        }: ${formatCurrency(casaValue)}`,
      });
    }

    const accountsArray = Array.isArray(personalAccounts)
      ? personalAccounts
      : Object.entries(personalAccounts || {}).map(([userId, account]) => ({
          userId,
          ...account,
        }));

    accountsArray.forEach((account) => {
      const balance = Number(account.saldo) || 0;
      if (balance < 20 && account.activa !== false) {
        alertsList.push({
          id: `personal-low-${account.userId}`,
          type: balance === 0 ? 'danger' : 'warning',
          message: `${account.nombreUsuario || 'Cuenta'} tiene saldo ${
            balance === 0 ? 'en cero' : 'bajo'
          }: ${formatCurrency(balance)}`,
        });
      }
    });

    return alertsList;
  }, [personalAccounts, casaBalance, pendingRequests, onViewRequests]);
};
