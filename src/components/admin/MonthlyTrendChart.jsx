import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function MonthlyTrendChart({ data = [] }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <h3 className="text-sm font-semibold text-gray-700">Tendencia mensual</h3>
      {data.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-gray-500">
          Sin datos disponibles
        </div>
      ) : (
        <div className="h-40 w-full">
          <ResponsiveContainer>
            <LineChart data={data}>
              <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => value.toLocaleString('es-MX')} />
              <Line type="monotone" dataKey="ingresos" stroke="#10B981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="gastos" stroke="#EF4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default MonthlyTrendChart;
