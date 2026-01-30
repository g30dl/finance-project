import React, { Suspense, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBalance } from '../../hooks/useBalance';
import { useCategoryBudgets } from '../../hooks/useCategoryBudgets';
import { useMonthlyStats } from '../../hooks/useMonthlyStats';
import { useMonthlyPersonalSummary } from '../../hooks/useMonthlyPersonalSummary';
import StatCard from '../../components/dashboard/StatCard';
import CategoryBar from '../../components/dashboard/CategoryBar';
import { CategoryDonutChart, ChartLoader } from '../../components/charts/LazyCharts';
import AnimatedSection from '../../components/common/AnimatedSection';
import { formatCurrency } from '../../utils/helpers';

function HomeTab() {
  const { user } = useAuth();
  const { balance, loading } = useBalance('personal', user?.userId);
  const {
    ingresos,
    gastos,
    ingresosChange,
    gastosChange,
    loading: statsLoading,
  } = useMonthlyStats(user?.userId);
  const { summary } = useMonthlyPersonalSummary(user?.userId);
  const { categories, loading: categoriesLoading } = useCategoryBudgets(user?.userId);

  const formatChange = (value) => {
    if (!Number.isFinite(value)) return '0%';
    const rounded = Math.round(value);
    return `${rounded >= 0 ? '+' : ''}${rounded}%`;
  };

  const categoriesList = useMemo(() => categories || [], [categories]);
  const chartData = useMemo(() => {
    const breakdown = summary?.categoryBreakdown || {};
    const colorMap = {
      comida: '#10B981',
      transporte: '#3B82F6',
      salud: '#EF4444',
      educacion: '#8B5CF6',
      entretenimiento: '#EC4899',
      servicios: '#F59E0B',
      ropa: '#06B6D4',
      hogar: '#B45309',
      tecnologia: '#6366F1',
      otros: '#64748B',
    };

    return Object.entries(breakdown)
      .map(([name, value]) => ({
        name,
        value,
        color: colorMap[name] || '#94A3B8',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [summary?.categoryBreakdown]);

  return (
    <div className="pb-24 px-4 space-y-6">
      <AnimatedSection>
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 text-white shadow-lg mt-4">
          <p className="text-sm opacity-90 mb-2">Tu saldo disponible</p>
          <p className="text-hero font-heading">{loading ? '...' : formatCurrency(balance || 0)}</p>
        </div>
      </AnimatedSection>

      {/* Stats Grid */}
      <AnimatedSection delay={0.05}>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Ingresos"
            value={formatCurrency(ingresos || 0)}
            change={statsLoading ? null : formatChange(ingresosChange)}
            trend={ingresosChange >= 0 ? 'up' : 'down'}
            icon={TrendingUp}
            color="success"
          />
          <StatCard
            label="Gastos"
            value={formatCurrency(gastos || 0)}
            change={statsLoading ? null : formatChange(gastosChange)}
            trend={gastosChange <= 0 ? 'up' : 'down'}
            icon={TrendingDown}
            color="danger"
          />
        </div>
      </AnimatedSection>

      {/* Categorias */}
      <AnimatedSection delay={0.1}>
        <div className="space-y-3">
          <h3 className="font-heading font-semibold text-lg">Presupuesto</h3>
          {categoriesLoading ? (
            <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-card">
              Cargando categorias...
            </div>
          ) : categoriesList.length === 0 ? (
            <div className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-card">
              No hay presupuesto configurado aun.
            </div>
          ) : (
            categoriesList.map((cat) => (
              <CategoryBar
                key={cat.category}
                category={cat.category}
                spent={cat.spent}
                budget={cat.budget}
              />
            ))
          )}
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.15}>
        <div className="rounded-3xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Gastos por categoria</h3>
            <span className="text-xs text-gray-400">Mes actual</span>
          </div>
          <Suspense fallback={<ChartLoader />}>
            <CategoryDonutChart data={chartData} />
          </Suspense>
        </div>
      </AnimatedSection>
    </div>
  );
}

export default HomeTab;
