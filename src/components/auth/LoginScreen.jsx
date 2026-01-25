import React, { useEffect, useMemo, useState } from 'react';
import { Shield, User, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useUsers } from '../../hooks/useUsers';

function LoginScreen() {
  const { user, login, loading, statusMessage } = useAuthContext();
  const { loading: usersLoading, error: usersError, getUsersByRole } = useUsers();
  const navigate = useNavigate();
  const location = useLocation();

  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const routeMessage = location.state?.message;
  const solicitantes = useMemo(() => getUsersByRole('solicitante'), [getUsersByRole]);
  const isBusy = loading || isSubmitting;
  const disableUsers = isBusy || usersLoading;

  useEffect(() => {
    if (!loading && user) {
      const target =
        user.role === 'admin' ? '/dashboard/admin' : `/dashboard/solicitante/${user.userId}`;

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

    setIsSubmitting(false);

    if (!result?.success) {
      setNotice(result?.error || 'No se pudo iniciar sesion.');
      return;
    }

    navigate(`/dashboard/solicitante/${requester.userId}`, { replace: true });
  };

  const runAdminLogin = async (payload) => {
    if (isBusy) return;
    setNotice('');
    setAdminError('');
    setIsSubmitting(true);

    const result = await login({ type: 'admin', ...payload });

    setIsSubmitting(false);

    if (!result?.success) {
      const message = result?.error || 'No se pudo iniciar sesion como administrador.';
      setAdminError(message);
      setNotice(message);
      return;
    }

    setAdminOpen(false);
    navigate('/dashboard/admin', { replace: true });
  };

  const handleAdminLoginGoogle = () => runAdminLogin({ method: 'google' });

  const handleAdminLoginPassword = async (event) => {
    event.preventDefault();
    await runAdminLogin({
      method: 'password',
      email: adminEmail.trim(),
      password: adminPassword,
    });
  };

  const handleOpenAdmin = () => {
    if (isBusy) return;
    setNotice('');
    setAdminError('');
    setAdminEmail('');
    setAdminPassword('');
    setAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    if (isSubmitting) return;
    setAdminError('');
    setAdminOpen(false);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-400">
          Familia Finanzas
        </p>
        <h1 className="text-3xl font-semibold text-slate-50">Selecciona tu usuario</h1>
        <p className="text-sm text-slate-400">Acceso rapido para solicitantes y administradores.</p>
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
                  className="min-h-[56px] animate-pulse rounded-2xl bg-slate-800/80"
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
          className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base font-semibold text-slate-100 transition-all duration-200 hover:border-cyan-500 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Shield className="h-5 w-5" />
          Acceso para administradores
        </button>
        <p className="text-xs text-slate-500">Protegido. Solo cuentas autorizadas.</p>
      </section>

      {adminOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 py-8">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-50 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Administradores</h3>
              <button
                type="button"
                onClick={handleCloseAdmin}
                className="rounded-full border border-slate-700 p-2 text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Ingresa con Google o con tu correo y contrasena.
            </p>

            {adminError && (
              <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {adminError}
              </div>
            )}

            <form onSubmit={handleAdminLoginPassword} className="mt-5 space-y-3">
              <label className="block space-y-1 text-sm text-slate-300">
                Correo
                <input
                  type="email"
                  autoComplete="email"
                  value={adminEmail}
                  onChange={(event) => {
                    setAdminEmail(event.target.value);
                    if (adminError) setAdminError('');
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-cyan-400"
                  placeholder="admin@correo.com"
                  disabled={isBusy}
                  required
                />
              </label>

              <label className="block space-y-1 text-sm text-slate-300">
                Contrasena
                <input
                  type="password"
                  autoComplete="current-password"
                  value={adminPassword}
                  onChange={(event) => {
                    setAdminPassword(event.target.value);
                    if (adminError) setAdminError('');
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-slate-50 outline-none transition focus:border-cyan-400"
                  placeholder="Tu contrasena"
                  disabled={isBusy}
                  required
                />
              </label>

              <button
                type="submit"
                disabled={isBusy}
                className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-base font-semibold text-slate-950 transition-all duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Shield className="h-5 w-5" />
                {isSubmitting ? 'Validando...' : 'Ingresar con correo'}
              </button>
            </form>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">o</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleAdminLoginGoogle}
                disabled={isBusy}
                className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 3.3 14.7 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.4s4.1 9.2 9.2 9.2c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1-.1-1.5H12z"
                  />
                  <path
                    fill="#34A853"
                    d="M3.7 7.7l3.2 2.3c.9-1.8 2.8-3.1 5.1-3.1 1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 3.3 14.7 2.2 12 2.2c-3.6 0-6.8 2-8.3 5z"
                  />
                  <path
                    fill="#4A90E2"
                    d="M12 20.6c2.6 0 4.8-.9 6.4-2.5l-3-2.5c-.8.5-1.9.9-3.4.9-3.3 0-6-2.7-6-6 0-.7.1-1.3.3-1.9l-3.3-2.5c-.6 1.2-1 2.6-1 4.1 0 5.1 4.1 9.4 9.2 9.4z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M6 11.4c0-.7.1-1.3.3-1.9L3 7c-.6 1.2-1 2.6-1 4.1s.4 2.9 1 4.1l3.3-2.5c-.2-.6-.3-1.2-.3-1.9z"
                  />
                </svg>
                {isSubmitting ? 'Conectando...' : 'Ingresar con Google'}
              </button>
              <button
                type="button"
                onClick={handleCloseAdmin}
                disabled={isBusy}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default LoginScreen;
