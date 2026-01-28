import React, { useMemo } from 'react';
import Skeleton from '../common/Skeleton';
import PersonalAccountCard from './PersonalAccountCard';

function AccountsGrid({ accounts, loading, onAccountClick, error }) {
  const accountsArray = useMemo(() => {
    if (Array.isArray(accounts)) return accounts;
    if (!accounts) return [];
    return Object.entries(accounts).map(([userId, data]) => ({
      userId,
      ...data,
    }));
  }, [accounts]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={`account-skeleton-${index}`} height="h-32" className="rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
        Error al cargar cuentas personales.
      </div>
    );
  }

  if (accountsArray.length === 0) {
    return (
      <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-gray-500 shadow-card">
        No hay cuentas personales disponibles.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {accountsArray.map((account) => (
        <PersonalAccountCard
          key={account.userId}
          account={account}
          onClick={onAccountClick ? () => onAccountClick(account.userId) : undefined}
        />
      ))}
    </div>
  );
}

export default AccountsGrid;
