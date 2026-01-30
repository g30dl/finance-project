import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Alert, Button, Input, Select, Textarea } from '../common';
import { CATEGORIES, REQUEST_LIMITS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { enqueueOrExecute } from '../../services/offlineQueue';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

const buildCategoryOptions = () =>
  CATEGORIES.map((category) => ({
    value: category.id,
    label: category.label,
  }));

const validateAmount = (amountValue) => {
  if (!amountValue || Number.isNaN(amountValue) || amountValue <= 0) {
    return 'Ingresa un monto valido mayor a 0';
  }

  if (amountValue > REQUEST_LIMITS.MAX_AMOUNT) {
    return `El monto no puede exceder $${REQUEST_LIMITS.MAX_AMOUNT}`;
  }

  return '';
};

const validateCategory = (category) => {
  if (!category) {
    return 'Selecciona una categoria';
  }
  return '';
};

const validateConcept = (concept) => {
  if (!concept.trim()) {
    return 'Describe el motivo de tu solicitud';
  }
  if (concept.trim().length < REQUEST_LIMITS.MIN_CONCEPT_LENGTH) {
    return `El concepto debe tener al menos ${REQUEST_LIMITS.MIN_CONCEPT_LENGTH} caracteres`;
  }
  return '';
};

function RequestForm({ onSuccess, onCancel, onAmountChange }) {
  const { user } = useAuth();
  const { isOnline, queueCount, updateQueueCount } = useOfflineQueue();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    concept: '',
  });
  const [errors, setErrors] = useState({});
  const timeoutRef = useRef(null);
  const categoryOptions = useMemo(buildCategoryOptions, []);
  const amountValue = Number(formData.amount);
  const isSuccess = Boolean(successMessage);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    if (field === 'amount') {
      const numeric = Number(value) || 0;
      onAmountChange?.(numeric);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const amountError = validateAmount(amountValue);
    const categoryError = validateCategory(formData.category);
    const conceptError = validateConcept(formData.concept);

    if (amountError) newErrors.amount = amountError;
    if (categoryError) newErrors.category = categoryError;
    if (conceptError) newErrors.concept = conceptError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm() || !user) return;

    const requestData = {
      userId: user.userId,
      userName: user.userName,
      amount: Number(formData.amount),
      category: formData.category,
      concept: formData.concept.trim(),
    };

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const operation = {
      type: 'CREATE_REQUEST',
      payload: requestData,
    };

    try {
      const result = await enqueueOrExecute(operation);

      if (result?.queued) {
        setSuccessMessage('Solicitud guardada. Se enviara al recuperar conexion.');
        await updateQueueCount();
      } else {
        setSuccessMessage('Solicitud enviada correctamente.');
      }

      if (navigator?.vibrate) {
        navigator.vibrate(20);
      }

      setFormData({ amount: '', category: '', concept: '' });
      onAmountChange?.(0);
      timeoutRef.current = setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo crear la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const helperText =
    formData.amount && !errors.amount
      ? `Solicitaras: ${formatCurrency(formData.amount)}`
      : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!isOnline ? (
        <Alert variant="warning" title="Sin conexion" className="animate-scale-in">
          Las solicitudes se guardaran y se enviaran automaticamente al recuperar conexion.
        </Alert>
      ) : null}

      {queueCount > 0 ? (
        <Alert variant="info" title="Operaciones en cola" className="animate-scale-in">
          {queueCount} operacion{queueCount > 1 ? 'es' : ''} pendiente
          {queueCount > 1 ? 's' : ''} de sincronizar.
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert variant="success" title="Solicitud enviada" className="animate-scale-in">
          {successMessage}
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="danger" title="Error">
          {errorMessage}
        </Alert>
      ) : null}

      <Input
        label="Monto a solicitar"
        type="number"
        step="0.01"
        min={REQUEST_LIMITS.MIN_AMOUNT}
        max={REQUEST_LIMITS.MAX_AMOUNT}
        placeholder="0.00"
        value={formData.amount}
        onChange={(event) => handleChange('amount', event.target.value)}
        icon={<DollarSign className="h-4 w-4" />}
        error={errors.amount}
        helperText={helperText}
        fullWidth
        disabled={loading || isSuccess}
        autoFocus
      />

      <Select
        label="Categoria del gasto"
        options={categoryOptions}
        value={formData.category}
        onChange={(event) => handleChange('category', event.target.value)}
        error={errors.category}
        placeholder="Selecciona una categoria..."
        fullWidth
        disabled={loading || isSuccess}
      />

      <Textarea
        label="Concepto / Motivo"
        placeholder="Describe para que necesitas el dinero..."
        value={formData.concept}
        onChange={(event) => handleChange('concept', event.target.value)}
        error={errors.concept}
        maxLength={REQUEST_LIMITS.MAX_CONCEPT_LENGTH}
        showCount
        rows={4}
        fullWidth
        disabled={loading || isSuccess}
      />

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading || isSuccess}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading} disabled={isSuccess}>
          Enviar Solicitud
        </Button>
      </div>
    </form>
  );
}

export default RequestForm;
