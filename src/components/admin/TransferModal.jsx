import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Modal, Input, Select, Textarea, Button, Alert } from '../common';
import { useTransfer } from '../../hooks/useTransfer';
import { useAuth } from '../../hooks/useAuth';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import { formatCurrency } from '../../utils/helpers';

const LARGE_AMOUNT_THRESHOLD = 500;

const buildAccountOptions = (casaData, personalAccounts) => {
  const options = [];

  if (casaData) {
    options.push({
      value: 'dinero_casa',
      label: `Dinero Casa - ${formatCurrency(casaData.saldo || 0)}`,
      saldo: Number(casaData.saldo) || 0,
    });
  }

  Object.entries(personalAccounts || {}).forEach(([userId, account]) => {
    if (account?.activa === false) return;

    options.push({
      value: userId,
      label: `${account?.nombreUsuario || userId} - ${formatCurrency(account?.saldo || 0)}`,
      saldo: Number(account?.saldo) || 0,
    });
  });

  return options;
};

function TransferModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { transfer, loading, error, success, reset } = useTransfer();
  const { data: casaData, loading: loadingCasa } = useFirebaseData(
    'familia_finanzas/cuentas/dinero_casa'
  );
  const {
    data: personalAccounts,
    loading: loadingAccounts,
    error: accountsError,
  } = useFirebaseData('familia_finanzas/cuentas/personales');

  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    monto: '',
    concepto: '',
  });
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const accountOptions = useMemo(
    () => buildAccountOptions(casaData, personalAccounts),
    [casaData, personalAccounts]
  );

  const destinoOptions = useMemo(() => {
    if (!formData.origen) return accountOptions;
    return accountOptions.filter((option) => option.value !== formData.origen);
  }, [accountOptions, formData.origen]);

  const saldoOrigen = useMemo(() => {
    const selected = accountOptions.find((option) => option.value === formData.origen);
    return selected?.saldo || 0;
  }, [accountOptions, formData.origen]);

  const saldosResultantes = useMemo(() => {
    if (!formData.origen || !formData.destino || !formData.monto) return null;

    const montoNum = Number(formData.monto) || 0;
    const origenAccount = accountOptions.find((option) => option.value === formData.origen);
    const destinoAccount = accountOptions.find((option) => option.value === formData.destino);

    return {
      origenActual: origenAccount?.saldo || 0,
      origenNuevo: (origenAccount?.saldo || 0) - montoNum,
      destinoActual: destinoAccount?.saldo || 0,
      destinoNuevo: (destinoAccount?.saldo || 0) + montoNum,
    };
  }, [accountOptions, formData.destino, formData.monto, formData.origen]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ origen: '', destino: '', monto: '', concepto: '' });
      setErrors({});
      setShowPreview(false);
      reset();
    }
  }, [isOpen, reset]);

  const validateForm = () => {
    const nextErrors = {};
    const montoNum = Number(formData.monto);

    if (!formData.origen) {
      nextErrors.origen = 'Selecciona cuenta de origen';
    }

    if (!formData.destino) {
      nextErrors.destino = 'Selecciona cuenta de destino';
    } else if (formData.destino === formData.origen) {
      nextErrors.destino = 'No puedes transferir a la misma cuenta';
    }

    if (!montoNum || Number.isNaN(montoNum) || montoNum <= 0) {
      nextErrors.monto = 'Ingresa un monto valido mayor a 0';
    } else if (montoNum > saldoOrigen) {
      nextErrors.monto = `Saldo insuficiente. Disponible: ${formatCurrency(saldoOrigen)}`;
    }

    if (!formData.concepto.trim() || formData.concepto.trim().length < 5) {
      nextErrors.concepto = 'El concepto debe tener al menos 5 caracteres';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (showPreview) {
      setShowPreview(false);
    }
  };

  const handleShowPreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    }
  };

  const handleConfirm = async () => {
    const result = await transfer({
      cuentaOrigen: formData.origen,
      cuentaDestino: formData.destino,
      cantidad: Number(formData.monto),
      concepto: formData.concepto.trim(),
      adminId: user?.userId,
    });

    if (result.success) {
      setTimeout(() => {
        onClose?.();
      }, 2000);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose?.();
    }
  };

  const amountValue = Number(formData.monto) || 0;
  const canSubmit = !loading && !success;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Transferir Dinero"
      size="lg"
      closeOnOverlayClick={false}
    >
      {success ? (
        <Alert variant="success" className="mb-4">
          Transferencia completada exitosamente
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      ) : null}

      {accountsError ? (
        <Alert variant="danger" className="mb-4">
          {accountsError}
        </Alert>
      ) : null}

      {!showPreview ? (
        <div className="space-y-6">
          <Select
            label="Desde (Cuenta Origen)"
            options={accountOptions}
            value={formData.origen}
            onChange={(event) => handleChange('origen', event.target.value)}
            error={errors.origen}
            placeholder="Selecciona cuenta de origen..."
            fullWidth
            disabled={loading || success || loadingCasa || loadingAccounts}
          />

          <Select
            label="Hacia (Cuenta Destino)"
            options={destinoOptions}
            value={formData.destino}
            onChange={(event) => handleChange('destino', event.target.value)}
            error={errors.destino}
            placeholder="Selecciona cuenta de destino..."
            fullWidth
            disabled={loading || success || !formData.origen}
          />

          <Input
            label="Monto a transferir"
            type="number"
            step="0.01"
            min="0.01"
            max={saldoOrigen || 10000}
            placeholder="0.00"
            value={formData.monto}
            onChange={(event) => handleChange('monto', event.target.value)}
            error={errors.monto}
            helperText={
              saldoOrigen > 0 ? `Disponible: ${formatCurrency(saldoOrigen)}` : undefined
            }
            fullWidth
            disabled={loading || success || !formData.origen}
          />

          <Textarea
            label="Concepto de la transferencia"
            placeholder="Ej: Mesada semanal, Prestamo, Devolucion..."
            value={formData.concepto}
            onChange={(event) => handleChange('concepto', event.target.value)}
            error={errors.concepto}
            maxLength={200}
            showCount
            rows={3}
            fullWidth
            disabled={loading || success}
          />

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={handleClose} disabled={!canSubmit}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleShowPreview}
              disabled={!canSubmit}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Continuar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {amountValue >= LARGE_AMOUNT_THRESHOLD ? (
            <Alert variant="warning" icon={<AlertCircle className="h-5 w-5" />}>
              Estas por transferir una cantidad considerable. Verifica la informacion.
            </Alert>
          ) : null}

          <div className="vintage-card rounded-md border border-primary/30 bg-primary/5 p-6">
            <h4 className="mb-4 font-heading text-base text-primary">Resumen de la transferencia</h4>

            <div className="mb-4 text-center">
              <p className="text-sm text-muted-foreground">Monto a transferir</p>
              <p className="font-heading text-4xl text-primary">{formatCurrency(amountValue)}</p>
            </div>

            <div className="mb-4 rounded-md border border-border/80 bg-secondary/70 p-3">
              <p className="text-xs text-muted-foreground">Concepto</p>
              <p className="text-sm text-foreground">{formData.concepto}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-border/80 bg-secondary/70 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Cuenta Origen
                </p>
                <p className="mb-3 text-sm text-foreground">
                  {accountOptions.find((opt) => opt.value === formData.origen)?.label}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actual:</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(saldosResultantes?.origenActual)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Despues:</span>
                    <span className="font-semibold text-destructive">
                      {formatCurrency(saldosResultantes?.origenNuevo)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-border/80 bg-secondary/70 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Cuenta Destino
                </p>
                <p className="mb-3 text-sm text-foreground">
                  {accountOptions.find((opt) => opt.value === formData.destino)?.label}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actual:</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(saldosResultantes?.destinoActual)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Despues:</span>
                    <span className="font-semibold text-success">
                      {formatCurrency(saldosResultantes?.destinoNuevo)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowPreview(false)} disabled={loading}>
              Volver
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              loading={loading}
              disabled={success}
            >
              Confirmar transferencia
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default TransferModal;
