import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Shield, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useUsers } from '../../hooks/useUsers';
import { Alert, Button, Input, Modal } from '../common';

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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
      const target = user.role === 'admin' ? '/dashboard/admin' : `/dashboard/solicitante/${user.userId}`;

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
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-12 text-foreground">
      <header className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary">Familia Finanzas</p>
        <h1 className="font-heading text-4xl text-foreground">Selecciona tu usuario</h1>
        <p className="text-sm text-muted-foreground">Acceso rapido para solicitantes y administradores.</p>
      </header>

      {notice && !user ? (
        <div className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          {notice}
        </div>
      ) : null}

      {usersError ? (
        <Alert variant="danger" title="Error al cargar usuarios">
          {usersError}
        </Alert>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg text-foreground">Solicitantes</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Acceso rapido</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {usersLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="min-h-[72px] animate-pulse rounded-md bg-secondary/80" />
              ))
            : solicitantes.map((requester) => {
                const initials = getInitials(requester.nombre);
                return (
                  <button
                    key={requester.userId}
                    type="button"
                    disabled={disableUsers}
                    onClick={() => handleUserLogin(requester)}
                    className="vintage-card-hover flex min-h-[72px] items-center gap-4 rounded-md border p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/20 bg-secondary text-primary">
                      {initials ? (
                        <span className="font-heading text-base">{initials}</span>
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="block font-heading text-sm text-foreground">{requester.nombre}</span>
                      <span className="block text-xs text-muted-foreground">Solicitante</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                );
              })}
        </div>
        {!usersLoading && solicitantes.length === 0 && !usersError ? (
          <p className="text-sm text-muted-foreground">No hay usuarios activos.</p>
        ) : null}
      </section>

      <div className="divider-ornament flex items-center justify-center gap-4 py-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs italic text-muted-foreground font-heading">Administracion</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <section className="space-y-3">
        <button
          type="button"
          onClick={handleOpenAdmin}
          disabled={isBusy}
          className="balance-card flex min-h-[72px] w-full items-center justify-between gap-4 rounded-md p-4 text-left text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-base text-white">Acceso para administradores</p>
              <p className="text-xs text-white/80">Protegido. Solo cuentas autorizadas.</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-white/90" />
        </button>
      </section>

      <Modal
        isOpen={adminOpen}
        onClose={handleCloseAdmin}
        title="Administradores"
        size="sm"
        closeOnOverlayClick={!isSubmitting}
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Ingresa con Google o con tu correo y contrasena.
        </p>

        {adminError ? (
          <Alert variant="danger" className="mb-4">
            {adminError}
          </Alert>
        ) : null}

        <form onSubmit={handleAdminLoginPassword} className="space-y-3">
          <Input
            label="Correo"
            type="email"
            autoComplete="email"
            value={adminEmail}
            onChange={(event) => {
              setAdminEmail(event.target.value);
              if (adminError) setAdminError('');
            }}
            placeholder="admin@correo.com"
            disabled={isBusy}
            required
            fullWidth
          />

          <Input
            label="Contrasena"
            type="password"
            autoComplete="current-password"
            value={adminPassword}
            onChange={(event) => {
              setAdminPassword(event.target.value);
              if (adminError) setAdminError('');
            }}
            placeholder="Tu contrasena"
            disabled={isBusy}
            required
            fullWidth
          />

          <Button type="submit" disabled={isBusy} fullWidth icon={<Shield className="h-5 w-5" />}>
            {isSubmitting ? 'Validando...' : 'Ingresar con correo'}
          </Button>
        </form>

        <div className="divider-ornament flex items-center justify-center gap-4 py-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">o</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={handleAdminLoginGoogle}
            disabled={isBusy}
            variant="ghost"
            fullWidth
            className="justify-center border border-border bg-white text-foreground hover:bg-secondary"
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
          </Button>
          <Button type="button" onClick={handleCloseAdmin} disabled={isBusy} variant="outline" fullWidth>
            Cancelar
          </Button>
        </div>
      </Modal>
    </main>
  );
}

export default LoginScreen;

