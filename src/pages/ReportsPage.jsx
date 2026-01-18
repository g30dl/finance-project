import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AccountTypeReport from '../components/reportes/AccountTypeReport';
import PersonReportView from '../components/reportes/PersonReportView';

function ReportsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState('persona');

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/admin')}
            className="rounded-lg p-2 transition-colors hover:bg-slate-800"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5 text-slate-300" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-50">Reportes</h1>
            <p className="text-sm text-slate-400">
              Analisis administrativo del sistema
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setView('persona')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              view === 'persona'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Por persona
          </button>
          <button
            type="button"
            onClick={() => setView('tipo')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              view === 'tipo'
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:text-slate-200'
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
