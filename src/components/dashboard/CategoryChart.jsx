import React, { memo, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCategoryIcon } from '../../utils/categories';
import { formatCurrency } from '../../utils/helpers';
import { getCategoryLabel } from '../../utils/transactionHelpers';

const CATEGORY_COLORS = {
  comida: 'hsl(142, 71%, 45%)',
  servicios: 'hsl(38, 92%, 50%)',
  transporte: 'hsl(221, 83%, 53%)',
  salud: 'hsl(0, 72%, 51%)',
  educacion: 'hsl(271, 81%, 56%)',
  hogar: 'hsl(25, 75%, 47%)',
  ropa: 'hsl(199, 89%, 48%)',
  entretenimiento: 'hsl(340, 82%, 52%)',
  tecnologia: 'hsl(262, 52%, 47%)',
  otros: 'hsl(218, 17%, 46%)',
};

function CategoryChart({ categoryBreakdown }) {
  const data = useMemo(() => {
    return Object.entries(categoryBreakdown || {})
      .map(([category, amount]) => ({
        name: category,
        label: getCategoryLabel(category),
        value: Number(amount) || 0,
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS.otros,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [categoryBreakdown]);

  if (data.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-muted-foreground">
        Sin gastos categorizados este mes
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            labelFormatter={(label) => label}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs text-foreground/80">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{getCategoryIcon(item.name)} {item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(CategoryChart);
