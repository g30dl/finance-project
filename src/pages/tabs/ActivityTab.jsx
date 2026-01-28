import React, { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { filterUserTransactions, isUserIncome } from '../../utils/transactionHelpers';
import TransactionFilter from '../../components/activity/TransactionFilter';
import DateRangePicker from '../../components/activity/DateRangePicker';
import TransactionList from '../../components/activity/TransactionList';
import MonthlyBarChart from '../../components/charts/MonthlyBarChart';
import AnimatedSection from '../../components/common/AnimatedSection';

const VALID_TYPES = new Set([
  'gasto_personal',
  'deposito_personal',
  'transferencia_casa_personal',
  'transferencia_personal_casa',
  'transferencia_personal_personal',
  'solicitud_aprobada',
]);

function ActivityTab() {
  const { user } = useAuth();
  const { data, loading, error } = useFirebaseData('familia_finanzas/transacciones');
  const [filter, setFilter] = useState('all');
  const [range, setRange] = useState('month');

  const startTimestamp = useMemo(() => {
    const now = new Date();
    switch (range) {
      case 'quarter':
        return new Date(now.getFullYear(), now.getMonth() - 2, 1).getTime();
      case 'year':
        return new Date(now.getFullYear(), now.getMonth() - 11, 1).getTime();
      case 'month':
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    }
  }, [range]);

  const userTransactions = useMemo(() => {
    if (!data || !user?.userId) return [];
    const values = filterUserTransactions(data, user.userId);
    return values.filter((transaction) => transaction && VALID_TYPES.has(transaction.tipo));
  }, [data, user?.userId]);

  const filteredTransactions = useMemo(() => {
    return userTransactions.filter((transaction) => {
      const timestamp = Number(
        transaction?.fecha ||
          transaction?.fechaSolicitud ||
          transaction?.fechaRespuesta ||
          0
      );
      if (timestamp < startTimestamp) return false;

      if (filter === 'all') return true;
      const income = isUserIncome(transaction, user?.userId);
      return filter === 'income' ? income : !income;
    });
  }, [userTransactions, startTimestamp, filter, user?.userId]);

  const chartData = useMemo(() => {
    const map = new Map();
    filteredTransactions.forEach((transaction) => {
      const timestamp = Number(
        transaction?.fecha ||
          transaction?.fechaSolicitud ||
          transaction?.fechaRespuesta ||
          0
      );
      const date = new Date(timestamp);
      const label = new Intl.DateTimeFormat('es-MX', { month: 'short' }).format(date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!map.has(key)) {
        map.set(key, { month: label, ingresos: 0, gastos: 0, _order: timestamp });
      }
      const bucket = map.get(key);
      const amount = Number(transaction.cantidad) || 0;
      if (isUserIncome(transaction, user?.userId)) {
        bucket.ingresos += amount;
      } else {
        bucket.gastos += amount;
      }
    });

    return Array.from(map.values())
      .sort((a, b) => a._order - b._order)
      .map(({ _order, ...rest }) => rest);
  }, [filteredTransactions, user?.userId]);

  return (
    <div className="pb-24 px-4 pt-4 space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-foreground">Actividad</h2>
        <p className="text-sm text-foreground-muted">Historial completo de movimientos</p>
      </div>

      <AnimatedSection>
        <TransactionFilter value={filter} onChange={setFilter} />
      </AnimatedSection>
      <AnimatedSection delay={0.05}>
        <DateRangePicker value={range} onChange={setRange} />
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Tendencia mensual</h3>
          <MonthlyBarChart data={chartData} />
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.15}>
        <TransactionList
          transactions={filteredTransactions}
          userId={user?.userId}
          loading={loading}
          error={error}
        />
      </AnimatedSection>
    </div>
  );
}

export default ActivityTab;
