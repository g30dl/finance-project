import React from 'react';
import { formatCurrency } from '../../utils/helpers';
import QuickActionsGrid from './QuickActionsGrid';

function AdminHeroSection({
  casaBalance = 0,
  personalTotal = 0,
  totalBalance = 0,
  onDeposit,
  onTransfer,
  onApprove,
  onRecurring,
  onReports,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-accent p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_55%)] opacity-60" />
        <div className="absolute -right-16 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10">
          <p className="text-sm font-medium text-white/80">Total del sistema</p>
          <h2 className="mt-2 font-heading text-5xl font-bold">
            {formatCurrency(totalBalance)}
          </h2>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <span className="text-xs text-white/70">Dinero Casa</span>
              <p className="font-heading text-lg">{formatCurrency(casaBalance)}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <span className="text-xs text-white/70">Cuentas personales</span>
              <p className="font-heading text-lg">{formatCurrency(personalTotal)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-card backdrop-blur-xl">
        <h3 className="mb-4 font-heading text-lg text-foreground">Acciones rapidas</h3>
        <QuickActionsGrid
          onDeposit={onDeposit}
          onTransfer={onTransfer}
          onApprove={onApprove}
          onRecurring={onRecurring}
          onReports={onReports}
        />
      </div>
    </div>
  );
}

export default AdminHeroSection;
