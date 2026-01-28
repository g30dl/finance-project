import React from 'react';

const FILTERS = [
  { id: 'all', label: 'Todo' },
  { id: 'income', label: 'Ingresos' },
  { id: 'expense', label: 'Gastos' },
];

function TransactionFilter({ value, onChange }) {
  return (
    <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-card">
      {FILTERS.map((filter) => {
        const isActive = value === filter.id;
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange?.(filter.id)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              isActive ? 'bg-primary text-white shadow-card' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

export default TransactionFilter;
