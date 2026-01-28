import React from 'react';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function CategoryDonutChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-gray-500">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" data={data} innerRadius={50} outerRadius={70} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => value.toLocaleString('es-MX')} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryDonutChart;
