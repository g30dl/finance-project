import React, { useMemo } from 'react';
import { Home, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import Skeleton from '../common/Skeleton';

function SystemSummary({ casaBalance = 0, personalAccountsTotal = 0, loading }) {
  const totals = useMemo(() => {
    const casaValue = Number(casaBalance) || 0;
    const personalValue = Number(personalAccountsTotal) || 0;
    const total = casaValue + personalValue;
    const casaPercent = total > 0 ? (casaValue / total) * 100 : 0;
    const personalPercent = total > 0 ? (personalValue / total) * 100 : 0;

    return {
      total,
      casaValue,
      personalValue,
      casaPercent,
      personalPercent,
    };
  }, [casaBalance, personalAccountsTotal]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
        <Skeleton width="w-48" height="h-6" className="mb-4" />
        <Skeleton height="h-8" className="mb-2" />
        <Skeleton height="h-6" className="mb-2" />
        <Skeleton height="h-6" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-200">Resumen General</h3>

      <div className="mb-4 border-b border-slate-700 pb-4">
        <p className="mb-1 text-sm text-slate-400">Total en el Sistema</p>
        <p className="text-3xl font-bold text-cyan-400">
          {formatCurrency(totals.total)}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-blue-400" />
            <span className="text-slate-300">Dinero Casa</span>
          </div>
          <span className="font-semibold text-blue-400">
            {formatCurrency(totals.casaValue)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-300">Cuentas Personales</span>
          </div>
          <span className="font-semibold text-emerald-400">
            {formatCurrency(totals.personalValue)}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-700 pt-4">
        <div className="flex h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="bg-blue-500"
            style={{ width: `${totals.casaPercent}%` }}
          />
          <div
            className="bg-emerald-500"
            style={{ width: `${totals.personalPercent}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500">
          <span>{totals.casaPercent.toFixed(1)}% Casa</span>
          <span>{totals.personalPercent.toFixed(1)}% Personal</span>
        </div>
      </div>
    </div>
  );
}

export default SystemSummary;
