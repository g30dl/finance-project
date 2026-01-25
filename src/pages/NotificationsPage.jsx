import React from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/notifications/NotificationItem';

function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { notifications, loading, error, markAsRead } = useNotifications(
    user?.userId,
    user?.role
  );

  const handleBack = () => {
    if (user?.role === 'admin') {
      navigate('/dashboard/admin');
      return;
    }

    navigate(`/dashboard/solicitante/${user?.userId || ''}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-lg p-2 transition-colors hover:bg-slate-800"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5 text-slate-300" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-50">Notificaciones</h1>
            <p className="text-sm text-slate-400">
              Alertas y actualizaciones recientes.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
        {loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center text-slate-400">
            Cargando notificaciones...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-300">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center text-slate-400">
            <Bell className="mx-auto mb-2 h-10 w-10 opacity-40" />
            No tienes notificaciones.
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default NotificationsPage;
