import React, { useMemo, useState } from 'react';
import { EmptyState, Select } from '../common';
import { FileText } from 'lucide-react';
import RequestCard from './RequestCard';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'aprobada', label: 'Aprobadas' },
  { value: 'rechazada', label: 'Rechazadas' },
];

function RequestsList({ requests, loading, error }) {
  const [filter, setFilter] = useState('all');

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    if (filter === 'all') return requests;
    return requests.filter((request) => request.estado === filter);
  }, [requests, filter]);

  const groupedRequests = useMemo(() => {
    return {
      pendiente: filteredRequests.filter((request) => request.estado === 'pendiente'),
      aprobada: filteredRequests.filter((request) => request.estado === 'aprobada'),
      rechazada: filteredRequests.filter((request) => request.estado === 'rechazada'),
    };
  }, [filteredRequests]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`request-skeleton-${index}`}
            className="h-32 rounded-xl bg-slate-800/80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-6">
        <p className="text-center text-rose-400">{error}</p>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="No tienes solicitudes"
        description="Cuando crees solicitudes de dinero, apareceran aqui."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-slate-200">
          Mis Solicitudes
          <span className="ml-2 text-sm font-normal text-slate-400">
            ({filteredRequests.length})
          </span>
        </h3>
        <div className="w-full sm:w-48">
          <Select
            options={FILTER_OPTIONS}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filtrar..."
          />
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <p className="py-8 text-center text-slate-400">
          No hay solicitudes con este filtro.
        </p>
      ) : null}

      {(filter === 'all' || filter === 'pendiente') &&
      groupedRequests.pendiente.length > 0 ? (
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-400">
            PENDIENTES ({groupedRequests.pendiente.length})
          </h4>
          <div className="space-y-3">
            {groupedRequests.pendiente.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      ) : null}

      {(filter === 'all' || filter === 'aprobada') &&
      groupedRequests.aprobada.length > 0 ? (
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-400">
            APROBADAS ({groupedRequests.aprobada.length})
          </h4>
          <div className="space-y-3">
            {groupedRequests.aprobada.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      ) : null}

      {(filter === 'all' || filter === 'rechazada') &&
      groupedRequests.rechazada.length > 0 ? (
        <div>
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-rose-400">
            RECHAZADAS ({groupedRequests.rechazada.length})
          </h4>
          <div className="space-y-3">
            {groupedRequests.rechazada.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default RequestsList;
