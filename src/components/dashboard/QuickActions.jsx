import React from 'react';
import { ChevronRight, DollarSign, Home } from 'lucide-react';

function QuickActions({ onUsePersonal, onRequestCasa, personalBalance }) {
  const balanceValue = Number(personalBalance) || 0;
  const canUsePersonal = balanceValue > 0;

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-lg text-foreground">Acciones Rapidas</h3>

      <button
        type="button"
        onClick={onUsePersonal}
        disabled={!canUsePersonal}
        className={`w-full rounded-md border p-4 text-left transition-all duration-300 ${
          canUsePersonal
            ? 'vintage-card-hover border-sage/40 hover:-translate-y-1 hover:shadow-lg'
            : 'cursor-not-allowed border-border bg-secondary/60 text-muted-foreground opacity-70'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-sm border border-sage/30 bg-sage/10 p-2 text-sage">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-sm text-foreground">Usar Mi Dinero Personal</p>
              <p className="text-xs text-muted-foreground">Gasta sin aprobacion</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </button>

      <button
        type="button"
        onClick={onRequestCasa}
        className="vintage-card-hover w-full rounded-md border border-navy/40 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-sm border border-navy/30 bg-navy/10 p-2 text-navy">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="font-heading text-sm text-foreground">Solicitar de Casa</p>
              <p className="text-xs text-muted-foreground">Requiere aprobacion</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </button>
    </div>
  );
}

export default QuickActions;

