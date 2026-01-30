import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBalance } from '../hooks/useBalance';
import { useFirebaseData } from '../hooks/useFirebaseData';
import { useUserRequests } from '../hooks/useUserRequests';
import { BalanceCard, Card, OfflineIndicator } from '../components/common';
import PersonalHistory from '../components/personal/PersonalHistory';
import RequestsList from '../components/solicitudes/RequestsList';
import NotificationCenter from '../components/notifications/NotificationCenter';
import { formatCurrency } from '../utils/helpers';

function AccountDetailPage() {
  const navigate = useNavigate();
  const { userId } = useParams();

  const { data: account, loading: accountLoading, error: accountError } = useFirebaseData(
    userId ? `familia_finanzas/cuentas/personales/${userId}` : null
  );
  const { balance: personalBalance, loading: loadingBalance, error: balanceError } = useBalance(
    'personal',
    userId
  );
  const { requests, loading: loadingRequests, error: errorRequests, counts } = useUserRequests(userId);

  const displayName = account?.nombreUsuario || account?.nombre || userId || 'Cuenta';
  const lastUpdated = useMemo(() => {
    if (!account?.ultimaActualizacion) return null;
    const date = new Date(account.ultimaActualizacion);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [account?.ultimaActualizacion]);

  if (!userId) {
    return (
      <div className="min-h-screen bg-background pb-20 text-foreground">
        <header className="sticky top-0 z-10 border-b border-border bg-white/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/admin')}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-white p-2 text-foreground-muted transition-colors hover:text-primary"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-heading text-2xl text-foreground">Cuenta no encontrada</h1>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
          <Card>
            <p className="text-sm text-foreground-muted">
              No se encontro un identificador de cuenta valido.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/admin')}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-white p-2 text-foreground-muted transition-colors hover:text-primary"
              aria-label="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-heading text-2xl text-foreground">{displayName}</h1>
              <p className="text-sm text-foreground-muted">Detalle de cuenta personal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <OfflineIndicator />
            <NotificationCenter />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 animate-slide-up">
        {accountLoading ? (
          <div className="rounded-2xl border border-border bg-muted/40 p-6 text-sm text-foreground-muted">
            Cargando informacion de la cuenta...
          </div>
        ) : accountError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
            {accountError}
          </div>
        ) : account ? (
          <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <BalanceCard
              title="Saldo personal"
              balance={personalBalance}
              loading={loadingBalance}
              error={balanceError}
              type="personal"
              showIndicator={true}
              threshold={50}
              large={true}
            />
            <Card
              title="Resumen"
              subtitle={lastUpdated ? `Actualizado: ${lastUpdated}` : 'Resumen de solicitudes'}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-warning/20 bg-warning/10 px-4 py-3">
                  <p className="text-xs text-warning">Pendientes</p>
                  <p className="text-xl font-semibold text-warning">{counts.pending}</p>
                </div>
                <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-3">
                  <p className="text-xs text-success">Aprobadas</p>
                  <p className="text-xl font-semibold text-success">{counts.approved}</p>
                </div>
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
                  <p className="text-xs text-destructive">Rechazadas</p>
                  <p className="text-xl font-semibold text-destructive">{counts.rejected}</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground-muted">
                Total solicitado: {formatCurrency(requests.reduce((sum, req) => sum + Number(req.cantidad || 0), 0))}
              </div>
            </Card>
          </section>
        ) : (
          <div className="rounded-2xl border border-border bg-muted/40 p-6 text-sm text-foreground-muted">
            No se encontro informacion de esta cuenta.
          </div>
        )}

        <section>
          <Card title={`Solicitudes de ${displayName}`} subtitle="Historial de solicitudes">
            <RequestsList
              title="Solicitudes"
              requests={requests}
              loading={loadingRequests}
              error={errorRequests}
            />
          </Card>
        </section>

        <section>
          <Card title="Historial personal" subtitle="Movimientos recientes">
            <PersonalHistory userId={userId} />
          </Card>
        </section>
      </main>
    </div>
  );
}

export default AccountDetailPage;
