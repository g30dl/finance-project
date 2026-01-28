import React from 'react';
import { formatCurrency } from '../../utils/helpers';

function BalanceOverview({ personalBalance, casaBalance, isAdmin, loadingPersonal, loadingCasa }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Saldo personal</p>
          <p className="text-2xl font-heading font-bold text-gray-900">
            {loadingPersonal ? '...' : formatCurrency(personalBalance || 0)}
          </p>
        </div>
        {isAdmin ? (
          <div className="text-right">
            <p className="text-xs text-gray-500">Saldo casa</p>
            <p className="text-lg font-heading font-bold text-gray-900">
              {loadingCasa ? '...' : formatCurrency(casaBalance || 0)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default BalanceOverview;
