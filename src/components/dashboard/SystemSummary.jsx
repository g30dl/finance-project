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
      <div className="vintage-card rounded-md p-6">
        <Skeleton width="w-48" height="h-6" className="mb-4" />
        <Skeleton height="h-8" className="mb-2" />
        <Skeleton height="h-6" className="mb-2" />
        <Skeleton height="h-6" />
      </div>
    );
  }

  return (
    <div className="vintage-card rounded-md p-6 text-foreground shadow-card">
      <h3 className="mb-4 font-heading text-lg text-foreground">Resumen General</h3>

      <div className="mb-4 border-b border-border/80 pb-4">
        <p className="mb-1 text-sm text-muted-foreground">Total en el Sistema</p>
        <p className="font-heading text-3xl text-primary">{formatCurrency(totals.total)}</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-navy" />
            <span className="text-sm text-foreground/90">Dinero Casa</span>
          </div>
          <span className="font-heading text-navy">{formatCurrency(totals.casaValue)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-sage" />
            <span className="text-sm text-foreground/90">Cuentas Personales</span>
          </div>
          <span className="font-heading text-sage">{formatCurrency(totals.personalValue)}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-border/80 pt-4">
        <div className="flex h-2 overflow-hidden rounded-sm bg-secondary">
          <div className="bg-navy" style={{ width: `${totals.casaPercent}%` }} />
          <div className="bg-sage" style={{ width: `${totals.personalPercent}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{totals.casaPercent.toFixed(1)}% Casa</span>
          <span>{totals.personalPercent.toFixed(1)}% Personal</span>
        </div>
      </div>
    </div>
  );
}

export default SystemSummary;

