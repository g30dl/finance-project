import React from 'react';
import { Badge } from '../common';
import { formatCurrency, getRelativeTime } from '../../utils/helpers';
import { getCategoryColor, getCategoryIcon } from '../../utils/categories';

const STATUS_CONFIG = {
  pendiente: {
    badge: 'warning',
    label: 'Pendiente',
    card: 'border-warning/35 bg-warning/10',
  },
  aprobada: {
    badge: 'success',
    label: 'Aprobada',
    card: 'border-success/35 bg-success/10',
  },
  rechazada: {
    badge: 'danger',
    label: 'Rechazada',
    card: 'border-destructive/35 bg-destructive/10',
  },
};

function RequestCard({ request, onClick }) {
  const { cantidad, categoria, concepto, estado, fechaSolicitud, motivoRechazo } = request;

  const config = STATUS_CONFIG[estado] || STATUS_CONFIG.pendiente;
  const categoryIcon = getCategoryIcon(categoria);
  const categoryColor = getCategoryColor(categoria);

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`vintage-card rounded-md border p-4 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''
      } ${config.card}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`text-2xl ${categoryColor}`}>{categoryIcon}</span>
          <div>
            <p className="font-heading text-sm text-foreground">
              {categoria?.replace('_', ' ') || 'Categoria'}
            </p>
            <p className="text-xs text-muted-foreground">{getRelativeTime(fechaSolicitud)}</p>
          </div>
        </div>
        <p className="font-heading text-xl text-foreground">{formatCurrency(cantidad)}</p>
      </div>

      <p className="mb-3 max-h-10 overflow-hidden text-sm text-muted-foreground">{concepto}</p>

      <div className="flex items-center justify-between">
        <Badge variant={config.badge} dot>
          {config.label}
        </Badge>
      </div>

      {estado === 'rechazada' && motivoRechazo ? (
        <div className="mt-3 border-t border-destructive/30 pt-3">
          <p className="text-sm text-destructive">
            <span className="font-medium">Motivo: </span>
            {motivoRechazo}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default RequestCard;

