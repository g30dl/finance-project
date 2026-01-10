import React, { useMemo } from 'react';
import { LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBalance } from '../../hooks/useBalance';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { formatCurrency } from '../../utils/helpers';
import { useAuthContext } from '../../contexts/AuthContext';
import BalanceCard from '../common/BalanceCard';
import AccountsGrid from './AccountsGrid';

function AdminDashboard() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.message;

  const { balance: casaBalance, loading: loadingCasa, error: casaError } =
    useBalance('casa');
  const {
    data: accountsData,
    loading: loadingAccounts,
    error: accountsError,
  } = useFirebaseData('familia_finanzas/cuentas/personales');

  const accounts = useMemo(() => {
    if (!accountsData) return [];
    return Object.entries(accountsData)
      .map(([userId, account]) => ({ userId, ...account }))
      .filter((account) => account.activa !== false)
      .sort((a, b) =>
        (a.nombreUsuario || '').localeCompare(b.nombreUsuario || '', 'es', {
          sensitivity: 'base',
        })
      );
  }, [accountsData]);

  const totalPersonal = useMemo(
    () => accounts.reduce((sum, account) => sum + (Number(account.saldo) || 0), 0),
    [accounts]
  );

  const totalBalance = useMemo(() => {
    const casaValue = Number(casaBalance) || 0;
    return casaValue + totalPersonal;
  }, [casaBalance, totalPersonal]);

  const totalLoading = loadingCasa || loadingAccounts;
  const totalError = casaError || accountsError;

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
            Familia Finanzas
          </p>
          <h1 className="text-3xl font-semibold">Dashboard Administrador</h1>
          <p className="text-sm text-slate-400">
            Bienvenido,{' '}
            <span className="text-cyan-300">{user?.userName || 'Admin'}</span>
          </p>
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

      <section>
        <BalanceCard
          title="Dinero Casa"
          balance={casaBalance}
          loading={loadingCasa}
          error={casaError}
          color="blue"
          large={true}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cuentas Personales</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Activas</span>
        </div>
        <AccountsGrid
          accounts={accounts}
          loading={loadingAccounts}
          error={accountsError}
        />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Total en el sistema
        </p>
        {totalLoading ? (
          <div className="mt-3 h-10 w-40 rounded-lg bg-slate-800/80 animate-pulse" />
        ) : (
          <p className="mt-3 text-3xl font-semibold text-cyan-300">
            {formatCurrency(totalBalance)}
          </p>
        )}
        {totalError && (
          <p className="mt-2 text-xs text-rose-400">Error al cargar saldos.</p>
        )}
      </section>
    </main>
  );
}

export default AdminDashboard;
