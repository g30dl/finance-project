import React from 'react';
import { formatCurrency } from '../../utils/helpers';

function QuickStats({ spent, income, favoriteCategory }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-2xl bg-white p-4 shadow-card">
        <p className="text-xs text-gray-500">Total gastado (mes)</p>
        <p className="mt-1 text-lg font-heading font-bold text-gray-900">
          {formatCurrency(spent || 0)}
        </p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-card">
        <p className="text-xs text-gray-500">Ingresos (mes)</p>
        <p className="mt-1 text-lg font-heading font-bold text-gray-900">
          {formatCurrency(income || 0)}
        </p>
      </div>
      <div className="col-span-2 rounded-2xl bg-white p-4 shadow-card">
        <p className="text-xs text-gray-500">Categoria favorita</p>
        <p className="mt-1 text-base font-semibold text-gray-900 capitalize">
          {favoriteCategory || 'Sin datos'}
        </p>
      </div>
    </div>
  );
}

export default QuickStats;
