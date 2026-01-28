import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminReportsTab from '../components/admin/AdminReportsTab';
import AccountTypeReport from '../components/reportes/AccountTypeReport';
import PersonReportView from '../components/reportes/PersonReportView';

function ReportsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('sistema');

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
            <h1 className="font-heading text-2xl text-foreground">Reportes</h1>
            <p className="text-sm text-foreground-muted">Analisis administrativo del sistema</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 animate-slide-up">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView('sistema')}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
              view === 'sistema'
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            Sistema
          </button>
          <button
            type="button"
            onClick={() => setView('persona')}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
              view === 'persona'
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            Por persona
          </button>
          <button
            type="button"
            onClick={() => setView('tipo')}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
              view === 'tipo'
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            Por tipo de cuenta
          </button>
        </div>

        {view === 'sistema' ? (
          <AdminReportsTab />
        ) : view === 'persona' ? (
          <PersonReportView />
        ) : (
          <AccountTypeReport />
        )}
      </main>
    </div>
  );
}

export default ReportsPage;
