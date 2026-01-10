import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

function Alert({ variant = 'info', title, children, onClose, icon, className = '' }) {
  const variants = {
    success: {
      container: 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200',
      icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
    },
    warning: {
      container: 'bg-amber-950/30 border-amber-500/50 text-amber-200',
      icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    },
    danger: {
      container: 'bg-rose-950/30 border-rose-500/50 text-rose-200',
      icon: <AlertCircle className="h-5 w-5 text-rose-400" />,
    },
    info: {
      container: 'bg-blue-950/30 border-blue-500/50 text-blue-200',
      icon: <Info className="h-5 w-5 text-blue-400" />,
    },
  };

  const selected = variants[variant] || variants.info;

  return (
    <div
      role="alert"
      className={`relative rounded-lg border-2 p-4 ${selected.container} ${className}`}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex-shrink-0">{icon || selected.icon}</div>
        <div className="flex-1">
          {title ? <h4 className="mb-1 font-semibold">{title}</h4> : null}
          <div className="text-sm">{children}</div>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex-shrink-0 rounded p-1 transition-colors hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default Alert;
