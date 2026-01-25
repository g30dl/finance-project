import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBalance } from '../../hooks/useBalance';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { usePendingRequests } from '../../hooks/usePendingRequests';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePersonalAccountsTotal } from '../../hooks/usePersonalAccountsTotal';
import { useSystemAlerts } from '../../hooks/useSystemAlerts';
import AlertBanner from '../common/AlertBanner';
import BalanceCard from '../common/BalanceCard';
import ComingSoon from '../common/ComingSoon';
import AccountsGrid from './AccountsGrid';
import AdminQuickActions from './AdminQuickActions';
import SystemSummary from './SystemSummary';
import ApproveRequestsModal from '../solicitudes/ApproveRequestsModal';
import TransferModal from '../admin/TransferModal';
import DepositModal from '../admin/DepositModal';
import NotificationCenter from '../notifications/NotificationCenter';

function AdminDashboard() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.message;
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  const { balance: casaBalance, loading: loadingCasa } = useBalance('casa');
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

  const personalTotal = usePersonalAccountsTotal(personalAccounts);
  const alerts = useSystemAlerts({
    personalAccounts,
    casaBalance,
    pendingRequests,
    onViewRequests: () => setApproveModalOpen(true),
  });

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
  const handleDirectExpense = () => navigate('/gasto-directo');
  const handleRecurringExpenses = () => navigate('/gastos-recurrentes');
  const handleReports = () => navigate('/reportes');

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
          <div className="space-y-1">
            <p className="text-sm text-slate-400">Panel de Control</p>
            <h1 className="text-2xl font-semibold text-slate-50">Administrador</h1>
            <p className="text-sm text-slate-500">{user?.userName || 'Admin'}</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesion"
              className="rounded-lg bg-slate-800 p-2 transition-colors hover:bg-slate-700"
            >
              <LogOut className="h-5 w-5 text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
        {notice && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            {notice}
          </div>
        )}

        {alerts.length > 0 ? (
          <section>
            <AlertBanner alerts={alerts} />
          </section>
        ) : null}

        <section>
          <BalanceCard
            title="Dinero Casa - Cuenta Compartida"
            balance={casaBalance}
            loading={loadingCasa}
            type="casa"
            showIndicator={true}
            threshold={100}
            large={true}
          />
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-200">
            Cuentas Personales
          </h2>
          <AccountsGrid
            accounts={personalAccounts}
            loading={loadingAccounts}
            error={accountsError}
            onAccountClick={handleAccountClick}
          />
        </section>

        <section>
          <SystemSummary
            casaBalance={casaBalance}
            personalAccountsTotal={personalTotal}
            loading={loadingCasa || loadingAccounts}
          />
        </section>

        <section>
          <AdminQuickActions
            pendingRequests={pendingRequests}
            onDeposit={handleDeposit}
            onTransfer={handleTransfer}
            onApproveRequests={handleApproveRequests}
            onDirectExpense={handleDirectExpense}
            onRecurringExpenses={handleRecurringExpenses}
            onReports={handleReports}
          />
        </section>

        <section>
          <ComingSoon
            features={[
              'Vista detallada de cada cuenta personal',
              'Historial completo de transacciones',
              'Reportes y analisis por periodo',
              'Graficos de tendencias',
              'Exportar datos a Excel/CSV',
            ]}
          />
        </section>
      </main>

      <ApproveRequestsModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        requests={pendingRequestsData}
        loading={loadingPendingRequests}
        error={pendingRequestsError}
      />

      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
      />

      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
      />
    </div>
  );
}

export default AdminDashboard;
