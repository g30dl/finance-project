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

function MonthlySummary({ userId, personalBalance: _personalBalance }) {
  const { summary, loading, error } = useMonthlyPersonalSummary(userId);

  const balanceValue = useMemo(() => summary.balance, [summary]);

  return (
    <div className="vintage-card rounded-md p-6 text-foreground shadow-card">
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4 text-accent" />
        <span className="font-medium">{getCurrentMonthName()}</span>
      </div>
      <h3 className="mb-4 font-heading text-lg text-foreground">Resumen del Mes</h3>

      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
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
              <div className="rounded-sm border border-success/30 bg-success/10 p-1 text-success">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-sm text-foreground/90">Recibido</span>
            </div>
            <span className="font-heading text-success">+{formatCurrency(summary.received)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-1 text-destructive">
                <TrendingDown className="h-4 w-4" />
              </div>
              <span className="text-sm text-foreground/90">Gastado</span>
            </div>
            <span className="font-heading text-destructive">-{formatCurrency(summary.spent)}</span>
          </div>

          <div className="border-t border-border/80 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Balance</span>
              <span className={`text-lg font-heading ${balanceValue >= 0 ? 'text-success' : 'text-destructive'}`}>
                {balanceValue >= 0 ? '+' : ''}
                {formatCurrency(balanceValue)}
              </span>
            </div>
          </div>
        </div>
      )}

      {!loading && !error ? (
        <div className="mt-6 border-t border-border/80 pt-6">
          <h4 className="mb-4 flex items-center gap-2 font-heading text-base text-foreground">
            <Calendar className="h-5 w-5 text-accent" />
            Distribucion por categoria
          </h4>
          <CategoryChart categoryBreakdown={summary.categoryBreakdown || {}} />
        </div>
      ) : null}
    </div>
  );
}

export default MonthlySummary;
