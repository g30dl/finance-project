import React, { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { EmptyState, Select } from '../common';
import RequestCard from './RequestCard';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'aprobada', label: 'Aprobadas' },
  { value: 'rechazada', label: 'Rechazadas' },
];

function RequestsList({ requests, loading, error, title = 'Mis Solicitudes' }) {
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
          <div key={`request-skeleton-${index}`} className="h-32 animate-pulse rounded-md bg-secondary/80" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 p-6">
        <p className="text-center text-destructive">{error}</p>
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
        <h3 className="font-heading text-lg text-foreground">
          {title}
          <span className="ml-2 text-sm font-normal text-muted-foreground">({filteredRequests.length})</span>
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
        <p className="py-8 text-center text-sm text-muted-foreground">No hay solicitudes con este filtro.</p>
      ) : null}

      {(filter === 'all' || filter === 'pendiente') && groupedRequests.pendiente.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-warning">
            Pendientes ({groupedRequests.pendiente.length})
          </h4>
          <div className="space-y-3">
            {groupedRequests.pendiente.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      ) : null}

      {(filter === 'all' || filter === 'aprobada') && groupedRequests.aprobada.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-success">
            Aprobadas ({groupedRequests.aprobada.length})
          </h4>
          <div className="space-y-3">
            {groupedRequests.aprobada.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      ) : null}

      {(filter === 'all' || filter === 'rechazada') && groupedRequests.rechazada.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-destructive">
            Rechazadas ({groupedRequests.rechazada.length})
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

