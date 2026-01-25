import React, { useMemo, useState } from 'react';
import { Alert, EmptyState, Select, Skeleton } from '../common';
import { usePersonalTransactions } from '../../hooks/usePersonalTransactions';
import { isUserIncome } from '../../utils/transactionHelpers';
import TransactionItem from './TransactionItem';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'ingresos', label: 'Ingresos' },
  { value: 'egresos', label: 'Egresos' },
];

function PersonalHistory({ userId }) {
  const { groupedByMonth, loading, error, isEmpty } = usePersonalTransactions(userId);
  const [filter, setFilter] = useState('all');

  const filteredGroups = useMemo(() => {
    if (!groupedByMonth.length) return [];
    if (filter === 'all') return groupedByMonth;

    return groupedByMonth
      .map((group) => {
        const items = group.items.filter((transaction) => {
          const income = isUserIncome(transaction, userId);
          return filter === 'ingresos' ? income : !income;
        });
        return { ...group, items };
      })
      .filter((group) => group.items.length > 0);
  }, [groupedByMonth, filter, userId]);

  if (!userId) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Falta userId para cargar el historial.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <Skeleton key={`history-skeleton-${item}`} height="h-24" className="rounded-md" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" title="Error">
        Error al cargar historial: {error}
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title="Sin movimientos"
        description="Aun no tienes movimientos en tu cuenta personal."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-heading text-lg text-foreground">Mi Historial Personal</h3>
        <div className="w-full sm:w-48">
          <Select
            options={FILTER_OPTIONS}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filtrar..."
          />
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No hay movimientos para este filtro.
        </p>
      ) : (
        filteredGroups.map((group) => (
          <div key={group.label} className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {group.label}
            </h4>
            <div className="space-y-3">
              {group.items.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} userId={userId} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default PersonalHistory;

