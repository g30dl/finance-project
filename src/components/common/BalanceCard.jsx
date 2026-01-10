import React from 'react';
import { formatCurrency } from '../../utils/helpers';

const COLOR_STYLES = {
  green: {
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
  },
  blue: {
    border: 'border-blue-500/40',
    text: 'text-blue-300',
    bg: 'bg-blue-500/10',
  },
};

const HEALTHY_LIMIT = 50;

function BalanceCard({ title, balance, loading, error, color = 'blue', large = false }) {
  const styles = COLOR_STYLES[color] || COLOR_STYLES.blue;
  const hasData = balance !== null && !loading && !error;
  const statusTone =
    hasData && balance >= HEALTHY_LIMIT ? 'bg-emerald-400' : 'bg-amber-400';
  const statusLabel = hasData
    ? balance >= HEALTHY_LIMIT
      ? 'Saldo estable'
      : 'Saldo bajo'
    : 'Sin datos';
  const amountClasses = large ? 'text-4xl sm:text-5xl' : 'text-3xl';
  const skeletonHeight = large ? 'h-12' : 'h-10';

  return (
    <div className={`rounded-2xl border ${styles.border} ${styles.bg} p-5`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300">{title}</p>
        <span className="flex items-center gap-2 text-xs text-slate-400">
          <span
            className={`h-2 w-2 rounded-full ${hasData ? statusTone : 'bg-slate-600'}`}
          />
          {statusLabel}
        </span>
      </div>
      <div className="mt-4">
        {loading ? (
          <div
            className={`${skeletonHeight} w-40 rounded-lg bg-slate-800/80 animate-pulse`}
          />
        ) : error ? (
          <p className="text-sm text-rose-400">Error al cargar saldo.</p>
        ) : (
          <p className={`${amountClasses} font-semibold ${styles.text}`}>
            {formatCurrency(balance)}
          </p>
        )}
      </div>
    </div>
  );
}

export default BalanceCard;
