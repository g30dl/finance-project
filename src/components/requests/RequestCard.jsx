import React from 'react';
import { formatCurrency, formatDate } from '../../utils/helpers';

const STATUS_STYLES = {
  pendiente: {
    badge: 'bg-yellow-100 text-yellow-700',
    border: 'border-yellow-200',
  },
  aprobada: {
    badge: 'bg-green-100 text-green-700',
    border: 'border-green-200',
  },
  rechazada: {
    badge: 'bg-red-100 text-red-700',
    border: 'border-red-200',
  },
};

function RequestCard({ request }) {
  const status = request?.estado || 'pendiente';
  const styles = STATUS_STYLES[status] || STATUS_STYLES.pendiente;
  const dateLabel = formatDate(request?.fechaSolicitud);

  return (
    <div className={`rounded-2xl border bg-white p-4 shadow-card ${styles.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900 capitalize">
            {request?.categoria || 'Categoria'}
          </p>
          <p className="text-xs text-gray-500">{dateLabel}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles.badge}`}>
          {status}
        </span>
      </div>

      <p className="mt-3 text-sm text-gray-600">{request?.concepto || 'Sin concepto'}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-heading font-bold text-gray-900">
          {formatCurrency(request?.cantidad)}
        </span>
        {status === 'rechazada' && request?.motivoRechazo ? (
          <span className="text-xs text-red-500">Motivo: {request.motivoRechazo}</span>
        ) : null}
      </div>
    </div>
  );
}

export default RequestCard;
