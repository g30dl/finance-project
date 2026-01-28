import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function BalanceTrendChart({ data = [] }) {
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
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
          <Tooltip formatter={(value) => value.toLocaleString('es-MX')} />
          <Line type="monotone" dataKey="balance" stroke="#3B82F6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BalanceTrendChart;
