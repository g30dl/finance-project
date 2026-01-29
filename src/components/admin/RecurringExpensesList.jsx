import React, { useEffect, useMemo, useState } from 'react';
import { Repeat, Plus } from 'lucide-react';
import { onValue, ref, remove, update } from 'firebase/database';
import { db } from '../../services/firebase';
import { Button, Card, EmptyState, Skeleton } from '../common';
import RecurringExpenseCard from './RecurringExpenseCard';
import RecurringExpenseForm from './RecurringExpenseForm';
import { calcularProximaEjecucion } from '../../utils/recurringHelpers';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Activos' },
  { id: 'inactive', label: 'Inactivos' },
];

function RecurringExpensesList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const expensesRef = ref(db, 'familia_finanzas/gastosRecurrentes');
    const unsubscribe = onValue(
      expensesRef,
      (snapshot) => {
        const data = snapshot.val();
        const list = data
          ? Object.values(data)
              .filter(Boolean)
              .sort((a, b) => Number(a.diaMes || 0) - Number(b.diaMes || 0))
          : [];
        setExpenses(list);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'active') return expenses.filter((item) => item.activo);
    if (filter === 'inactive') return expenses.filter((item) => !item.activo);
    return expenses;
  }, [expenses, filter]);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const toggleActive = async (expense) => {
    const nextActive = !expense.activo;
    const updates = {
      activo: nextActive,
    };

    if (nextActive) {
      updates.proximaEjecucion = calcularProximaEjecucion(expense.diaMes);
    }

    await update(ref(db, `familia_finanzas/gastosRecurrentes/${expense.id}`), updates);
  };

  const deleteExpense = async (expense) => {
    const confirmed = window.confirm(`Eliminar "${expense.nombre}"? Esta accion no se puede deshacer.`);
    if (!confirmed) return;
    await remove(ref(db, `familia_finanzas/gastosRecurrentes/${expense.id}`));
  };

  return (
    <Card
      title="Gastos recurrentes"
      subtitle="Programa pagos automáticos mensuales"
      headerAction={
        <Button onClick={() => setShowForm(true)} icon={<Plus className="h-4 w-4" />}>
          Agregar
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              filter === item.id
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-foreground-muted hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={`recurring-skeleton-${item}`} height="h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Repeat className="h-6 w-6" />}
          title="Sin gastos recurrentes"
          description="Programa pagos automáticos como luz, agua o internet."
          action={
            <Button onClick={() => setShowForm(true)}>
              Crear primero
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((expense) => (
            <RecurringExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={() => {
                setEditing(expense);
                setShowForm(true);
              }}
              onToggle={() => toggleActive(expense)}
              onDelete={() => deleteExpense(expense)}
            />
          ))}
        </div>
      )}

      <RecurringExpenseForm
        isOpen={showForm}
        onClose={handleCloseForm}
        editingExpense={editing}
      />
    </Card>
  );
}

export default RecurringExpensesList;
