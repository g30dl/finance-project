import React from 'react';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card } from '../common';
import { formatCurrency } from '../../utils/helpers';

function PersonalStatsCard({ stats }) {
  const {
    received = 0,
    spent = 0,
    balance = 0,
    transactionCount = 0,
  } = stats || {};

  return (
    <Card title="Dinero Personal" subtitle={`${transactionCount} movimientos`}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-300">Total Recibido</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {formatCurrency(received)}
          </p>
        </div>

        <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-rose-400" />
            <span className="text-sm text-rose-300">Total Gastado</span>
          </div>
          <p className="text-2xl font-bold text-rose-400">
            {formatCurrency(spent)}
          </p>
        </div>

        <div
          className={`rounded-lg border p-4 ${
            balance >= 0
              ? 'border-cyan-500/30 bg-cyan-950/20'
              : 'border-amber-500/30 bg-amber-950/20'
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-slate-300" />
            <span className="text-sm text-slate-300">Balance</span>
          </div>
          <p
            className={`text-2xl font-bold ${
              balance >= 0 ? 'text-cyan-400' : 'text-amber-400'
            }`}
          >
            {balance >= 0 ? '+' : ''}
            {formatCurrency(balance)}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default PersonalStatsCard;
