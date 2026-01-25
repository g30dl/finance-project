import React from 'react';
import { AlertTriangle, CheckCircle, DollarSign, FileText, XCircle } from 'lucide-react';
import { getRelativeTime } from '../../utils/helpers';

const NOTIF_CONFIG = {
  nueva_solicitud: {
    icon: <FileText className="h-5 w-5" />,
    color: 'text-warning',
    surface: 'border-warning/25 bg-warning/10',
  },
  solicitud_aprobada: {
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-success',
    surface: 'border-success/25 bg-success/10',
  },
  solicitud_rechazada: {
    icon: <XCircle className="h-5 w-5" />,
    color: 'text-destructive',
    surface: 'border-destructive/25 bg-destructive/10',
  },
  deposito_recibido: {
    icon: <DollarSign className="h-5 w-5" />,
    color: 'text-info',
    surface: 'border-info/25 bg-info/10',
  },
  deposito_personal: {
    icon: <DollarSign className="h-5 w-5" />,
    color: 'text-info',
    surface: 'border-info/25 bg-info/10',
  },
  saldo_bajo: {
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-warning',
    surface: 'border-warning/25 bg-warning/10',
  },
};

const DEFAULT_CONFIG = {
  icon: <FileText className="h-5 w-5" />,
  color: 'text-muted-foreground',
  surface: 'border-border bg-secondary/70',
};

function NotificationItem({ notification, onMarkAsRead }) {
  const config = NOTIF_CONFIG[notification.tipo] || DEFAULT_CONFIG;

  const handleClick = () => {
    if (!notification.leida) {
      onMarkAsRead?.(notification.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          handleClick();
        }
      }}
      className={`cursor-pointer rounded-md border p-3 transition-colors hover:bg-secondary/60 ${
        notification.leida ? 'border-transparent bg-transparent' : 'border-border bg-secondary/70'
      }`}
    >
      <div className="flex gap-3">
        <div className={`flex items-center justify-center rounded-sm border p-2 ${config.surface} ${config.color}`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-foreground">{notification.mensaje}</p>
          <p className="mt-1 text-xs text-muted-foreground">{getRelativeTime(notification.fecha)}</p>
        </div>
        {!notification.leida ? <div className="mt-2 h-2 w-2 rounded-full bg-primary" /> : null}
      </div>
    </div>
  );
}

export default NotificationItem;

