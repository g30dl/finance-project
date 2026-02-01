import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Alert, Button, Input, Select, Textarea } from '../common';
import { CATEGORIES, REQUEST_LIMITS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { enqueueOrExecute } from '../../services/offlineQueue';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import { requestSchema } from '../../utils/schemas';
import { toast } from 'sonner';

const buildCategoryOptions = () =>
  CATEGORIES.map((category) => ({
    value: category.id,
    label: category.label,
  }));

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setErrorMessage('Usuario no identificado. Inicia sesion nuevamente.');
      toast.error('Usuario no identificado. Inicia sesion nuevamente.');
      return;
    }

    const parsedAmount =
      formData.amount === '' || formData.amount === null
        ? Number.NaN
        : Number(formData.amount);

    const requestData = {
      userId: user.userId,
      userName: user.userName,
      amount: parsedAmount,
      category: formData.category,
      concept: formData.concept.trim(),
    };

    const parsed = requestSchema.safeParse(requestData);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        amount: fieldErrors.amount?.[0] || '',
        category: fieldErrors.category?.[0] || '',
        concept: fieldErrors.concept?.[0] || '',
      });
      return;
    }

    setErrors({});
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
        toast.message('Solicitud guardada. Se enviara al recuperar conexion.');
        await updateQueueCount();
      } else {
        setSuccessMessage('Solicitud enviada correctamente.');
        toast.success('Solicitud enviada correctamente.');
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
      const message = error?.message || 'No se pudo crear la solicitud.';
      setErrorMessage(message);
      toast.error(message);
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
