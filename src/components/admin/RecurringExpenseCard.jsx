import React, { useMemo } from 'react';
import { Bell, Calendar, Clock, Pencil, Power, Trash2 } from 'lucide-react';
import { Badge } from '../common';
import { formatCurrency } from '../../utils/helpers';
import { getCategoryIcon, getCategoryColor } from '../../utils/categories';
import { CATEGORIES } from '../../utils/constants';

const CATEGORY_LABELS = CATEGORIES.reduce((acc, category) => {
  acc[category.id] = category.label;
  return acc;
}, {});

function RecurringExpenseCard({ expense, onEdit, onToggle, onDelete }) {
  const diasRestantes = useMemo(() => {
    const diff = Number(expense.proximaEjecucion || 0) - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [expense.proximaEjecucion]);

  const categoryLabel = CATEGORY_LABELS[expense.categoria] || expense.categoria || 'Categoria';
  const categoryColor = getCategoryColor(expense.categoria);

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        expense.activo
          ? 'border-border bg-white hover:-translate-y-1 hover:shadow-card-hover'
          : 'border-border/60 bg-muted/40 opacity-70'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`text-3xl ${categoryColor}`}>{getCategoryIcon(expense.categoria)}</span>
          <Badge variant={expense.activo ? 'success' : 'neutral'}>
            {expense.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border border-border bg-white p-2 text-foreground-muted transition-colors hover:text-foreground"
            aria-label="Editar gasto recurrente"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-xl border border-border bg-white p-2 text-foreground-muted transition-colors hover:text-foreground"
            aria-label={expense.activo ? 'Desactivar gasto recurrente' : 'Activar gasto recurrente'}
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl border border-border bg-white p-2 text-danger transition-colors hover:bg-danger/10"
            aria-label="Eliminar gasto recurrente"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h4 className="font-heading text-lg text-foreground">{expense.nombre}</h4>
      <p className="mt-1 text-2xl font-bold text-primary">
        {formatCurrency(expense.monto)}
      </p>

      <div className="mt-4 space-y-2 text-sm text-foreground-muted">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            Dia {expense.diaMes} de cada mes · {categoryLabel}
          </span>
        </div>

        {Number.isFinite(diasRestantes) && diasRestantes <= 7 ? (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className={diasRestantes <= 3 ? 'text-warning font-semibold' : ''}>
              {diasRestantes <= 0 ? 'Hoy' : `En ${diasRestantes} dias`}
            </span>
          </div>
        ) : null}

        {expense.notificarAntes ? (
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notificar {expense.diasNotificacion} dias antes</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default RecurringExpenseCard;
