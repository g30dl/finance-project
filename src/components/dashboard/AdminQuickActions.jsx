import React from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  CheckCircle,
  CreditCard,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

const ACTION_STYLES = {
  green: {
    surface: 'border-sage/45 bg-sage/10 hover:bg-sage/15',
    icon: 'text-sage',
  },
  blue: {
    surface: 'border-navy/45 bg-navy/10 hover:bg-navy/15',
    icon: 'text-navy',
  },
  cyan: {
    surface: 'border-info/45 bg-info/10 hover:bg-info/15',
    icon: 'text-info',
  },
  purple: {
    surface: 'border-burgundy/45 bg-burgundy/10 hover:bg-burgundy/15',
    icon: 'text-burgundy',
  },
  orange: {
    surface: 'border-rust/45 bg-rust/10 hover:bg-rust/15',
    icon: 'text-rust',
  },
  pink: {
    surface: 'border-terracotta/45 bg-terracotta/10 hover:bg-terracotta/15',
    icon: 'text-terracotta',
  },
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
    <div className="space-y-4">
      <h3 className="font-heading text-lg text-foreground">Acciones Rapidas</h3>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {actions.map((action) => {
          const style = ACTION_STYLES[action.color] || ACTION_STYLES.green;
          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={`relative flex flex-col items-center gap-2 rounded-md border p-4 text-center text-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${style.surface} ${
                action.disabled ? 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-none' : ''
              }`}
            >
              {action.badge > 0 ? (
                <span className="absolute -right-2 -top-2 rounded-sm border border-destructive/30 bg-destructive px-2 py-0.5 text-xs font-bold text-white">
                  {action.badge}
                </span>
              ) : null}
              <span className={style.icon}>{action.icon}</span>
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AdminQuickActions;

