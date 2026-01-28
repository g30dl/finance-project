import React from 'react';
import { ArrowLeftRight, FileText, Plus, Repeat, Send } from 'lucide-react';

const ACTIONS = [
  { id: 'deposit', label: 'Depositar', icon: Plus },
  { id: 'transfer', label: 'Transferir', icon: ArrowLeftRight },
  { id: 'approve', label: 'Aprobar', icon: Send },
  { id: 'recurring', label: 'Recurrentes', icon: Repeat },
  { id: 'reports', label: 'Reportes', icon: FileText },
];

function QuickActionsGrid({ onDeposit, onTransfer, onApprove, onRecurring, onReports }) {
  const handlers = {
    deposit: onDeposit,
    transfer: onTransfer,
    approve: onApprove,
    recurring: onRecurring,
    reports: onReports,
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.id}
            type="button"
            onClick={handlers[action.id]}
            className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-card transition-all hover:shadow-card-hover"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-gray-800">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default QuickActionsGrid;
