import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { ref, update } from 'firebase/database';
import { Modal, Input, Select, Button, Alert } from '../common';
import { db } from '../../services/firebase';
import { useAuthContext } from '../../contexts/AuthContext';
import { CATEGORIES } from '../../utils/constants';
import { calcularProximaEjecucion } from '../../utils/recurringHelpers';

const NAME_PATTERN = /^[\p{L}\p{N} ]+$/u;

const buildCategoryOptions = () =>
  CATEGORIES.map((category) => ({
    value: category.id,
    label: category.label,
  }));

const validateField = (name, value, formData) => {
  switch (name) {
    case 'nombre': {
      const trimmed = String(value || '').trim();
      if (!trimmed) return 'El nombre es obligatorio.';
      if (trimmed.length < 3) return 'Minimo 3 caracteres.';
      if (trimmed.length > 50) return 'Maximo 50 caracteres.';
      if (!NAME_PATTERN.test(trimmed)) {
        return 'Nombre invalido. Solo letras, numeros y espacios.';
      }
      return '';
    }
    case 'monto': {
      const numeric = Number(value);
      if (!numeric || Number.isNaN(numeric)) return 'Ingresa un monto valido.';
      if (numeric <= 0) return 'Monto debe ser mayor a 0.';
      if (numeric > 10000) return 'Monto maximo permitido: 10,000.';
      return '';
    }
    case 'categoria':
      return value ? '' : 'Selecciona una categoria.';
    case 'diaMes': {
      const numeric = Number(value);
      if (!numeric || Number.isNaN(numeric)) return 'Ingresa un dia valido.';
      if (numeric < 1 || numeric > 31) return 'Dia debe estar entre 1 y 31.';
      return '';
    }
    case 'diasNotificacion': {
      if (!formData.notificarAntes) return '';
      const numeric = Number(value);
      if (!numeric || Number.isNaN(numeric)) return 'Ingresa dias validos.';
      if (numeric < 1 || numeric > 15) return 'Entre 1 y 15 dias.';
      return '';
    }
    default:
      return '';
  }
};

function RecurringExpenseForm({ isOpen, onClose, editingExpense = null }) {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    nombre: '',
    monto: '',
    categoria: '',
    diaMes: 1,
    notificarAntes: false,
    diasNotificacion: 3,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const closeTimeout = useRef(null);

  const categoryOptions = useMemo(buildCategoryOptions, []);

  useEffect(() => {
    if (!isOpen) return;
    if (editingExpense) {
      setFormData({
        nombre: editingExpense.nombre || '',
        monto: String(editingExpense.monto || ''),
        categoria: editingExpense.categoria || '',
        diaMes: editingExpense.diaMes || 1,
        notificarAntes: Boolean(editingExpense.notificarAntes),
        diasNotificacion: editingExpense.diasNotificacion || 3,
      });
    } else {
      setFormData({
        nombre: '',
        monto: '',
        categoria: '',
        diaMes: 1,
        notificarAntes: false,
        diasNotificacion: 3,
      });
    }
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');
  }, [editingExpense, isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
      }
    };
  }, []);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'notificarAntes' && !value) {
      setErrors((prev) => ({ ...prev, diasNotificacion: '' }));
    }
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value, { ...formData, [field]: value }),
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    Object.keys(formData).forEach((field) => {
      const message = validateField(field, formData[field], formData);
      if (message) nextErrors[field] = message;
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm() || !user?.userId) return;

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const id = editingExpense?.id || `recurrente_${Date.now()}`;
      const payload = {
        id,
        nombre: formData.nombre.trim(),
        monto: Number(formData.monto),
        categoria: formData.categoria,
        diaMes: Number(formData.diaMes),
        notificarAntes: Boolean(formData.notificarAntes),
        diasNotificacion: formData.notificarAntes ? Number(formData.diasNotificacion) : 3,
        proximaEjecucion: calcularProximaEjecucion(Number(formData.diaMes)),
        activo: editingExpense?.activo ?? true,
        creadoPor: editingExpense?.creadoPor || user.userId,
        fechaCreacion: editingExpense?.fechaCreacion || Date.now(),
      };

      await update(ref(db, `familia_finanzas/gastosRecurrentes/${id}`), payload);

      setSuccessMessage(
        editingExpense ? 'Gasto recurrente actualizado.' : 'Gasto recurrente creado.'
      );

      closeTimeout.current = setTimeout(() => {
        onClose?.();
      }, 800);
    } catch (error) {
      setErrorMessage(
        error?.message || 'No se pudo guardar el gasto recurrente. Intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? 'Editar gasto recurrente' : 'Nuevo gasto recurrente'}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {successMessage ? (
          <Alert variant="success" title="Listo">
            {successMessage}
          </Alert>
        ) : null}
        {errorMessage ? (
          <Alert variant="danger" title="Error">
            {errorMessage}
          </Alert>
        ) : null}

        <Input
          label="Nombre del gasto"
          placeholder="Ej: Luz CFE, Internet"
          value={formData.nombre}
          onChange={(event) => updateField('nombre', event.target.value)}
          error={errors.nombre}
          fullWidth
        />

        <Input
          label="Monto mensual"
          type="number"
          step="0.01"
          min="0.01"
          max="10000"
          icon={<DollarSign className="h-4 w-4" />}
          value={formData.monto}
          onChange={(event) => updateField('monto', event.target.value)}
          error={errors.monto}
          fullWidth
        />

        <Select
          label="Categoria"
          options={categoryOptions}
          value={formData.categoria}
          onChange={(event) => updateField('categoria', event.target.value)}
          error={errors.categoria}
          placeholder="Selecciona una categoria"
          fullWidth
        />

        <Input
          label="Dia del mes para pago"
          type="number"
          min="1"
          max="31"
          helperText="Dia en que se descuenta automaticamente"
          value={formData.diaMes}
          onChange={(event) => updateField('diaMes', event.target.value)}
          error={errors.diaMes}
          fullWidth
        />

        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <label className="flex items-center gap-3 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={formData.notificarAntes}
              onChange={(event) => updateField('notificarAntes', event.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            Notificar antes del pago
          </label>

          {formData.notificarAntes ? (
            <div className="mt-4">
              <Input
                label="Dias de anticipacion"
                type="number"
                min="1"
                max="15"
                value={formData.diasNotificacion}
                onChange={(event) => updateField('diasNotificacion', event.target.value)}
                error={errors.diasNotificacion}
                fullWidth
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {editingExpense ? 'Actualizar gasto recurrente' : 'Crear gasto recurrente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default RecurringExpenseForm;
