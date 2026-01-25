import React from 'react';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Card } from '../common';
import { formatCurrency } from '../../utils/helpers';

function PersonalStatsCard({ stats }) {
  const { received = 0, spent = 0, balance = 0, transactionCount = 0 } = stats || {};

  const balanceTone =
    balance >= 0
      ? { surface: 'border-primary/35 bg-primary/10', text: 'text-primary' }
      : { surface: 'border-warning/35 bg-warning/10', text: 'text-warning' };

  return (
    <Card title="Dinero Personal" subtitle={`${transactionCount} movimientos`}>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md border border-success/35 bg-success/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm text-success">Total Recibido</span>
          </div>
          <p className="font-heading text-2xl text-success">{formatCurrency(received)}</p>
        </div>

        <div className="rounded-md border border-destructive/35 bg-destructive/10 p-4">
          <div className="mb-2 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">Total Gastado</span>
          </div>
          <p className="font-heading text-2xl text-destructive">{formatCurrency(spent)}</p>
        </div>

        <div className={`rounded-md border p-4 ${balanceTone.surface}`}>
          <div className="mb-2 flex items-center gap-2">
            <Wallet className={`h-4 w-4 ${balanceTone.text}`} />
            <span className={`text-sm ${balanceTone.text}`}>Balance</span>
          </div>
          <p className={`font-heading text-2xl ${balanceTone.text}`}>
            {balance >= 0 ? '+' : ''}
            {formatCurrency(balance)}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default PersonalStatsCard;

