import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Alert, EmptyState, Modal } from '../common';
import { useAuth } from '../../hooks/useAuth';
import { useApproveRequest } from '../../hooks/useApproveRequest';
import { useRejectRequest } from '../../hooks/useRejectRequest';
import { usePendingRequests } from '../../hooks/usePendingRequests';
import { useBalance } from '../../hooks/useBalance';
import { formatCurrency } from '../../utils/helpers';
import PendingRequestCard from './PendingRequestCard';
import RequestCardSkeleton from './RequestCardSkeleton';
import { toast } from 'sonner';

function ApproveRequestsModal({ isOpen, onClose, requests, loading, error }) {
  const { user } = useAuth();
  const fallback = usePendingRequests(isOpen && !requests);
  const { balance: casaBalance, loading: loadingCasa } = useBalance('casa');
  const { approve, loading: approvingRequest, error: approveError } = useApproveRequest();
  const { reject, loading: rejectingRequest, error: rejectError } = useRejectRequest();

  const data = requests ?? fallback.requests;
  const loadingRequests = loading ?? fallback.loading;
  const errorRequests = error ?? fallback.error;

  const [successMessage, setSuccessMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const isProcessing = approvingRequest || rejectingRequest;

  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage('');
      setProcessingId(null);
    }
  }, [isOpen]);

  const handleApprove = async (requestId) => {
    setProcessingId(requestId);
    setSuccessMessage('');

    const result = await approve(requestId, user?.userId);
    if (result.success) {
      if (navigator?.vibrate) {
        navigator.vibrate(20);
      }
      setSuccessMessage(`Solicitud aprobada. Nuevo saldo: ${formatCurrency(result.newBalance)}`);
      toast.success('Solicitud aprobada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else if (result.error) {
      toast.error(result.error);
    }

    setProcessingId(null);
  };

  const handleReject = async (requestId, reason) => {
    setProcessingId(requestId);
    setSuccessMessage('');

    const result = await reject(requestId, user?.userId, reason);
    if (result.success) {
      if (navigator?.vibrate) {
        navigator.vibrate(10);
      }
      setSuccessMessage('Solicitud rechazada correctamente');
      toast.success('Solicitud rechazada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else if (result.error) {
      toast.error(result.error);
    }

    setProcessingId(null);
  };

  const content = useMemo(() => {
    if (loadingRequests) {
      return (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <RequestCardSkeleton key={`pending-skeleton-${i}`} />
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <EmptyState
          icon={<CheckCircle className="h-12 w-12" />}
          title="No hay solicitudes pendientes"
          description="Todas las solicitudes han sido procesadas."
        />
      );
    }

    return (
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
        {data.map((request) => (
          <PendingRequestCard
            key={request.id}
            request={request}
            onApprove={handleApprove}
            onReject={handleReject}
            loading={isProcessing && processingId === request.id}
          />
        ))}
      </div>
    );
  }, [data, handleApprove, handleReject, isProcessing, loadingRequests, processingId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Aprobar Solicitudes"
      size="lg"
      closeOnOverlayClick={false}
    >
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-5 text-white shadow-card">
        <p className="text-sm text-white/85">Dinero Casa disponible</p>
        <p className="mt-1 font-heading text-3xl">
          {loadingCasa ? 'Cargando...' : formatCurrency(casaBalance)}
        </p>
      </div>

      {successMessage ? (
        <Alert variant="success" className="mb-4">
          {successMessage}
        </Alert>
      ) : null}

      {approveError || rejectError ? (
        <Alert variant="danger" className="mb-4">
          {approveError || rejectError}
        </Alert>
      ) : null}

      {errorRequests ? (
        <Alert variant="danger" className="mb-4">
          {errorRequests}
        </Alert>
      ) : null}

      {content}
    </Modal>
  );
}

export default ApproveRequestsModal;
