import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBalance } from '../../hooks/useBalance';
import { useUserRequests } from '../../hooks/useUserRequests';
import { useAuthContext } from '../../contexts/AuthContext';
import BalanceCard from '../common/BalanceCard';
import Card from '../common/Card';
import ComingSoon from '../common/ComingSoon';
import MonthlySummary from './MonthlySummary';
import QuickActions from './QuickActions';
import PersonalHistory from '../personal/PersonalHistory';
import RequestModal from '../solicitudes/RequestModal';
import RequestsList from '../solicitudes/RequestsList';
import NotificationCenter from '../notifications/NotificationCenter';

function SolicitanteDashboard() {
  const { user, logout, loading } = useAuthContext();
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.message;
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const { balance: personalBalance, loading: loadingPersonal, error: personalError } = useBalance(
    'personal',
    userId
  );
  const { balance: casaBalance, loading: loadingCasa, error: casaError } = useBalance('casa');
  const { requests, loading: loadingRequests, error: errorRequests, counts } = useUserRequests(userId);

  const hasAccess = !loading && user && user.role === 'solicitante' && user.userId === userId;

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
    <div className="min-h-screen bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Familia Finanzas
            </p>
            <h1 className="font-heading text-2xl text-foreground">Hola, {user?.userName || userId}</h1>
            <p className="text-sm text-muted-foreground">Dashboard Solicitante</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Cerrar sesion"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-border bg-secondary px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70 hover:text-primary"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar sesion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 slide-up">
        {notice ? (
          <div className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {notice}
          </div>
        ) : null}

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
          {counts.pending > 0 ? (
            <div className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
              <span className="font-semibold">
                {counts.pending} solicitud{counts.pending > 1 ? 'es' : ''}
              </span>{' '}
              pendiente{counts.pending > 1 ? 's' : ''} de aprobacion.
            </div>
          ) : null}
        </section>

        <section>
          <Card>
            <RequestsList requests={requests} loading={loadingRequests} error={errorRequests} />
          </Card>
        </section>

        <section>
          <Card title="Mi Historial Personal">
            <PersonalHistory userId={userId} />
          </Card>
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
