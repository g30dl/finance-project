import React from 'react';

const STATUS_STYLES = {
  pending: 'border-warning/30 bg-warning/10 text-warning',
  approved: 'border-success/30 bg-success/10 text-success',
  rejected: 'border-destructive/30 bg-destructive/10 text-destructive',
};

const LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || 'border-border bg-secondary text-muted-foreground';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-2.5 py-1 text-xs font-medium ${style}`}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status] || status}
    </span>
  );
};

export default StatusBadge;

