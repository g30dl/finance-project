import React from 'react';
import { Home, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import Skeleton from './Skeleton';

const TYPE_STYLES = {
  personal: {
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
    bg: 'bg-gradient-to-br from-emerald-950/40 to-emerald-900/20',
    icon: 'text-emerald-300',
    hover: 'hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.02] cursor-pointer',
  },
  casa: {
    border: 'border-blue-500/40',
    text: 'text-blue-300',
    bg: 'bg-gradient-to-br from-blue-950/40 to-blue-900/20',
    icon: 'text-blue-300',
    hover: 'hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02] cursor-pointer',
  },
};

const STATUS_STYLES = {
  green: 'bg-emerald-500/20 text-emerald-400',
  yellow: 'bg-amber-500/20 text-amber-400',
  red: 'bg-rose-500/20 text-rose-400',
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

  return (
    <div
      className={`relative rounded-2xl border-2 p-6 transition-all duration-300 ${styles.border} ${styles.bg} ${
        readonly ? 'cursor-default' : styles.hover
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${styles.icon}`} />
          <p className="text-sm font-medium text-slate-300">{title}</p>
        </div>
        {readonly && <span className="text-xs text-slate-500">Solo vista</span>}
      </div>
      <div className="mt-4">
        {loading ? (
          <Skeleton width="w-40" height={skeletonHeight} />
        ) : error ? (
          <p className="text-sm text-rose-400">Error al cargar saldo.</p>
        ) : (
          <p className={`${amountClasses} font-semibold ${styles.text} transition-all duration-500`}>
            {formatCurrency(balanceValue)}
          </p>
        )}
        {hasData && shouldShowIndicator && (
          <div
            className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
              STATUS_STYLES[status]
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {getStatusText(status)}
          </div>
        )}
      </div>
    </div>
  );
}

export default BalanceCard;
