import React, { useMemo, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUserRequests } from '../../hooks/useUserRequests';
import RequestStatusFilter from '../../components/requests/RequestStatusFilter';
import RequestCard from '../../components/requests/RequestCard';
import EmptyState from '../../components/common/EmptyState';
import AnimatedSection from '../../components/common/AnimatedSection';

function RequestsTab() {
  const { user } = useAuth();
  const { requests, loading, error } = useUserRequests(user?.userId);
  const [status, setStatus] = useState('all');
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(null);

  const filtered = useMemo(() => {
    if (status === 'all') return requests;
    return requests.filter((request) => request.estado === status);
  }, [requests, status]);

  const handleTouchStart = (event) => {
    if (window.scrollY === 0) {
      startYRef.current = event.touches[0].clientY;
    }
  };

  const handleTouchMove = (event) => {
    if (startYRef.current == null) return;
    const delta = event.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      setPullDistance(Math.min(delta, 80));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 600);
    }
    setPullDistance(0);
    startYRef.current = null;
  };

  return (
    <div
      className="pb-24 px-4 pt-4 space-y-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div>
        <h2 className="font-heading text-2xl text-foreground">Mis solicitudes</h2>
        <p className="text-sm text-foreground-muted">Revisa el estado de tus solicitudes.</p>
      </div>

      <div className="text-center text-xs text-gray-400">
        {refreshing ? 'Actualizado' : pullDistance > 40 ? 'Suelta para actualizar' : 'Desliza para actualizar'}
      </div>

      <AnimatedSection>
        <RequestStatusFilter value={status} onChange={setStatus} />
      </AnimatedSection>

      <AnimatedSection delay={0.05}>
        {loading ? (
          <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-card">
            Cargando solicitudes...
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-4 text-sm text-red-500 shadow-card">{error}</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Sin solicitudes" description="Aun no tienes solicitudes en este estado." />
        ) : (
          <div className="space-y-3">
            {filtered.map((request) => (
              <RequestCard key={request.id || request.fechaSolicitud} request={request} />
            ))}
          </div>
        )}
      </AnimatedSection>
    </div>
  );
}

export default RequestsTab;
