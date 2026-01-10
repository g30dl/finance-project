import React from 'react';

const STATUS_STYLES = {
  pending: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  approved: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
  rejected: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
};

const LABELS = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || 'border-slate-500/40 bg-slate-500/10 text-slate-200';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${style}`}
    >
      <span className="inline-block h-2 w-2 rounded-full bg-current" />
      {LABELS[status] || status}
    </span>
  );
};

export default StatusBadge;
