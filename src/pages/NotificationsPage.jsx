import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/notifications/NotificationItem';

function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { notifications, loading, error, markAsRead } = useNotifications(user?.userId, user?.role);

  const handleBack = () => {
    if (user?.role === 'admin') {
      navigate('/dashboard/admin');
      return;
    }

    navigate(`/dashboard/solicitante/${user?.userId || ''}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center rounded-sm border border-border bg-secondary p-2 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-primary"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl text-foreground">Notificaciones</h1>
            <p className="text-sm text-muted-foreground">Alertas y actualizaciones recientes.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 animate-slide-up">
        {loading ? (
          <div className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-muted-foreground shadow-card">
            Cargando notificaciones...
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-6 text-center text-muted-foreground shadow-card">
            <Bell className="mx-auto mb-2 h-10 w-10 opacity-50" />
            No tienes notificaciones.
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onMarkAsRead={markAsRead} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default NotificationsPage;
