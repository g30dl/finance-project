import React from 'react';
import StatusBadge from '../common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';

const getCategoryLabel = (categories, categoryId) =>
  categories.find((item) => item.id === categoryId)?.label || categoryId;

const RequestsList = ({
  requests,
  categories,
  onApprove,
  onReject,
  emptyLabel = 'No hay solicitudes registradas',
  showActions = false,
}) => {
  if (!requests?.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 shadow"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                {request.requesterName || 'Solicitante'}
              </p>
              <h4 className="text-base font-semibold text-white">{request.reason}</h4>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="rounded-md bg-slate-800 px-2 py-1">
                  {getCategoryLabel(categories, request.category)}
                </span>
                <span className="rounded-md bg-slate-800 px-2 py-1">
                  {formatDate(request.createdAt)}
                </span>
                <span className="rounded-md bg-slate-800 px-2 py-1">
                  {formatCurrency(request.amount)}
                </span>
              </div>
            </div>
            <StatusBadge status={request.status} />
          </div>

          {showActions && request.status === 'pending' ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onApprove?.(request)}
                className="rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-3 py-1.5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400 hover:bg-emerald-500/25"
              >
                Aprobar
              </button>
              <button
                type="button"
                onClick={() => onReject?.(request)}
                className="rounded-lg border border-rose-500/50 bg-rose-500/15 px-3 py-1.5 text-sm font-semibold text-rose-100 transition hover:border-rose-400 hover:bg-rose-500/25"
              >
                Rechazar
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default RequestsList;
