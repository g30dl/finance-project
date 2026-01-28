import React, { useMemo } from 'react';
import { formatCurrency, formatDate } from '../../utils/helpers';

function PendingRequestsCard({ requests = [], loading, error, onViewAll }) {
  const items = useMemo(() => requests.slice(0, 3), [requests]);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Solicitudes pendientes</h3>
        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-primary"
          >
            Ver todas
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Cargando solicitudes...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No hay solicitudes pendientes.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((request) => (
            <div key={request.id || request.fechaSolicitud} className="rounded-2xl border border-gray-100 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">
                  {request.nombreUsuario || 'Usuario'}
                </p>
                <span className="text-xs text-gray-400">{formatDate(request.fechaSolicitud)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-500 capitalize">{request.categoria || 'Categoria'}</p>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(request.cantidad)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PendingRequestsCard;
