import React from 'react';
import { formatCurrency } from '../../utils/helpers';

function BalanceCheck({ balance, projectedBalance, loading }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Saldo casa disponible</p>
          <p className="text-2xl font-heading font-bold text-gray-900">
            {loading ? '...' : formatCurrency(balance || 0)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Saldo despues</p>
          <p className="text-lg font-heading font-bold text-gray-900">
            {loading ? '...' : formatCurrency(projectedBalance || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default BalanceCheck;
