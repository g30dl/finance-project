import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/helpers';

function TopCategoriesTable({ breakdown = {} }) {
  const items = useMemo(() => {
    return Object.entries(breakdown)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [breakdown]);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <h3 className="text-sm font-semibold text-gray-700">Top categorias</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">Sin categorias registradas.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <div key={item.category} className="flex items-center justify-between text-sm">
              <span className="capitalize text-gray-700">{item.category}</span>
              <span className="font-semibold text-gray-900">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TopCategoriesTable;
