import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/helpers';

const StatCard = ({ label, value, hint, accentClass }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 shadow-sm">
    <p className="text-sm text-slate-400">{label}</p>
    <p className={`mt-1 text-2xl font-bold ${accentClass}`}>{value}</p>
    {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
  </div>
);

const SummaryCards = ({ requests }) => {
  const { pending, approved, rejected, total } = useMemo(() => {
    const totals = { pending: 0, approved: 0, rejected: 0, total: 0 };
    requests.forEach((item) => {
      totals[item.status] += 1;
      totals.total += Number(item.amount) || 0;
    });
    return totals;
  }, [requests]);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard
        label="Pendientes"
        value={pending}
        hint="Listas para aprobar o rechazar"
        accentClass="text-amber-200"
      />
      <StatCard
        label="Aprobadas"
        value={approved}
        hint="Solicitudes liberadas"
        accentClass="text-emerald-200"
      />
      <StatCard
        label="Rechazadas"
        value={rejected}
        hint="Solicitudes detenidas"
        accentClass="text-rose-200"
      />
      <StatCard
        label="Total solicitado"
        value={formatCurrency(total)}
        hint="Importe acumulado"
        accentClass="text-cyan-200"
      />
    </div>
  );
};

export default SummaryCards;
