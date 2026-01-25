import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils/helpers';

const StatCard = ({ label, value, hint, accentClass }) => (
  <div className="vintage-card rounded-md border p-4 shadow-card">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className={`mt-1 font-heading text-2xl ${accentClass}`}>{value}</p>
    {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
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
        accentClass="text-warning"
      />
      <StatCard
        label="Aprobadas"
        value={approved}
        hint="Solicitudes liberadas"
        accentClass="text-success"
      />
      <StatCard
        label="Rechazadas"
        value={rejected}
        hint="Solicitudes detenidas"
        accentClass="text-destructive"
      />
      <StatCard
        label="Total solicitado"
        value={formatCurrency(total)}
        hint="Importe acumulado"
        accentClass="text-primary"
      />
    </div>
  );
};

export default SummaryCards;

