import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Input, Select, Textarea, Button, Alert } from '../common';
import { useDeposit } from '../../hooks/useDeposit';
import { useAuth } from '../../hooks/useAuth';
import { useFirebaseData } from '../../hooks/useFirebaseData';

const formatDateForInput = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildUserOptions = (accounts) =>
  Object.entries(accounts || {})
    .filter(([, account]) => account?.activa !== false)
    .map(([userId, account]) => ({
      value: userId,
      label: account?.nombreUsuario || userId,
    }));

function DepositModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { deposit, loading, error, success, reset } = useDeposit();
  const { data: personalAccounts, error: accountsError } = useFirebaseData(
    'familia_finanzas/cuentas/personales'
  );

  const [formData, setFormData] = useState({
    tipo: 'casa',
    cuentaDestino: '',
    monto: '',
    concepto: '',
    fecha: formatDateForInput(Date.now()),
  });
  const [errors, setErrors] = useState({});

  const userOptions = useMemo(() => buildUserOptions(personalAccounts), [personalAccounts]);
  const maxDate = formatDateForInput(Date.now());

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        tipo: 'casa',
        cuentaDestino: '',
        monto: '',
        concepto: '',
        fecha: formatDateForInput(Date.now()),
      });
      setErrors({});
      reset();
    }
  }, [isOpen, reset]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      tipo: value,
      cuentaDestino: value === 'casa' ? '' : prev.cuentaDestino,
    }));
    setErrors((prev) => ({ ...prev, cuentaDestino: '' }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const montoNum = Number(formData.monto);
    const fechaTimestamp = new Date(`${formData.fecha}T00:00:00`).getTime();

    if (!montoNum || Number.isNaN(montoNum) || montoNum <= 0) {
      nextErrors.monto = 'Ingresa un monto valido mayor a 0';
    }

    if (formData.tipo === 'personal' && !formData.cuentaDestino) {
      nextErrors.cuentaDestino = 'Selecciona un usuario';
    }

    if (!formData.concepto.trim() || formData.concepto.trim().length < 5) {
      nextErrors.concepto = 'El concepto debe tener al menos 5 caracteres';
    }

    if (!formData.fecha || Number.isNaN(fechaTimestamp)) {
      nextErrors.fecha = 'Selecciona una fecha valida';
    } else if (fechaTimestamp > Date.now()) {
      nextErrors.fecha = 'No puedes registrar depositos futuros';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const cuentaDestino =
      formData.tipo === 'casa' ? 'dinero_casa' : formData.cuentaDestino;
    const fechaTimestamp = new Date(`${formData.fecha}T00:00:00`).getTime();

    const result = await deposit({
      tipo: formData.tipo,
      cuentaDestino,
      cantidad: Number(formData.monto),
      concepto: formData.concepto.trim(),
      fecha: fechaTimestamp,
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Depositar Dinero" size="lg">
      {success ? (
        <Alert variant="success" className="mb-4">
          Deposito registrado exitosamente
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Depositar a</p>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 rounded-md border border-border/80 bg-secondary/70 px-3 py-2 text-sm text-foreground">
              <input
                type="radio"
                name="deposit-type"
                value="casa"
                checked={formData.tipo === 'casa'}
                onChange={() => handleTypeChange('casa')}
              />
              Dinero Casa (Gastos familiares)
            </label>
            <label className="flex items-center gap-2 rounded-md border border-border/80 bg-secondary/70 px-3 py-2 text-sm text-foreground">
              <input
                type="radio"
                name="deposit-type"
                value="personal"
                checked={formData.tipo === 'personal'}
                onChange={() => handleTypeChange('personal')}
              />
              Cuenta Personal (Mesada o regalo)
            </label>
          </div>
        </div>

        {formData.tipo === 'personal' ? (
          <Select
            label="Usuario"
            options={userOptions}
            value={formData.cuentaDestino}
            onChange={(event) => handleChange('cuentaDestino', event.target.value)}
            error={errors.cuentaDestino}
            placeholder="Selecciona un usuario..."
            fullWidth
            disabled={loading}
          />
        ) : null}

        <Input
          label="Monto"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={formData.monto}
          onChange={(event) => handleChange('monto', event.target.value)}
          error={errors.monto}
          fullWidth
          disabled={loading}
        />

        <Textarea
          label="Concepto"
          placeholder="Ej: Quincena, Mesada semanal, Regalo..."
          value={formData.concepto}
          onChange={(event) => handleChange('concepto', event.target.value)}
          error={errors.concepto}
          maxLength={200}
          showCount
          rows={3}
          fullWidth
          disabled={loading}
        />

        <Input
          label="Fecha del deposito"
          type="date"
          value={formData.fecha}
          onChange={(event) => handleChange('fecha', event.target.value)}
          error={errors.fecha}
          max={maxDate}
          fullWidth
          disabled={loading}
        />

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={handleClose} disabled={loading || success}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading} disabled={success}>
            Depositar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default DepositModal;
