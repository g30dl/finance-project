import React, { useMemo } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import Skeleton from '../common/Skeleton';
import { useMonthlyPersonalSummary } from '../../hooks/useMonthlyPersonalSummary';

function MonthlySummary({ userId, personalBalance }) {
  const { summary, loading } = useMonthlyPersonalSummary(userId);

  const balanceValue = useMemo(() => {
    if (summary.received === 0 && summary.spent === 0) {
      const fallback = Number(personalBalance);
      return Number.isFinite(fallback) ? fallback : summary.balance;
    }
    return summary.balance;
  }, [summary, personalBalance]);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-200">Resumen del Mes</h3>

      {loading ? (
        <div className="space-y-3">
          <Skeleton height="h-6" />
          <Skeleton height="h-6" />
          <Skeleton height="h-6" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded bg-emerald-500/20 p-1">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-slate-300">Recibido</span>
            </div>
            <span className="font-semibold text-emerald-400">
              +{formatCurrency(summary.received)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded bg-rose-500/20 p-1">
                <TrendingDown className="h-4 w-4 text-rose-400" />
              </div>
              <span className="text-slate-300">Gastado</span>
            </div>
            <span className="font-semibold text-rose-400">
              -{formatCurrency(summary.spent)}
            </span>
          </div>

          <div className="border-t border-slate-700 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-200">Balance</span>
              <span
                className={`text-lg font-bold ${
                  balanceValue >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {balanceValue >= 0 ? '+' : ''}
                {formatCurrency(balanceValue)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthlySummary;
