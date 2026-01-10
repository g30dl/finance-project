import React from 'react';
import { User } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const getStatus = (balance) => {
  if (balance >= 50) {
    return { color: 'green', label: 'Saludable', icon: '🟢' };
  }
  if (balance >= 20) {
    return { color: 'yellow', label: 'Bajo', icon: '🟡' };
  }
  return { color: 'red', label: 'Critico', icon: '🔴' };
};

const STATUS_CLASSES = {
  green: 'border-emerald-500/50 bg-emerald-950/20 hover:bg-emerald-950/30',
  yellow: 'border-amber-500/50 bg-amber-950/20 hover:bg-amber-950/30',
  red: 'border-rose-500/50 bg-rose-950/20 hover:bg-rose-950/30',
};

const STATUS_TEXT = {
  green: 'text-emerald-400',
  yellow: 'text-amber-400',
  red: 'text-rose-400',
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
      className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 hover:scale-105 hover:shadow-lg ${
        STATUS_CLASSES[status.color]
      } ${isDisabled ? 'cursor-not-allowed opacity-50 hover:scale-100' : ''}`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <p className="text-sm font-medium text-slate-200 truncate">
            {nombreUsuario || 'Cuenta'}
          </p>
        </div>
        <span className="text-lg">{status.icon}</span>
      </div>

      <p className={`mb-1 text-2xl font-bold ${STATUS_TEXT[status.color]}`}>
        {formatCurrency(balanceValue)}
      </p>
      <p className="text-xs text-slate-500">{status.label}</p>
    </button>
  );
}

export default PersonalAccountCard;
