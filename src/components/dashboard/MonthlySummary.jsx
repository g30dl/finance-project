import React, { useMemo } from 'react';
import { Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import Skeleton from '../common/Skeleton';
import { useMonthlyPersonalSummary } from '../../hooks/useMonthlyPersonalSummary';
import CategoryChart from './CategoryChart';

const getCurrentMonthName = () =>
  new Date().toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });

function MonthlySummary({ userId, personalBalance }) {
  const { summary, loading, error } = useMonthlyPersonalSummary(userId);

  const balanceValue = useMemo(() => {
    return summary.balance;
  }, [summary]);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
      <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
        <Calendar className="h-4 w-4 text-cyan-400" />
        <span className="font-medium">{getCurrentMonthName()}</span>
      </div>
      <h3 className="mb-4 text-lg font-semibold text-slate-200">Resumen del Mes</h3>

      {error ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-950/10 p-3 text-sm text-rose-200">
          Error al cargar resumen: {error}
        </div>
      ) : loading ? (
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

      {!loading && !error ? (
        <div className="mt-6 border-t border-slate-700 pt-6">
          <h4 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-200">
            <Calendar className="h-5 w-5 text-cyan-400" />
            Distribucion por categoria
          </h4>
          <CategoryChart categoryBreakdown={summary.categoryBreakdown || {}} />
        </div>
      ) : null}
    </div>
  );
}

export default MonthlySummary;
