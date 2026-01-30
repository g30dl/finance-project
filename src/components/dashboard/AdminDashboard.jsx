import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  FileText,
  Info,
  Loader2,
  LogOut,
  XCircle,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBalance } from '../../hooks/useBalance';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { usePendingRequests } from '../../hooks/usePendingRequests';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePersonalAccountsTotal } from '../../hooks/usePersonalAccountsTotal';
import { useSystemAlerts } from '../../hooks/useSystemAlerts';
import { useRecurringExpenses } from '../../hooks/useRecurringExpenses';
import { formatCurrency, getRelativeTime } from '../../utils/helpers';
import { OfflineIndicator } from '../common';
import AdminHeroSection from '../admin/AdminHeroSection';
import StatCardWithChart from '../admin/StatCardWithChart';
import TimelineActivity from '../admin/TimelineActivity';
import AccountsCarousel from '../admin/AccountsCarousel';
import RecurringExpensesList from '../admin/RecurringExpensesList';
import ApproveRequestsModal from '../solicitudes/ApproveRequestsModal';
import TransferModal from '../admin/TransferModal';
import DepositModal from '../admin/DepositModal';
import NotificationCenter from '../notifications/NotificationCenter';
import { motion } from 'framer-motion';

function AdminDashboard() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.message;
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const { processing: processingRecurring, result: recurringResult } = useRecurringExpenses(
    user?.userId,
    user?.role === 'admin'
  );

  const { balance: casaBalance } = useBalance('casa');
  const {
    data: personalAccounts,
    loading: loadingAccounts,
    error: accountsError,
  } = useFirebaseData('familia_finanzas/cuentas/personales');
  const {
    requests: pendingRequestsData,
    count: pendingRequests,
    loading: loadingPendingRequests,
    error: pendingRequestsError,
  } = usePendingRequests();
  const { data: requestsData } = useFirebaseData('familia_finanzas/solicitudes');
  const { data: transactionsData } = useFirebaseData('familia_finanzas/transacciones');

  const personalTotal = usePersonalAccountsTotal(personalAccounts);
  const alerts = useSystemAlerts({
    personalAccounts,
    casaBalance,
    pendingRequests,
    onViewRequests: () => setApproveModalOpen(true),
  });

  useEffect(() => {
    if (!recurringResult) return;
    if (recurringResult.successful > 0) {
      console.log(`Se ejecutaron ${recurringResult.successful} gastos recurrentes`);
    }
    if (recurringResult.failed > 0) {
      console.warn(`Fallaron ${recurringResult.failed} gastos recurrentes`);
    }
  }, [recurringResult]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleAccountClick = (accountId) => {
    navigate(`/cuenta-detalle/${accountId}`);
  };

  const handleDeposit = () => setDepositModalOpen(true);
  const handleTransfer = () => setTransferModalOpen(true);
  const handleApproveRequests = () => setApproveModalOpen(true);
  const handleRecurringExpenses = () => navigate('/gastos-recurrentes');
  const handleReports = () => navigate('/reportes');

  const requestsArray = useMemo(
    () => Object.values(requestsData || {}).filter(Boolean),
    [requestsData]
  );
  const transactionsArray = useMemo(
    () => Object.values(transactionsData || {}).filter(Boolean),
    [transactionsData]
  );
  const totalBalance = Number(casaBalance || 0) + Number(personalTotal || 0);
  const approvedCount = useMemo(
    () => requestsArray.filter((request) => request.estado === 'aprobada').length,
    [requestsArray]
  );
  const rejectedCount = useMemo(
    () => requestsArray.filter((request) => request.estado === 'rechazada').length,
    [requestsArray]
  );

  const buildSparkline = (items, getTimestamp, filter) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    const startTime = start.getTime();
    const buckets = Array.from({ length: 7 }, (_, index) => ({
      value: 0,
      time: startTime + index * 24 * 60 * 60 * 1000,
    }));

    items.forEach((item) => {
      if (filter && !filter(item)) return;
      const timestamp = Number(getTimestamp(item) || 0);
      if (!timestamp || timestamp < startTime) return;
      const dayIndex = Math.floor((timestamp - startTime) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < buckets.length) {
        buckets[dayIndex].value += 1;
      }
    });

    return buckets.map(({ value }) => ({ value }));
  };

  const countInRange = (items, getTimestamp, filter, start, end) => {
    let total = 0;
    items.forEach((item) => {
      if (filter && !filter(item)) return;
      const timestamp = Number(getTimestamp(item) || 0);
      if (timestamp >= start && timestamp < end) total += 1;
    });
    return total;
  };

  const getTrendLabel = (current, previous) => {
    if (!previous) return current ? '+100%' : '0%';
    const percent = ((current - previous) / previous) * 100;
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${Math.round(percent)}%`;
  };

  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const pendingTrend = getTrendLabel(
    countInRange(
      requestsArray,
      (item) => item.fechaSolicitud,
      (item) => item.estado === 'pendiente',
      now - weekMs,
      now
    ),
    countInRange(
      requestsArray,
      (item) => item.fechaSolicitud,
      (item) => item.estado === 'pendiente',
      now - weekMs * 2,
      now - weekMs
    )
  );
  const approvedTrend = getTrendLabel(
    countInRange(
      requestsArray,
      (item) => item.fechaRespuesta,
      (item) => item.estado === 'aprobada',
      now - weekMs,
      now
    ),
    countInRange(
      requestsArray,
      (item) => item.fechaRespuesta,
      (item) => item.estado === 'aprobada',
      now - weekMs * 2,
      now - weekMs
    )
  );
  const rejectedTrend = getTrendLabel(
    countInRange(
      requestsArray,
      (item) => item.fechaRespuesta,
      (item) => item.estado === 'rechazada',
      now - weekMs,
      now
    ),
    countInRange(
      requestsArray,
      (item) => item.fechaRespuesta,
      (item) => item.estado === 'rechazada',
      now - weekMs * 2,
      now - weekMs
    )
  );
  const transactionsTrend = getTrendLabel(
    countInRange(transactionsArray, (item) => item.fecha, null, now - weekMs, now),
    countInRange(transactionsArray, (item) => item.fecha, null, now - weekMs * 2, now - weekMs)
  );

  const statCards = [
    {
      id: 'pending',
      label: 'Solicitudes pendientes',
      value: pendingRequests,
      icon: FileText,
      color: 'warning',
      trend: pendingTrend,
      data: buildSparkline(
        requestsArray,
        (item) => item.fechaSolicitud,
        (item) => item.estado === 'pendiente'
      ),
    },
    {
      id: 'approved',
      label: 'Aprobaciones',
      value: approvedCount,
      icon: CheckCircle,
      color: 'success',
      trend: approvedTrend,
      data: buildSparkline(
        requestsArray,
        (item) => item.fechaRespuesta,
        (item) => item.estado === 'aprobada'
      ),
    },
    {
      id: 'rejected',
      label: 'Rechazos',
      value: rejectedCount,
      icon: XCircle,
      color: 'danger',
      trend: rejectedTrend,
      data: buildSparkline(
        requestsArray,
        (item) => item.fechaRespuesta,
        (item) => item.estado === 'rechazada'
      ),
    },
    {
      id: 'transactions',
      label: 'Transacciones',
      value: transactionsArray.length,
      icon: Activity,
      color: 'info',
      trend: transactionsTrend,
      data: buildSparkline(transactionsArray, (item) => item.fecha, null),
    },
  ];

  const recentActivities = useMemo(() => {
    return transactionsArray
      .filter((transaction) => transaction && (transaction.fecha || transaction.fechaSolicitud))
      .sort((a, b) => (b.fecha || b.fechaSolicitud || 0) - (a.fecha || a.fechaSolicitud || 0))
      .slice(0, 6)
      .map((transaction) => ({
        id: transaction.id || `${transaction.tipo}-${transaction.fecha}`,
        title: transaction.concepto
          ? `${transaction.tipo.replace(/_/g, ' ')}: ${transaction.concepto}`
          : transaction.tipo.replace(/_/g, ' '),
        time: getRelativeTime(transaction.fecha || transaction.fechaSolicitud),
        amount: transaction.cantidad ? formatCurrency(transaction.cantidad) : null,
        icon: <Activity className="h-4 w-4" />,
      }));
  }, [transactionsArray]);

  const alertStyles = {
    warning: {
      border: 'border-warning',
      icon: <AlertTriangle className="h-5 w-5 text-warning" />,
      chip: 'bg-warning/10',
    },
    danger: {
      border: 'border-danger',
      icon: <AlertCircle className="h-5 w-5 text-danger" />,
      chip: 'bg-danger/10',
    },
    info: {
      border: 'border-info',
      icon: <Info className="h-5 w-5 text-info" />,
      chip: 'bg-info/10',
    },
  };

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      {processingRecurring ? (
        <div className="fixed right-4 top-4 z-50 rounded-lg border border-info/30 bg-info/10 px-4 py-2 text-sm text-info shadow-sm">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
          Verificando gastos recurrentes...
        </div>
      ) : null}
      <header className="sticky top-0 z-10 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
          <div className="space-y-1">
            <p className="text-sm text-foreground-muted">Panel de control</p>
            <h1 className="font-heading text-2xl text-foreground">Administrador</h1>
            <p className="text-sm text-foreground-muted">{user?.userName || 'Admin'}</p>
          </div>
          <div className="flex items-center gap-3">
            <OfflineIndicator />
            <NotificationCenter />
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesion"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-white p-2 text-foreground-muted transition-colors hover:text-primary"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-6">
        {notice ? (
          <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {notice}
          </div>
        ) : null}

        <section>
          <AdminHeroSection
            casaBalance={casaBalance || 0}
            personalTotal={personalTotal || 0}
            totalBalance={totalBalance}
            onDeposit={handleDeposit}
            onTransfer={handleTransfer}
            onApprove={handleApproveRequests}
            onRecurring={handleRecurringExpenses}
            onReports={handleReports}
          />
        </section>

        {alerts.length > 0 ? (
          <section>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {alerts.map((alert) => {
                const styles = alertStyles[alert.type] || alertStyles.info;
                return (
                  <div
                    key={alert.id}
                    className={`w-80 flex-shrink-0 rounded-2xl border-l-4 ${styles.border} bg-white p-4 shadow-lg`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-xl p-2 ${styles.chip}`}>{styles.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {alert.message}
                        </p>
                        {alert.action ? (
                          <button
                            type="button"
                            onClick={alert.action.onClick}
                            className="mt-2 text-xs font-semibold text-primary hover:underline"
                          >
                            {alert.action.text}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <section>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <StatCardWithChart
                key={stat.id}
                label={stat.label}
                value={stat.value}
                trend={stat.trend}
                icon={stat.icon}
                color={stat.color}
                data={stat.data}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-card"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-heading text-xl text-foreground">Solicitudes pendientes</h3>
                <p className="text-sm text-foreground-muted">
                  {pendingRequests} solicitudes por revisar
                </p>
              </div>
              <button
                type="button"
                onClick={handleApproveRequests}
                className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                Ver todas
              </button>
            </div>

            {loadingPendingRequests ? (
              <div className="rounded-2xl border border-border bg-muted/50 p-4 text-sm text-foreground-muted">
                Cargando solicitudes...
              </div>
            ) : pendingRequestsError ? (
              <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                {pendingRequestsError}
              </div>
            ) : pendingRequestsData.length === 0 ? (
              <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-foreground-muted">
                No hay solicitudes pendientes por ahora.
              </div>
            ) : (
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                }}
                className="space-y-3"
              >
                {pendingRequestsData.slice(0, 3).map((request) => (
                  <motion.div
                    key={request.id}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-gradient-to-r from-background to-white p-4 transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-white font-heading">
                      {(request.nombreUsuario || 'NA').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {request.nombreUsuario || 'Solicitante'}
                      </p>
                      <p className="text-sm text-foreground-muted">
                        {(request.concepto || '').slice(0, 40)}
                        {(request.concepto || '').length > 40 ? '...' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-xl font-bold text-primary">
                        {formatCurrency(request.cantidad)}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {request.categoria || 'General'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-accent/5 to-primary/5 p-6"
          >
            <h3 className="mb-4 font-heading text-lg text-foreground">Actividad reciente</h3>
            <TimelineActivity items={recentActivities} />
          </motion.div>
        </section>

        <section>
          <RecurringExpensesList />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-xl text-foreground">Cuentas personales</h2>
            <span className="text-sm text-foreground-muted">
              {loadingAccounts ? '...' : `${Object.keys(personalAccounts || {}).length} cuentas`}
            </span>
          </div>
          {loadingAccounts ? (
            <div className="rounded-3xl border border-border bg-muted/40 p-6 text-sm text-foreground-muted">
              Cargando cuentas personales...
            </div>
          ) : accountsError ? (
            <div className="rounded-3xl border border-danger/30 bg-danger/10 p-6 text-sm text-danger">
              Error al cargar cuentas personales.
            </div>
          ) : (
            <AccountsCarousel
              accounts={personalAccounts}
              onAccountClick={handleAccountClick}
            />
          )}
        </section>
      </main>

      <ApproveRequestsModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        requests={pendingRequestsData}
        loading={loadingPendingRequests}
        error={pendingRequestsError}
      />

      <TransferModal isOpen={transferModalOpen} onClose={() => setTransferModalOpen(false)} />

      <DepositModal isOpen={depositModalOpen} onClose={() => setDepositModalOpen(false)} />
    </div>
  );
}

export default AdminDashboard;
