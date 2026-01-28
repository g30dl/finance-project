import React, { useMemo } from 'react';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { formatCurrency, formatDate } from '../../utils/helpers';

const getTimestamp = (transaction) =>
  Number(
    transaction?.fecha ||
      transaction?.fechaSolicitud ||
      transaction?.fechaRespuesta ||
      0
  );

function RecentActivityCard() {
  const { data, loading, error } = useFirebaseData('familia_finanzas/transacciones');

  const items = useMemo(() => {
    if (!data) return [];
    const values = Array.isArray(data) ? data : Object.values(data);
    return values
      .filter(Boolean)
      .sort((a, b) => getTimestamp(b) - getTimestamp(a))
      .slice(0, 5);
  }, [data]);

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <h3 className="text-sm font-semibold text-gray-700">Actividad reciente</h3>

      {loading ? (
        <p className="mt-4 text-sm text-gray-500">Cargando actividad...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">Sin movimientos recientes.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map((transaction) => (
            <div key={transaction.id || getTimestamp(transaction)} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{transaction.tipo || 'Movimiento'}</p>
                <p className="text-xs text-gray-500">{formatDate(getTimestamp(transaction))}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(transaction.cantidad)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentActivityCard;
