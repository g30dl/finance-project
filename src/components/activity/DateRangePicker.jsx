import React from 'react';

const RANGES = [
  { id: 'month', label: 'Mes' },
  { id: 'quarter', label: '3 meses' },
  { id: 'year', label: 'Ano' },
];

function DateRangePicker({ value, onChange }) {
  return (
    <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-card">
      {RANGES.map((range) => {
        const isActive = value === range.id;
        return (
          <button
            key={range.id}
            type="button"
            onClick={() => onChange?.(range.id)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
              isActive ? 'bg-primary text-white shadow-card' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}

export default DateRangePicker;
