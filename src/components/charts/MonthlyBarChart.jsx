import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function MonthlyBarChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-500">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <div className="h-40 w-full">
      <ResponsiveContainer>
        <BarChart data={data} barSize={14}>
          <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
          <Tooltip formatter={(value) => value.toLocaleString('es-MX')} />
          <Bar dataKey="ingresos" fill="#10B981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="gastos" fill="#EF4444" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MonthlyBarChart;
