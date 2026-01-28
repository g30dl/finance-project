import React, { useState } from 'react';
import { Calendar, Check, MessageSquare, User, X } from 'lucide-react';
import { Button, Textarea } from '../common';
import { formatCurrency, getRelativeTime } from '../../utils/helpers';
import { getCategoryIcon } from '../../utils/categories';

function PendingRequestCard({ request, onApprove, onReject, loading }) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  const handleApprove = () => {
    onApprove?.(request.id);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      setError('El motivo debe tener al menos 5 caracteres');
      return;
    }
    onReject?.(request.id, rejectReason.trim());
    setShowRejectForm(false);
    setRejectReason('');
    setError('');
  };

  const handleRejectChange = (event) => {
    setRejectReason(event.target.value);
    if (error) setError('');
  };

  const handleRejectCancel = () => {
    setShowRejectForm(false);
    setRejectReason('');
    setError('');
  };

  return (
    <div className="rounded-2xl border border-warning/30 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getCategoryIcon(request.categoria)}</span>
          <div>
            <p className="font-heading text-sm text-foreground">
              {(request.categoria || 'categoria').replace('_', ' ')}
            </p>
            <div className="mt-1 flex items-center gap-2 text-sm text-foreground-muted">
              <User className="h-4 w-4" />
              <span>{request.nombreUsuario}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-heading text-2xl text-warning">{formatCurrency(request.cantidad)}</p>
          <div className="mt-1 flex items-center gap-1 text-xs text-foreground-muted">
            <Calendar className="h-3 w-3" />
            <span>{getRelativeTime(request.fechaSolicitud)}</span>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-border/80 bg-muted p-3">
        <div className="flex items-start gap-2">
          <MessageSquare className="mt-0.5 h-4 w-4 text-foreground-muted" />
          <p className="text-sm text-foreground">{request.concepto}</p>
        </div>
      </div>

      {showRejectForm ? (
        <div className="space-y-3">
          <Textarea
            label="Motivo del rechazo"
            placeholder="Explica por que rechazas esta solicitud..."
            value={rejectReason}
            onChange={handleRejectChange}
            error={error}
            maxLength={200}
            showCount
            rows={3}
            fullWidth
            disabled={loading}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleRejectCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRejectConfirm}
              loading={loading}
              icon={<X className="h-4 w-4" />}
            >
              Confirmar Rechazo
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleApprove}
            loading={loading}
            icon={<Check className="h-4 w-4" />}
            fullWidth
          >
            Aprobar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
            icon={<X className="h-4 w-4" />}
            fullWidth
          >
            Rechazar
          </Button>
        </div>
      )}
    </div>
  );
}

export default PendingRequestCard;
