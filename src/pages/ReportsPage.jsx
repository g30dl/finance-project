import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PersonReportView from '../components/reportes/PersonReportView';

function ReportsPage() {
  const navigate = useNavigate();

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
            <h1 className="text-xl font-semibold text-slate-50">
              Reportes por Persona
            </h1>
            <p className="text-sm text-slate-400">
              Analiza la actividad financiera de cada miembro.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
        <PersonReportView />
      </main>
    </div>
  );
}

export default ReportsPage;
