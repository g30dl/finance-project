import React from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  CheckCircle,
  CreditCard,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

const ACTION_COLORS = {
  green: 'border-emerald-500/50 bg-emerald-950/20 hover:bg-emerald-950/30 text-emerald-400',
  blue: 'border-blue-500/50 bg-blue-950/20 hover:bg-blue-950/30 text-blue-400',
  cyan: 'border-cyan-500/50 bg-cyan-950/20 hover:bg-cyan-950/30 text-cyan-400',
  purple: 'border-purple-500/50 bg-purple-950/20 hover:bg-purple-950/30 text-purple-400',
  orange: 'border-orange-500/50 bg-orange-950/20 hover:bg-orange-950/30 text-orange-400',
  pink: 'border-pink-500/50 bg-pink-950/20 hover:bg-pink-950/30 text-pink-400',
};

function AdminQuickActions({
  pendingRequests = 0,
  onDeposit,
  onTransfer,
  onApproveRequests,
  onDirectExpense,
  onRecurringExpenses,
  onReports,
}) {
  const actions = [
    {
      id: 'deposit',
      label: 'Depositar',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'green',
      onClick: onDeposit,
    },
    {
      id: 'transfer',
      label: 'Transferir',
      icon: <ArrowLeftRight className="h-5 w-5" />,
      color: 'blue',
      onClick: onTransfer,
    },
    {
      id: 'approve',
      label: 'Aprobar',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'cyan',
      badge: pendingRequests,
      onClick: onApproveRequests,
      disabled: pendingRequests === 0,
    },
    {
      id: 'expense',
      label: 'Gasto Directo',
      icon: <CreditCard className="h-5 w-5" />,
      color: 'purple',
      onClick: onDirectExpense,
    },
    {
      id: 'recurring',
      label: 'Recurrentes',
      icon: <RefreshCw className="h-5 w-5" />,
      color: 'orange',
      onClick: onRecurringExpenses,
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'pink',
      onClick: onReports,
    },
  ];

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-slate-200">Acciones Rapidas</h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg ${
              ACTION_COLORS[action.color]
            } ${action.disabled ? 'cursor-not-allowed opacity-50 hover:scale-100' : ''}`}
          >
            {action.badge > 0 ? (
              <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-2 py-1 text-xs font-bold text-white">
                {action.badge}
              </span>
            ) : null}
            {action.icon}
            <span className="text-xs font-medium text-slate-200">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AdminQuickActions;
