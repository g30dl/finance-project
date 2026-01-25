import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  FileText,
  XCircle,
} from 'lucide-react';
import { getRelativeTime } from '../../utils/helpers';

const NOTIF_CONFIG = {
  nueva_solicitud: {
    icon: <FileText className="h-5 w-5" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  solicitud_aprobada: {
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  solicitud_rechazada: {
    icon: <XCircle className="h-5 w-5" />,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
  },
  deposito_recibido: {
    icon: <DollarSign className="h-5 w-5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  deposito_personal: {
    icon: <DollarSign className="h-5 w-5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  saldo_bajo: {
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
};

const DEFAULT_CONFIG = {
  icon: <FileText className="h-5 w-5" />,
  color: 'text-slate-300',
  bgColor: 'bg-slate-700/30',
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
      className={`cursor-pointer rounded-lg p-3 transition-colors hover:bg-slate-800/50 ${
        notification.leida ? 'bg-transparent' : 'bg-slate-800/30'
      }`}
    >
      <div className="flex gap-3">
        <div className={`${config.bgColor} ${config.color} rounded-lg p-2`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-200">{notification.mensaje}</p>
          <p className="mt-1 text-xs text-slate-500">
            {getRelativeTime(notification.fecha)}
          </p>
        </div>
        {!notification.leida ? (
          <div className="mt-2 h-2 w-2 rounded-full bg-cyan-400" />
        ) : null}
      </div>
    </div>
  );
}

export default NotificationItem;
