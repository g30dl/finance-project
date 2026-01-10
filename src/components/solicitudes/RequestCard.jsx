import React from 'react';
import { Badge } from '../common';
import { formatCurrency, getRelativeTime } from '../../utils/helpers';
import { getCategoryColor, getCategoryIcon } from '../../utils/categories';

const STATUS_CONFIG = {
  pendiente: {
    badge: 'warning',
    label: 'Pendiente',
    card: 'border-amber-500/30 bg-amber-950/10',
  },
  aprobada: {
    badge: 'success',
    label: 'Aprobada',
    card: 'border-emerald-500/30 bg-emerald-950/10',
  },
  rechazada: {
    badge: 'danger',
    label: 'Rechazada',
    card: 'border-rose-500/30 bg-rose-950/10',
  },
};

function RequestCard({ request, onClick }) {
  const {
    cantidad,
    categoria,
    concepto,
    estado,
    fechaSolicitud,
    motivoRechazo,
  } = request;

  const config = STATUS_CONFIG[estado] || STATUS_CONFIG.pendiente;
  const categoryIcon = getCategoryIcon(categoria);
  const categoryColor = getCategoryColor(categoria);

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`rounded-xl border-2 p-4 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg' : ''
      } ${config.card}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`text-2xl ${categoryColor}`}>{categoryIcon}</span>
          <div>
            <p className="font-medium text-slate-200">
              {categoria?.replace('_', ' ') || 'Categoria'}
            </p>
            <p className="text-sm text-slate-400">{getRelativeTime(fechaSolicitud)}</p>
          </div>
        </div>
        <p className="text-xl font-bold text-slate-100">
          {formatCurrency(cantidad)}
        </p>
      </div>

      <p className="mb-3 max-h-10 overflow-hidden text-sm text-slate-300">
        {concepto}
      </p>

      <div className="flex items-center justify-between">
        <Badge variant={config.badge} dot>
          {config.label}
        </Badge>
      </div>

      {estado === 'rechazada' && motivoRechazo ? (
        <div className="mt-3 border-t border-rose-500/30 pt-3">
          <p className="text-sm text-rose-300">
            <span className="font-medium">Motivo: </span>
            {motivoRechazo}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default RequestCard;
