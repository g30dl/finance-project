import React from 'react';
import { ChevronRight, DollarSign, Home } from 'lucide-react';

function QuickActions({ onUsePersonal, onRequestCasa, personalBalance }) {
  const balanceValue = Number(personalBalance) || 0;
  const canUsePersonal = balanceValue > 0;

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="font-heading text-base sm:text-lg text-foreground">Acciones Rapidas</h3>

      <button
        type="button"
        onClick={onUsePersonal}
        disabled={!canUsePersonal}
        className={`w-full min-h-[72px] p-4 sm:p-5 text-left transition-all duration-300 ${
          canUsePersonal
            ? 'rounded-2xl border border-success/30 bg-white shadow-card hover:-translate-y-1 hover:shadow-card-hover'
            : 'rounded-2xl border border-border bg-muted text-muted-foreground opacity-70 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-sm border border-success/30 bg-success/10 p-2 text-success">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-sm text-foreground sm:text-base">Usar Mi Dinero Personal</p>
              <p className="text-xs text-muted-foreground sm:text-sm">Gasta sin aprobacion</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </button>

      <button
        type="button"
        onClick={onRequestCasa}
        className="w-full min-h-[72px] rounded-2xl border border-primary/30 bg-white p-4 sm:p-5 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-sm border border-primary/30 bg-primary/10 p-2 text-primary">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-sm text-foreground sm:text-base">Solicitar de Casa</p>
              <p className="text-xs text-muted-foreground sm:text-sm">Requiere aprobacion</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </button>
    </div>
  );
}

export default QuickActions;
