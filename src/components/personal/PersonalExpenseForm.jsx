import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBalance } from '../../hooks/useBalance';
import { validatePersonalExpense } from '../../services/personalExpenses';
import { CATEGORIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { Alert, Button, Card, Input, Select, Textarea } from '../common';
import { enqueueOrExecute } from '../../services/offlineQueue';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

const buildCategoryOptions = () =>
  CATEGORIES.map((category) => ({
    value: category.id,
    label: category.label,
  }));

function PersonalExpenseForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId;
  const { balance, loading: loadingBalance, error: balanceError } = useBalance('personal', userId);
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
  const categoryOptions = useMemo(buildCategoryOptions, []);

  const hasBalance = balance != null && Number.isFinite(Number(balance));
  const resolvedBalance = hasBalance ? Number(balance) : 0;

  useEffect(() => {
    if (!successMessage || !userId) return undefined;

    const timeout = setTimeout(() => {
      setSuccessMessage('');
      navigate(`/dashboard/solicitante/${userId}`, {
        state: { message: 'Gasto registrado exitosamente.' },
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [successMessage, navigate, userId]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'solicitante') {
    return (
      <Navigate to="/" replace state={{ message: 'No tienes permiso para acceder a esta pagina.' }} />
    );
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validation = validatePersonalExpense(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const amount = Number(formData.amount);
    if (hasBalance && amount > resolvedBalance) {
      setErrors({
        amount: `Saldo insuficiente. Disponible: ${formatCurrency(resolvedBalance)}`,
      });
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const operation = {
      type: 'CREATE_EXPENSE',
      payload: {
        userId,
        amount: Number(formData.amount),
        category: formData.category,
        concept: formData.concept.trim(),
      },
    };

    try {
      const result = await enqueueOrExecute(operation);

      if (result?.queued) {
        setSuccessMessage('Gasto guardado. Se sincronizara al recuperar conexion.');
        await updateQueueCount();
      } else {
        setSuccessMessage('Gasto registrado exitosamente.');
      }

      setFormData({ amount: '', category: '', concept: '' });
      setErrors({});
    } catch (error) {
      setErrorMessage(error?.message || 'No se pudo registrar el gasto.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/solicitante/${userId}`);
  };

  const canSubmit = !loading && !successMessage && (isOnline ? hasBalance && resolvedBalance > 0 : true);
  const helperText = formData.amount && !errors.amount ? `Gastaras: ${formatCurrency(formData.amount)}` : undefined;

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center justify-center rounded-sm border border-border bg-secondary p-2 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-primary"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl text-foreground">Usar Mi Dinero Personal</h1>
            <p className="text-sm text-muted-foreground">Sin aprobacion requerida</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 animate-slide-up">
        <Card className="border border-success/40 bg-success/10">
          <div className="text-center">
            <p className="mb-2 text-sm text-success">Tu saldo disponible</p>
            {loadingBalance ? (
              <div className="mx-auto h-10 w-32 animate-pulse rounded-sm bg-success/20" />
            ) : (
              <p className="font-heading text-4xl text-success">{formatCurrency(resolvedBalance)}</p>
            )}
            {!loadingBalance && resolvedBalance === 0 ? (
              <p className="mt-2 text-sm text-warning">No tienes saldo disponible</p>
            ) : null}
          </div>
        </Card>

        {balanceError ? (
          <Alert variant="danger" title="Error" className="mb-4">
            {balanceError}
          </Alert>
        ) : null}

        {!isOnline ? (
          <Alert variant="warning" title="Sin conexion" className="mb-4">
            Los gastos se guardaran y se enviaran automaticamente al recuperar conexion.
          </Alert>
        ) : null}

        {queueCount > 0 ? (
          <Alert variant="info" title="Operaciones en cola" className="mb-4">
            {queueCount} operacion{queueCount > 1 ? 'es' : ''} pendiente
            {queueCount > 1 ? 's' : ''} de sincronizar.
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert variant="success" title="Gasto registrado" className="mb-4">
            {successMessage} Regresando al dashboard...
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert variant="danger" title="Error" className="mb-4">
            {errorMessage}
          </Alert>
        ) : null}

        <Card title="Registrar gasto" subtitle="Completa la informacion del gasto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Monto a gastar"
              type="number"
              step="0.01"
              min="0.01"
              max={resolvedBalance || 10000}
              placeholder="0.00"
              value={formData.amount}
              onChange={(event) => handleChange('amount', event.target.value)}
              icon={<DollarSign className="h-4 w-4" />}
              error={errors.amount}
              helperText={helperText}
              fullWidth
              disabled={!canSubmit}
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
              disabled={!canSubmit}
            />

            <Textarea
              label="Para que usaras el dinero?"
              placeholder="Describe brevemente el gasto..."
              value={formData.concept}
              onChange={(event) => handleChange('concept', event.target.value)}
              error={errors.concept}
              maxLength={200}
              showCount
              rows={4}
              fullWidth
              disabled={!canSubmit}
            />

            <div className="flex gap-3 border-t border-border/80 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={loading || successMessage}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={!canSubmit || (isOnline && (loadingBalance || resolvedBalance === 0))}
                fullWidth
              >
                Registrar gasto
              </Button>
            </div>
          </form>
        </Card>

        <div className="rounded-2xl border border-border bg-white px-4 py-4 text-sm text-muted-foreground shadow-card">
          <span className="font-heading text-foreground">Recuerda:</span>{' '}
          Los gastos de tu dinero personal se registran inmediatamente.
        </div>
      </main>
    </div>
  );
}

export default PersonalExpenseForm;
