import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useBalance } from '../../hooks/useBalance';
import { useMonthlyPersonalSummary } from '../../hooks/useMonthlyPersonalSummary';
import { useMonthlyStats } from '../../hooks/useMonthlyStats';
import { usePersonalTransactions } from '../../hooks/usePersonalTransactions';
import { isUserIncome } from '../../utils/transactionHelpers';
import UserAvatar from '../../components/profile/UserAvatar';
import BalanceOverview from '../../components/profile/BalanceOverview';
import QuickStats from '../../components/profile/QuickStats';
import SettingsSection from '../../components/profile/SettingsSection';
import LogoutButton from '../../components/profile/LogoutButton';
import BalanceTrendChart from '../../components/charts/BalanceTrendChart';
import AnimatedSection from '../../components/common/AnimatedSection';

function ProfileTab() {
  const { user } = useAuth();
  const { balance: personalBalance, loading: loadingPersonal } = useBalance(
    'personal',
    user?.userId
  );
  const { balance: casaBalance, loading: loadingCasa } = useBalance('casa');
  const { summary } = useMonthlyPersonalSummary(user?.userId);
  const { ingresos, gastos } = useMonthlyStats(user?.userId);
  const { transactions } = usePersonalTransactions(user?.userId);

  const favoriteCategory = useMemo(() => {
    const entries = Object.entries(summary?.categoryBreakdown || {});
    if (!entries.length) return '';
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }, [summary?.categoryBreakdown]);

  const trendData = useMemo(() => {
    const days = 14;
    const map = new Map();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));

    transactions.forEach((transaction) => {
      const timestamp = Number(
        transaction?.fecha ||
          transaction?.fechaSolicitud ||
          transaction?.fechaRespuesta ||
          0
      );
      if (timestamp < start.getTime()) return;
      const date = new Date(timestamp);
      const key = date.toISOString().slice(0, 10);
      const income = isUserIncome(transaction, user?.userId);
      const delta = income ? Number(transaction.cantidad) || 0 : -(Number(transaction.cantidad) || 0);
      map.set(key, (map.get(key) || 0) + delta);
    });

    let running = 0;
    const series = [];
    for (let i = 0; i < days; i += 1) {
      const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      running += map.get(key) || 0;
      const label = new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short' }).format(day);
      series.push({ date: label, balance: Math.round(running) });
    }
    return series;
  }, [transactions, user?.userId]);

  return (
    <div className="pb-24 px-4 pt-4 space-y-6">
      <AnimatedSection>
        <div className="flex items-center gap-4">
          <UserAvatar name={user?.userName || user?.email || 'Usuario'} />
          <div>
            <h2 className="font-heading text-2xl text-foreground">
              {user?.userName || 'Perfil'}
            </h2>
            <p className="text-sm text-foreground-muted">{user?.email || 'Cuenta activa'}</p>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.05}>
        <BalanceOverview
          personalBalance={personalBalance}
          casaBalance={casaBalance}
          isAdmin={user?.role === 'admin'}
          loadingPersonal={loadingPersonal}
          loadingCasa={loadingCasa}
        />
      </AnimatedSection>

      <AnimatedSection delay={0.1}>
        <QuickStats spent={gastos} income={ingresos} favoriteCategory={favoriteCategory} />
      </AnimatedSection>

      <AnimatedSection delay={0.15}>
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Tendencia de saldo</h3>
          <BalanceTrendChart data={trendData} />
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <SettingsSection />
      </AnimatedSection>

      <AnimatedSection delay={0.25}>
        <LogoutButton />
      </AnimatedSection>
    </div>
  );
}

export default ProfileTab;
