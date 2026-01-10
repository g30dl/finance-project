import React from 'react';
import { useForm } from 'react-hook-form';

const RequestForm = ({ categories, onSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      amount: '',
      category: categories[0]?.id || '',
      reason: '',
    },
  });

  const submit = async (values) => {
    await onSubmit({
      ...values,
      amount: Number(values.amount),
    });
    reset({ amount: '', category: values.category, reason: '' });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(submit)}>
      <div className="space-y-2">
        <label className="text-sm text-slate-300">Monto</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          placeholder="Ej. 1200"
          {...register('amount', {
            required: 'Monto requerido',
            min: { value: 1, message: 'Debe ser mayor a 0' },
          })}
        />
        {errors.amount ? (
          <p className="text-xs text-rose-300">{errors.amount.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Categoria</label>
        <select
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          {...register('category', { required: 'Categoria requerida' })}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category ? (
          <p className="text-xs text-rose-300">{errors.category.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-300">Motivo</label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          placeholder="Ej. Compra semanal del mercado"
          {...register('reason', {
            required: 'Motivo requerido',
            minLength: { value: 4, message: 'Describe un poco mas' },
          })}
        />
        {errors.reason ? (
          <p className="text-xs text-rose-300">{errors.reason.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 focus:ring-2 focus:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Enviando...' : 'Crear solicitud'}
      </button>
    </form>
  );
};

export default RequestForm;
