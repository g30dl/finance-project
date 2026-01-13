import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../common';
import { formatCurrency } from '../../utils/helpers';

function ComparisonChart({ personalStats, requestStats }) {
  const data = [
    {
      name: 'Dinero Personal',
      Recibido: personalStats?.received || 0,
      Gastado: personalStats?.spent || 0,
    },
    {
      name: 'Dinero Casa',
      Solicitado: requestStats?.total || 0,
      Aprobado: requestStats?.approved || 0,
      Rechazado: requestStats?.rejected || 0,
    },
  ];

  return (
    <Card title="Comparacion de Actividad">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="Recibido" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Gastado" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Solicitado" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Aprobado" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Rechazado" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default ComparisonChart;
