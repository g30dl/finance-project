import React from 'react';
import { formatCurrency } from '../../utils/helpers';

const CATEGORY_COLORS = {
  comida: 'bg-green-500',
  transporte: 'bg-blue-500',
  salud: 'bg-red-500',
  educacion: 'bg-purple-500',
  entretenimiento: 'bg-pink-500',
  servicios: 'bg-orange-500',
  ropa: 'bg-cyan-500',
  hogar: 'bg-amber-600',
  tecnologia: 'bg-indigo-500',
  otros: 'bg-gray-500',
};

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

function CategoryBar({ category, spent, budget }) {
  const safeBudget = Number(budget) || 0;
  const safeSpent = Number(spent) || 0;
  const percentage = safeBudget > 0 ? Math.min((safeSpent / safeBudget) * 100, 100) : 0;
  const status = percentage < 70 ? 'safe' : percentage < 90 ? 'warning' : 'danger';

  const barColor =
    status === 'safe'
      ? CATEGORY_COLORS[category]
      : status === 'warning'
        ? 'bg-yellow-500'
        : 'bg-red-500';

  return (
    <div className="bg-white rounded-xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{CATEGORY_EMOJIS[category]}</span>
          <span className="font-semibold text-gray-900 capitalize">{category}</span>
        </div>
        <span className="text-sm font-mono text-gray-600">
          {formatCurrency(safeSpent)} / {formatCurrency(safeBudget)}
        </span>
      </div>

      <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        <span
          className={`text-xs font-semibold ${
            status === 'safe'
              ? 'text-green-600'
              : status === 'warning'
                ? 'text-yellow-600'
                : 'text-red-600'
          }`}
        >
          {safeBudget > 0 ? `${percentage.toFixed(0)}% usado` : 'Sin presupuesto'}
        </span>
        <span className="text-xs text-gray-500">
          {safeBudget > 0 ? formatCurrency(safeBudget - safeSpent) : 'Configura un presupuesto'}
        </span>
      </div>
    </div>
  );
}

export default CategoryBar;
