import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBalance } from '../../hooks/useBalance';
import { useFirebaseData } from '../../hooks/useFirebaseData';
import StatCard from '../../components/dashboard/StatCard';
import CategoryBar from '../../components/dashboard/CategoryBar';
import { formatCurrency } from '../../utils/helpers';

function HomeTab() {
  const { user } = useAuth();
  const { balance, loading } = useBalance('personal', user?.userId);
  const { data: personalAccounts } = useFirebaseData('familia_finanzas/cuentas/personales');

  // Mock data para categorias (reemplaza con datos reales)
  const categories = [
    { id: 'comida', spent: 450, budget: 600 },
    { id: 'transporte', spent: 180, budget: 300 },
    { id: 'salud', spent: 90, budget: 200 },
  ];

  return (
    <div className="pb-24 px-4 space-y-6">
      {/* Hero Balance */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 text-white shadow-lg mt-4">
        <p className="text-sm opacity-90 mb-2">Tu saldo disponible</p>
        <p className="text-hero font-heading">{loading ? '...' : formatCurrency(balance || 0)}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Ingresos"
          value={formatCurrency(2500)}
          change="+12%"
          trend="up"
          icon={TrendingUp}
          color="success"
        />
        <StatCard
          label="Gastos"
          value={formatCurrency(1800)}
          change="+8%"
          trend="down"
          icon={TrendingDown}
          color="danger"
        />
      </div>

      {/* Categorias */}
      <div className="space-y-3">
        <h3 className="font-heading font-semibold text-lg">Presupuesto</h3>
        {categories.map((cat) => (
          <CategoryBar key={cat.id} category={cat.id} spent={cat.spent} budget={cat.budget} />
        ))}
      </div>
    </div>
  );
}

export default HomeTab;
