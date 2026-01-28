import React from 'react';
import { CheckCircle, Clock, Home, XCircle } from 'lucide-react';
import { Card } from '../common';
import { formatCurrency } from '../../utils/helpers';

const STAT_STYLES = {
  blue: {
    container: 'border-primary/35 bg-primary/10',
    icon: 'text-primary',
    label: 'text-primary',
    value: 'text-primary',
  },
  emerald: {
    container: 'border-success/35 bg-success/10',
    icon: 'text-success',
    label: 'text-success',
    value: 'text-success',
  },
  rose: {
    container: 'border-destructive/35 bg-destructive/10',
    icon: 'text-destructive',
    label: 'text-destructive',
    value: 'text-destructive',
  },
  amber: {
    container: 'border-warning/35 bg-warning/10',
    icon: 'text-warning',
    label: 'text-warning',
    value: 'text-warning',
  },
};

function RequestStatsCard({ stats }) {
  const { total = 0, approved = 0, rejected = 0, pending = 0, approvalRate = 0, requestCount = 0 } =
    stats || {};

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
          <div className="rounded-md border border-border/80 bg-secondary/70 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tasa de Aprobacion</span>
              <span className="font-heading text-lg text-primary">{approvalRate.toFixed(1)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-sm bg-secondary">
              <div
                className="h-full bg-success transition-all duration-500"
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
    <div className={`rounded-md border p-3 ${styles.container}`}>
      <div className="mb-1 flex items-center gap-2">
        <div className={styles.icon}>{icon}</div>
        <span className={`text-xs ${styles.label}`}>{label}</span>
      </div>
      <p className={`font-heading text-xl ${styles.value}`}>{value}</p>
    </div>
  );
}

export default RequestStatsCard;
