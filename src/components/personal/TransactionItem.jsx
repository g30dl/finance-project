import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Home, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Badge } from '../common';
import { formatCurrency, getRelativeTime } from '../../utils/helpers';
import { getCategoryLabel, getTransactionLabel, getUserBalance, isUserIncome } from '../../utils/transactionHelpers';

const getTransactionIcon = (transaction, income) => {
  switch (transaction.tipo) {
    case 'gasto_personal':
      return <TrendingDown className="h-5 w-5" />;
    case 'deposito_personal':
      return <TrendingUp className="h-5 w-5" />;
    case 'transferencia_casa_personal':
    case 'transferencia_personal_casa':
      return <Home className="h-5 w-5" />;
    case 'transferencia_personal_personal':
      return <Users className="h-5 w-5" />;
    default:
      return income ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />;
  }
};

function TransactionItem({ transaction, userId }) {
  const income = isUserIncome(transaction, userId);
  const label = getTransactionLabel(transaction, userId);
  const balance = getUserBalance(transaction, userId);
  const amountClass = income ? 'text-success' : 'text-destructive';
  const iconSurface = income
    ? 'border-success/30 bg-success/10 text-success'
    : 'border-destructive/30 bg-destructive/10 text-destructive';
  const sign = income ? '+' : '-';
  const categoryLabel = getCategoryLabel(transaction.categoria);
  const timeLabel = transaction.fecha ? getRelativeTime(transaction.fecha) : 'Sin fecha';

  return (
    <div className="vintage-card rounded-md border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className={`rounded-sm border p-2 ${iconSurface}`}>{getTransactionIcon(transaction, income)}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-heading text-sm text-foreground">{label}</p>
              {categoryLabel ? (
                <Badge variant="neutral" size="sm">
                  {categoryLabel}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{timeLabel}</p>
            <p className="mt-2 text-sm text-muted-foreground">{transaction.concepto || 'Sin concepto'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-heading ${amountClass}`}>
            {sign}
            {formatCurrency(transaction.cantidad)}
          </p>
          {balance != null ? (
            <p className="mt-1 text-xs text-muted-foreground">Saldo despues: {formatCurrency(balance)}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default TransactionItem;

