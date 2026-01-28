import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function UserSpendingChart({ data = [] }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <h3 className="text-sm font-semibold text-gray-700">Gasto por usuario</h3>
      {data.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-gray-500">
          Sin datos disponibles
        </div>
      ) : (
        <div className="h-40 w-full">
          <ResponsiveContainer>
            <BarChart data={data} barSize={18}>
              <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => value.toLocaleString('es-MX')} />
              <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default UserSpendingChart;
