import React from 'react';
import { User } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const getStatus = (balance) => {
  if (balance >= 50) {
    return { color: 'green', label: 'Saludable' };
  }
  if (balance >= 20) {
    return { color: 'yellow', label: 'Bajo' };
  }
  return { color: 'red', label: 'Critico' };
};

const STATUS_CLASSES = {
  green: 'border-success/35 bg-success/10 hover:bg-success/15',
  yellow: 'border-warning/35 bg-warning/10 hover:bg-warning/15',
  red: 'border-danger/35 bg-danger/10 hover:bg-danger/15',
};

const STATUS_TEXT = {
  green: 'text-success',
  yellow: 'text-warning',
  red: 'text-danger',
};

function PersonalAccountCard({ account, onClick }) {
  const { nombreUsuario, saldo, activa } = account || {};
  const balanceValue = Number(saldo) || 0;
  const status = getStatus(balanceValue);
  const isDisabled = activa === false;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${
        STATUS_CLASSES[status.color]
      } ${isDisabled ? 'cursor-not-allowed border-border bg-muted opacity-60 hover:translate-y-0 hover:shadow-none' : ''}`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-foreground-muted" />
          <p className="truncate font-heading text-sm text-foreground">{nombreUsuario || 'Cuenta'}</p>
        </div>
        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${STATUS_TEXT[status.color]} bg-current`} />
      </div>

      <p className={`mb-1 font-heading text-2xl ${STATUS_TEXT[status.color]}`}>
        {formatCurrency(balanceValue)}
      </p>
      <p className="text-xs text-foreground-muted">{status.label}</p>
    </button>
  );
}

export default PersonalAccountCard;
