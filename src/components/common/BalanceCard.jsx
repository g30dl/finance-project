import React from 'react';
import { Home, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import Skeleton from './Skeleton';

const TYPE_STYLES = {
  personal: {
    container: 'rounded-2xl border border-success/30 bg-white text-foreground shadow-card',
    title: 'text-foreground-muted',
    amount: 'text-success',
    icon: 'text-success',
    hover: 'hover:-translate-y-1 hover:shadow-card-hover cursor-pointer',
  },
  casa: {
    container:
      'rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-card',
    title: 'text-white/85',
    amount: 'text-white',
    icon: 'text-white/90',
    hover: 'hover:-translate-y-1 hover:shadow-card-hover cursor-pointer',
  },
};

const STATUS_STYLES = {
  green: 'border-success/30 bg-success/10 text-success',
  yellow: 'border-warning/30 bg-warning/10 text-warning',
  red: 'border-destructive/30 bg-destructive/10 text-destructive',
};

const getStatusColor = (value, threshold = 50) => {
  if (value >= threshold) return 'green';
  if (value >= threshold * 0.4) return 'yellow';
  return 'red';
};

const getStatusText = (status) => {
  const texts = {
    green: 'Saludable',
    yellow: 'Saldo bajo',
    red: 'Critico',
  };
  return texts[status] || 'Sin datos';
};

function BalanceCard({
  title,
  balance,
  loading,
  error,
  color,
  large = false,
  type,
  showIndicator = true,
  threshold = 50,
  readonly = false,
}) {
  const resolvedType =
    type || (color === 'green' ? 'personal' : color === 'blue' ? 'casa' : 'casa');
  const styles = TYPE_STYLES[resolvedType] || TYPE_STYLES.casa;
  const balanceValue = Number.isFinite(Number(balance)) ? Number(balance) : 0;
  const hasData = balance !== null && !loading && !error;
  const status = hasData ? getStatusColor(balanceValue, threshold) : null;
  const amountClasses = large ? 'text-4xl sm:text-5xl' : 'text-3xl';
  const skeletonHeight = large ? 'h-12' : 'h-10';
  const shouldShowIndicator = showIndicator && resolvedType === 'personal';
  const Icon = resolvedType === 'personal' ? Wallet : Home;
  const readonlyTextClass = resolvedType === 'casa' ? 'text-white/70' : 'text-muted-foreground';

  return (
    <div
      className={`relative overflow-hidden p-6 transition-all duration-300 ${styles.container} ${
        readonly ? 'cursor-default' : styles.hover
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${styles.icon}`} />
          <p className={`text-sm font-medium ${styles.title}`}>{title}</p>
        </div>
        {readonly ? <span className={`text-xs ${readonlyTextClass}`}>Solo vista</span> : null}
      </div>
      <div className="mt-4">
        {loading ? (
          <Skeleton width="w-40" height={skeletonHeight} />
        ) : error ? (
          <p className="text-sm text-destructive">Error al cargar saldo.</p>
        ) : (
          <p className={`${amountClasses} font-heading font-semibold ${styles.amount}`}>
            {formatCurrency(balanceValue)}
          </p>
        )}
        {hasData && shouldShowIndicator ? (
          <div
            className={`mt-3 inline-flex items-center gap-2 rounded-sm border px-3 py-1 text-xs font-medium ${
              STATUS_STYLES[status]
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {getStatusText(status)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default BalanceCard;
