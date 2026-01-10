import React, { useEffect, useMemo, useState } from 'react';
import { Lock, User, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useUsers } from '../../hooks/useUsers';

function LoginScreen() {
  const { user, login, loading, statusMessage } = useAuthContext();
  const { loading: usersLoading, error: usersError, getUsersByRole } =
    useUsers();
  const navigate = useNavigate();
  const location = useLocation();
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const routeMessage = location.state?.message;
  const solicitantes = useMemo(
    () => getUsersByRole('solicitante'),
    [getUsersByRole]
  );
  const isBusy = loading || isSubmitting;
  const disableUsers = isBusy || usersLoading;

  useEffect(() => {
    if (!loading && user) {
      const target =
        user.role === 'admin'
          ? '/dashboard/admin'
          : `/dashboard/solicitante/${user.userId}`;

      navigate(target, {
        replace: true,
        state: routeMessage ? { message: routeMessage } : undefined,
      });
    }
  }, [loading, user, routeMessage, navigate]);

  useEffect(() => {
    if (!user && routeMessage) {
      setNotice(routeMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [routeMessage, user, location.pathname, navigate]);

  useEffect(() => {
    if (!user && statusMessage) {
      setNotice(statusMessage);
    }
  }, [statusMessage, user]);

  const handleUserLogin = async (requester) => {
    if (isBusy || usersLoading) return;
    setNotice('');
    setIsSubmitting(true);

    const result = await login({
      type: 'solicitante',
      userId: requester.userId,
      userName: requester.nombre,
    });

    if (!result?.success) {
      setIsSubmitting(false);
      setNotice(result?.error || 'No se pudo iniciar sesion.');
      return;
    }

    setIsSubmitting(false);
    navigate(`/dashboard/solicitante/${requester.userId}`, { replace: true });
  };

  const handleOpenAdmin = () => {
    if (isBusy) return;
    setNotice('');
    setPinOpen(true);
    setPin('');
    setPinError('');
  };

  const handleCloseModal = () => {
    if (isBusy) return;
    setPinOpen(false);
    setPin('');
    setPinError('');
  };

  const handlePinChange = (event) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 6);
    setPin(value);
    if (pinError) setPinError('');
  };

  const handleAdminSubmit = async (event) => {
    event.preventDefault();
    if (isBusy) return;

    setNotice('');
    setPinError('');

    if (!/^\d{6}$/.test(pin)) {
      setPinError('PIN incorrecto. Intenta nuevamente.');
      return;
    }

    setIsSubmitting(true);
    const result = await login({ type: 'admin', pin });

    if (!result?.success) {
      setIsSubmitting(false);
      setPinError(result?.error || 'PIN incorrecto. Intenta nuevamente.');
      return;
    }

    setIsSubmitting(false);
    setPinOpen(false);
    setPin('');
    navigate('/dashboard/admin', { replace: true });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-400">
          Familia Finanzas
        </p>
        <h1 className="text-3xl font-semibold text-slate-50">Selecciona tu usuario</h1>
        <p className="text-sm text-slate-400">
          Acceso rapido para solicitantes y administradores.
        </p>
      </header>

      {notice && !user && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          {notice}
        </div>
      )}

      {usersError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          Error al cargar usuarios.
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Selecciona tu usuario</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Solicitantes</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {usersLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="min-h-[56px] rounded-2xl bg-slate-800/80 animate-pulse"
                />
              ))
            : solicitantes.map((requester) => (
                <button
                  key={requester.userId}
                  type="button"
                  disabled={disableUsers}
                  onClick={() => handleUserLogin(requester)}
                  className="flex min-h-[56px] flex-col items-start gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-left text-white transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <User className="h-5 w-5 text-blue-100" />
                  <span className="text-base font-semibold">{requester.nombre}</span>
                  <span className="text-xs text-blue-100/80">Solicitante</span>
                </button>
              ))}
        </div>
        {!usersLoading && solicitantes.length === 0 && !usersError && (
          <p className="text-sm text-slate-400">No hay usuarios activos.</p>
        )}
      </section>

      <section className="space-y-3">
        <button
          type="button"
          onClick={handleOpenAdmin}
          disabled={isBusy}
          className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl bg-cyan-600 px-4 py-3 text-base font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Lock className="h-5 w-5" />
          Entrar como Administrador
        </button>
        <p className="text-xs text-slate-500">Acceso protegido con PIN de 6 digitos.</p>
      </section>

      {pinOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 py-8">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-50 shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ingresa tu PIN</h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full border border-slate-700 p-2 text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAdminSubmit} className="mt-4 space-y-4">
              <label className="space-y-2 text-sm text-slate-300">
                PIN de 6 digitos
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={pin}
                  onChange={handlePinChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-cyan-400"
                />
              </label>
              {pinError && <p className="text-sm text-rose-400">{pinError}</p>}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isBusy}
                  className="flex-1 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Entrando...' : 'Entrar'}
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handleCloseModal}
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default LoginScreen;
