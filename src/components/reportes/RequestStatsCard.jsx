import React from 'react';
import { CheckCircle, Clock, Home, XCircle } from 'lucide-react';
import { Card } from '../common';
import { formatCurrency } from '../../utils/helpers';

const STAT_STYLES = {
  blue: {
    container: 'border-blue-500/30 bg-blue-950/20',
    icon: 'text-blue-400',
    label: 'text-blue-300',
    value: 'text-blue-400',
  },
  emerald: {
    container: 'border-emerald-500/30 bg-emerald-950/20',
    icon: 'text-emerald-400',
    label: 'text-emerald-300',
    value: 'text-emerald-400',
  },
  rose: {
    container: 'border-rose-500/30 bg-rose-950/20',
    icon: 'text-rose-400',
    label: 'text-rose-300',
    value: 'text-rose-400',
  },
  amber: {
    container: 'border-amber-500/30 bg-amber-950/20',
    icon: 'text-amber-400',
    label: 'text-amber-300',
    value: 'text-amber-400',
  },
};

function RequestStatsCard({ stats }) {
  const {
    total = 0,
    approved = 0,
    rejected = 0,
    pending = 0,
    approvalRate = 0,
    requestCount = 0,
  } = stats || {};

  return (
    <Card title="Uso de Dinero Casa" subtitle={`${requestCount} solicitudes`}>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <StatItem
            icon={<Home className="h-4 w-4" />}
            label="Total Solicitado"
            value={formatCurrency(total)}
            color="blue"
          />
          <StatItem
            icon={<CheckCircle className="h-4 w-4" />}
            label="Aprobado"
            value={formatCurrency(approved)}
            color="emerald"
          />
          <StatItem
            icon={<XCircle className="h-4 w-4" />}
            label="Rechazado"
            value={formatCurrency(rejected)}
            color="rose"
          />
          <StatItem
            icon={<Clock className="h-4 w-4" />}
            label="Pendiente"
            value={formatCurrency(pending)}
            color="amber"
          />
        </div>

        {total > 0 ? (
          <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-slate-400">Tasa de Aprobacion</span>
              <span className="text-lg font-bold text-cyan-400">
                {approvalRate.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${approvalRate}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function StatItem({ icon, label, value, color }) {
  const styles = STAT_STYLES[color] || STAT_STYLES.blue;

  return (
    <div className={`rounded-lg border p-3 ${styles.container}`}>
      <div className="mb-1 flex items-center gap-2">
        <div className={styles.icon}>{icon}</div>
        <span className={`text-xs ${styles.label}`}>{label}</span>
      </div>
      <p className={`text-xl font-bold ${styles.value}`}>{value}</p>
    </div>
  );
}

export default RequestStatsCard;
