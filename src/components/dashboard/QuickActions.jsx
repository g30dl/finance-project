import React from 'react';
import { ChevronRight, DollarSign, Home } from 'lucide-react';

function QuickActions({ onUsePersonal, onRequestCasa, personalBalance }) {
  const balanceValue = Number(personalBalance) || 0;
  const canUsePersonal = balanceValue > 0;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-200">Acciones Rapidas</h3>

      <button
        type="button"
        onClick={onUsePersonal}
        disabled={!canUsePersonal}
        className={`w-full rounded-xl border-2 p-4 transition-all duration-200 ${
          canUsePersonal
            ? 'border-emerald-500/60 bg-emerald-950/20 hover:scale-[1.02] hover:bg-emerald-950/40'
            : 'cursor-not-allowed border-slate-700 bg-slate-800/50 opacity-50'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/20 p-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-50">Usar Mi Dinero Personal</p>
              <p className="text-xs text-slate-400">Gasta sin aprobacion</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </div>
      </button>

      <button
        type="button"
        onClick={onRequestCasa}
        className="w-full rounded-xl border-2 border-blue-500/60 bg-blue-950/20 p-4 transition-all duration-200 hover:scale-[1.02] hover:bg-blue-950/40"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <Home className="h-5 w-5 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-50">Solicitar de Casa</p>
              <p className="text-xs text-slate-400">Requiere aprobacion</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-400" />
        </div>
      </button>
    </div>
  );
}

export default QuickActions;
