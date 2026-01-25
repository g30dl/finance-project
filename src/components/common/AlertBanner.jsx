import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const getAlertStyles = (type) => {
  const styles = {
    warning: 'border-warning/40 bg-warning/10 text-warning',
    danger: 'border-destructive/40 bg-destructive/10 text-destructive',
    info: 'border-info/40 bg-info/10 text-info',
  };
  return styles[type] || styles.info;
};

const getIcon = (type) => {
  const icons = {
    warning: <AlertTriangle className="h-5 w-5" />,
    danger: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };
  return icons[type] || icons.info;
};

function AlertBanner({ alerts = [], onDismiss }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex flex-col gap-3 rounded-md border p-4 shadow-card sm:flex-row sm:items-center sm:justify-between ${getAlertStyles(
            alert.type
          )}`}
        >
          <div className="flex items-center gap-3">
            {getIcon(alert.type)}
            <p className="text-sm font-medium text-current">{alert.message}</p>
          </div>
          <div className="flex items-center gap-2">
            {alert.action ? (
              <button
                type="button"
                onClick={alert.action.onClick}
                className="rounded-sm border border-current/25 bg-white/50 px-3 py-1 text-xs font-heading font-semibold text-current transition-colors hover:bg-white/70"
              >
                {alert.action.text}
              </button>
            ) : null}
            {onDismiss ? (
              <button
                type="button"
                onClick={() => onDismiss(alert.id)}
                aria-label="Cerrar alerta"
                className="rounded-sm p-1 transition-colors hover:bg-white/40"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AlertBanner;

