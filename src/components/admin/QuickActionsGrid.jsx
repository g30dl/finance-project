import React from 'react';
import { ArrowLeftRight, FileText, Plus, Repeat, Send } from 'lucide-react';

const ACTIONS = [
  {
    id: 'deposit',
    label: 'Depositar',
    icon: Plus,
    gradient: 'from-success to-success/80',
  },
  {
    id: 'transfer',
    label: 'Transferir',
    icon: ArrowLeftRight,
    gradient: 'from-primary to-primary-dark',
  },
  {
    id: 'approve',
    label: 'Aprobar',
    icon: Send,
    gradient: 'from-info to-info/80',
  },
  {
    id: 'recurring',
    label: 'Recurrentes',
    icon: Repeat,
    gradient: 'from-warning to-warning/80',
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: FileText,
    gradient: 'from-accent to-accent/80',
  },
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
            className={`min-h-[96px] rounded-2xl bg-gradient-to-br ${action.gradient} p-4 text-left text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl sm:p-5`}
          >
            <Icon className="mb-3 h-6 w-6 sm:h-7 sm:w-7" />
            <span className="text-xs font-semibold sm:text-sm">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default QuickActionsGrid;
