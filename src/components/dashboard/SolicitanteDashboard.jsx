import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBalance } from '../../hooks/useBalance';
import { useAuthContext } from '../../contexts/AuthContext';
import BalanceCard from '../common/BalanceCard';
import ComingSoon from '../common/ComingSoon';
import MonthlySummary from './MonthlySummary';
import QuickActions from './QuickActions';
import RequestModal from '../solicitudes/RequestModal';

function SolicitanteDashboard() {
  const { user, logout, loading } = useAuthContext();
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.message;
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const { balance: personalBalance, loading: loadingPersonal, error: personalError } =
    useBalance('personal', userId);
  const { balance: casaBalance, loading: loadingCasa, error: casaError } =
    useBalance('casa');

  const hasAccess =
    !loading && user && user.role === 'solicitante' && user.userId === userId;

  if (!loading && !hasAccess) {
    return (
      <Navigate
        to="/"
        replace
        state={{ message: 'No tienes permiso para acceder a esta pagina.' }}
      />
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleUsePersonal = () => {
    navigate('/gasto-personal');
  };

  const handleRequestCasa = () => {
    setRequestModalOpen(true);
  };

  const handleCloseRequestModal = () => {
    setRequestModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
              Familia Finanzas
            </p>
            <h1 className="text-2xl font-semibold text-slate-50">
              Hola, {user?.userName || userId}
            </h1>
            <p className="text-sm text-slate-400">Dashboard Solicitante</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Cerrar sesion"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar sesion</span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
        {notice && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            {notice}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <BalanceCard
            title="Mi Dinero Personal"
            balance={personalBalance}
            loading={loadingPersonal}
            error={personalError}
            type="personal"
            showIndicator={true}
            threshold={50}
            large={true}
          />
          <BalanceCard
            title="Dinero Casa"
            balance={casaBalance}
            loading={loadingCasa}
            error={casaError}
            type="casa"
            readonly={true}
            showIndicator={false}
          />
        </section>

        <section>
          <QuickActions
            onUsePersonal={handleUsePersonal}
            onRequestCasa={handleRequestCasa}
            personalBalance={personalBalance}
          />
        </section>

        <section>
          <MonthlySummary userId={userId} personalBalance={personalBalance} />
        </section>

        <section>
          <ComingSoon
            features={[
              'Historial de transacciones',
              'Graficos de gastos por categoria',
              'Notificaciones en tiempo real',
              'Exportar reportes',
            ]}
          />
        </section>

        <RequestModal isOpen={requestModalOpen} onClose={handleCloseRequestModal} />
      </main>
    </div>
  );
}

export default SolicitanteDashboard;
