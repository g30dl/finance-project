import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AccountTypeReport from '../components/reportes/AccountTypeReport';
import PersonReportView from '../components/reportes/PersonReportView';

function ReportsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('persona');

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/admin')}
            className="inline-flex items-center justify-center rounded-sm border border-border bg-secondary p-2 text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-primary"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-heading text-2xl text-foreground">Reportes</h1>
            <p className="text-sm text-muted-foreground">Analisis administrativo del sistema</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 slide-up">
        <div className="flex flex-wrap gap-2 border-b border-border/80 pb-2">
          <button
            type="button"
            onClick={() => setView('persona')}
            className={`rounded-sm border px-3 py-2 text-sm font-semibold transition-colors ${
              view === 'persona'
                ? 'border-border bg-secondary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Por persona
          </button>
          <button
            type="button"
            onClick={() => setView('tipo')}
            className={`rounded-sm border px-3 py-2 text-sm font-semibold transition-colors ${
              view === 'tipo'
                ? 'border-border bg-secondary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Por tipo de cuenta
          </button>
        </div>

        {view === 'persona' ? <PersonReportView /> : <AccountTypeReport />}
      </main>
    </div>
  );
}

export default ReportsPage;

