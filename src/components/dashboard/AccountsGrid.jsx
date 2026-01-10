import React from 'react';
import { formatCurrency } from '../../utils/helpers';

const getTone = (balance) => {
  if (balance >= 50) {
    return {
      border: 'border-emerald-500/40',
      text: 'text-emerald-200',
      dot: 'bg-emerald-400',
      label: 'Saludable',
    };
  }

  if (balance >= 20) {
    return {
      border: 'border-amber-500/40',
      text: 'text-amber-200',
      dot: 'bg-amber-400',
      label: 'Atencion',
    };
  }

  return {
    border: 'border-rose-500/40',
    text: 'text-rose-200',
    dot: 'bg-rose-400',
    label: 'Bajo',
  };
};

function AccountsGrid({ accounts, loading, error }) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`account-skeleton-${index}`}
            className="min-h-[96px] rounded-2xl bg-slate-800/80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
        Error al cargar cuentas personales.
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
        Sin cuentas personales activas.
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => {
        const balance = Number(account.saldo) || 0;
        const tone = getTone(balance);

        return (
          <div
            key={account.userId || account.id}
            className={`rounded-2xl border ${tone.border} bg-slate-900/60 p-4`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-100">
                {account.nombreUsuario || account.nombre || 'Cuenta'}
              </p>
              <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
            </div>
            <p className={`mt-3 text-lg font-semibold ${tone.text}`}>
              {formatCurrency(balance)}
            </p>
            <p className="mt-1 text-xs text-slate-400">{tone.label}</p>
          </div>
        );
      })}
    </div>
  );
}

export default AccountsGrid;
