import React, { useMemo } from 'react';
import CategoryDonutChart from '../charts/CategoryDonutChart';

const COLOR_MAP = {
  comida: '#10B981',
  transporte: '#3B82F6',
  salud: '#EF4444',
  educacion: '#8B5CF6',
  entretenimiento: '#EC4899',
  servicios: '#F59E0B',
  ropa: '#06B6D4',
  hogar: '#B45309',
  tecnologia: '#6366F1',
  otros: '#64748B',
};

function CategoryDistributionChart({ breakdown = {} }) {
  const data = useMemo(() => {
    return Object.entries(breakdown)
      .map(([name, value]) => ({
        name,
        value,
        color: COLOR_MAP[name] || '#94A3B8',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [breakdown]);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <h3 className="text-sm font-semibold text-gray-700">Gastos por categoria</h3>
      <CategoryDonutChart data={data} />
    </div>
  );
}

export default CategoryDistributionChart;
