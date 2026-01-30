import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RecurringExpensesList from '../components/admin/RecurringExpensesList';

function RecurringExpensesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/admin')}
            className="inline-flex items-center justify-center rounded-xl border border-border bg-white p-2 text-foreground-muted transition-colors hover:text-primary"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl text-foreground">Gastos recurrentes</h1>
            <p className="text-sm text-foreground-muted">Gestiona y monitorea pagos automaticos</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 animate-slide-up">
        <RecurringExpensesList />
      </main>
    </div>
  );
}

export default RecurringExpensesPage;
