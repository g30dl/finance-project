import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBalance } from '../../hooks/useBalance';
import { useCreatePersonalExpense } from '../../hooks/useCreatePersonalExpense';
import { validatePersonalExpense } from '../../services/personalExpenses';
import { CATEGORIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { Alert, Button, Card, Input, Select, Textarea } from '../common';

const buildCategoryOptions = () =>
  CATEGORIES.map((category) => ({
    value: category.id,
    label: category.label,
  }));

function PersonalExpenseForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId;
  const { balance, loading: loadingBalance, error: balanceError } = useBalance(
    'personal',
    userId
  );
  const { submitExpense, loading, error, success, resetState } =
    useCreatePersonalExpense();

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
    if (!success || !userId) return undefined;

    const timeout = setTimeout(() => {
      resetState();
      navigate(`/dashboard/solicitante/${userId}`, {
        state: { message: 'Gasto registrado exitosamente.' },
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [success, resetState, navigate, userId]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'solicitante') {
    return (
      <Navigate
        to="/"
        replace
        state={{ message: 'No tienes permiso para acceder a esta pagina.' }}
      />
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

    const result = await submitExpense({
      userId,
      amount: Number(formData.amount),
      category: formData.category,
      concept: formData.concept.trim(),
    });

    if (result.success) {
      setFormData({ amount: '', category: '', concept: '' });
      setErrors({});
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/solicitante/${userId}`);
  };

  const canSubmit = !loading && !success && hasBalance && resolvedBalance > 0;
  const helperText =
    formData.amount && !errors.amount
      ? `Gastaras: ${formatCurrency(formData.amount)}`
      : undefined;

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-2 transition-colors hover:bg-slate-800"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-50">
              Usar Mi Dinero Personal
            </h1>
            <p className="text-sm text-slate-400">Sin aprobacion requerida</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6">
        <Card className="border-2 border-emerald-500/40 bg-emerald-950/20">
          <div className="text-center">
            <p className="mb-2 text-sm text-emerald-300">Tu saldo disponible</p>
            {loadingBalance ? (
              <div className="mx-auto h-10 w-32 animate-pulse rounded bg-emerald-500/20" />
            ) : (
              <p className="text-4xl font-bold text-emerald-400">
                {formatCurrency(resolvedBalance)}
              </p>
            )}
            {!loadingBalance && resolvedBalance === 0 ? (
              <p className="mt-2 text-sm text-amber-400">
                No tienes saldo disponible
              </p>
            ) : null}
          </div>
        </Card>

        {balanceError ? (
          <Alert variant="danger" title="Error" className="mb-4">
            {balanceError}
          </Alert>
        ) : null}

        {success ? (
          <Alert variant="success" title="Gasto registrado" className="mb-4">
            Tu gasto fue registrado. Regresando al dashboard...
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="danger" title="Error" className="mb-4">
            {error}
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

            <div className="flex gap-3 border-t border-slate-700 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancel}
                disabled={loading || success}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={!canSubmit || loadingBalance || resolvedBalance === 0}
                fullWidth
              >
                Registrar gasto
              </Button>
            </div>
          </form>
        </Card>

        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-slate-300">Recuerda:</span>{' '}
            Los gastos de tu dinero personal se registran inmediatamente.
          </p>
        </div>
      </main>
    </div>
  );
}

export default PersonalExpenseForm;
