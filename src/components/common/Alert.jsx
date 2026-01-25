import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

function Alert({ variant = 'info', title, children, onClose, icon, className = '' }) {
  const variants = {
    success: {
      container: 'border-success/35 bg-success/10 text-success',
      icon: <CheckCircle className="h-5 w-5 text-success" />,
    },
    warning: {
      container: 'border-warning/35 bg-warning/10 text-warning',
      icon: <AlertTriangle className="h-5 w-5 text-warning" />,
    },
    danger: {
      container: 'border-destructive/35 bg-destructive/10 text-destructive',
      icon: <AlertCircle className="h-5 w-5 text-destructive" />,
    },
    info: {
      container: 'border-info/35 bg-info/10 text-info',
      icon: <Info className="h-5 w-5 text-info" />,
    },
  };

  const selected = variants[variant] || variants.info;

  return (
    <div role="alert" className={`rounded-md border p-4 shadow-card ${selected.container} ${className}`}>
      <div className="flex gap-3">
        <div className="mt-0.5 flex-shrink-0">{icon || selected.icon}</div>
        <div className="flex-1 text-current">
          {title ? <h4 className="mb-1 font-heading text-base">{title}</h4> : null}
          <div className="text-sm">{children}</div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex-shrink-0 rounded-sm p-1 transition-colors hover:bg-secondary/60"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default Alert;

