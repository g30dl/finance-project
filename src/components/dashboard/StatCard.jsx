import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function StatCard({ label, value, change, trend = 'up', icon: Icon, color = 'primary' }) {
  const gradients = {
    primary: 'from-blue-500 to-blue-600',
    success: 'from-green-500 to-green-600',
    danger: 'from-red-500 to-red-600',
    warning: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center text-white shadow-md`}
        >
          {Icon && <Icon className="w-5 h-5" />}
        </div>

        {change && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change}
          </div>
        )}
      </div>

      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold font-heading text-gray-900">{value}</p>
    </div>
  );
}

export default StatCard;
