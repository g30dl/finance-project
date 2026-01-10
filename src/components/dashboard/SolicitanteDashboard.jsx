import React from 'react';
import { LogOut } from 'lucide-react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBalance } from '../../hooks/useBalance';
import { useAuthContext } from '../../contexts/AuthContext';
import BalanceCard from '../common/BalanceCard';

function SolicitanteDashboard() {
  const { user, logout, loading } = useAuthContext();
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.message;

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

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Familia Finanzas
          </p>
          <h1 className="text-3xl font-semibold">
            Hola, {user?.userName || userId}
          </h1>
          <p className="text-sm text-slate-400">Dashboard Solicitante</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/70 hover:text-cyan-300"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesion
        </button>
      </header>

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
          color="green"
        />
        <BalanceCard
          title="Dinero Casa"
          balance={casaBalance}
          loading={loadingCasa}
          error={casaError}
          color="blue"
        />
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">
        Proximamente: Historial y estadisticas basicas.
      </section>
    </main>
  );
}

export default SolicitanteDashboard;
