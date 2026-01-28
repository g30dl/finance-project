import React from 'react';
import { FileText, Home, Users, Wallet } from 'lucide-react';
import StatCard from '../dashboard/StatCard';
import { formatCurrency } from '../../utils/helpers';

function SystemStatsGrid({ casaBalance, personalTotal, pendingRequests }) {
  const totalBalance = Number(casaBalance || 0) + Number(personalTotal || 0);

  return (
    <div className="grid grid-cols-2 gap-4">
      <StatCard
        label="Total sistema"
        value={formatCurrency(totalBalance)}
        icon={Wallet}
        color="primary"
      />
      <StatCard
        label="Dinero casa"
        value={formatCurrency(casaBalance || 0)}
        icon={Home}
        color="success"
      />
      <StatCard
        label="Personal"
        value={formatCurrency(personalTotal || 0)}
        icon={Users}
        color="warning"
      />
      <StatCard
        label="Pendientes"
        value={String(pendingRequests || 0)}
        icon={FileText}
        color="danger"
      />
    </div>
  );
}

export default SystemStatsGrid;
