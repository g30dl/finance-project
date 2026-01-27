import React from 'react';
import { formatCurrency, getRelativeTime } from '../../utils/helpers';

const CATEGORY_EMOJIS = {
  comida: '🍔',
  transporte: '🚗',
  salud: '🏥',
  educacion: '📚',
  entretenimiento: '🎬',
  servicios: '💡',
  ropa: '🛍',
  hogar: '🏠',
  tecnologia: '💻',
  otros: '📦',
};

function TransactionItem({ transaction, userId }) {
  const isIncome =
    transaction.tipo === 'deposito_personal' || transaction.cuentaDestino === userId;

  const emoji = CATEGORY_EMOJIS[transaction.categoria] || '📦';

  return (
    <div className="bg-white rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all active:scale-[0.98]">
      <div className="flex items-center gap-3">
        <div className="text-4xl">{emoji}</div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate capitalize">
            {transaction.categoria || 'Otro'}
          </p>
          <p className="text-sm text-gray-500 truncate">{transaction.concepto}</p>
          <p className="text-xs text-gray-400 mt-1">{getRelativeTime(transaction.fecha)}</p>
        </div>

        <div className="text-right">
          <p
            className={`font-bold font-heading text-lg ${
              isIncome ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.cantidad)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default TransactionItem;
