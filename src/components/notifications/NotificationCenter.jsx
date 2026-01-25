import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';

function NotificationCenter() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const { notifications, loading, error, unreadCount, markAsRead } = useNotifications(
    user?.userId,
    user?.role
  );

  const recentNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notificaciones"
        className="relative rounded-sm border border-border bg-secondary p-2 text-foreground transition-colors hover:bg-secondary/70 hover:text-primary"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 rounded-sm bg-destructive px-1.5 py-0.5 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-80 vintage-card rounded-md shadow-card">
          <div className="flex items-center justify-between border-b border-border/80 px-4 py-3">
            <span className="font-heading text-sm text-foreground">Notificaciones</span>
            <span className="text-xs text-muted-foreground">{notifications.length} total</span>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : error ? (
              <div className="px-3 py-4 text-center text-sm text-destructive">{error}</div>
            ) : recentNotifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No tienes notificaciones.
              </div>
            ) : (
              <div className="space-y-2">
                {recentNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate('/notificaciones');
            }}
            className="w-full border-t border-border/80 px-4 py-3 text-sm font-heading font-semibold text-primary transition-colors hover:bg-secondary/60"
          >
            Ver todas
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationCenter;

