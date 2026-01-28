import React, { useMemo } from 'react';
import { useAccountTypeData } from '../../hooks/useAccountTypeData';
import { useUsers } from '../../hooks/useUsers';
import CategoryDistributionChart from './CategoryDistributionChart';
import MonthlyTrendChart from './MonthlyTrendChart';
import TopCategoriesTable from './TopCategoriesTable';
import UserSpendingChart from './UserSpendingChart';

function AdminReportsTab() {
  const { casaData, personalData, loading, error } = useAccountTypeData();
  const { users } = useUsers();

  const userSpendData = useMemo(() => {
    const map = personalData?.porUsuario || {};
    return Object.entries(map).map(([userId, value]) => {
      const user = users.find((item) => item.userId === userId);
      return {
        name: user?.nombre || user?.userId || 'Usuario',
        value,
      };
    });
  }, [personalData?.porUsuario, users]);

  const trendData = useMemo(() => {
    const casaMonths = casaData?.ultimosMeses || [];
    const personalMonths = personalData?.ultimosMeses || [];
    return casaMonths.map((item, index) => {
      const personal = personalMonths[index] || {};
      return {
        month: item.mes,
        ingresos: Number(item.ingresos || 0) + Number(personal.ingresos || 0),
        gastos: Number(item.egresos || 0) + Number(personal.egresos || 0),
      };
    });
  }, [casaData?.ultimosMeses, personalData?.ultimosMeses]);

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 text-sm text-gray-500 shadow-card">
        Cargando reportes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-white p-6 text-sm text-red-500 shadow-card">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryDistributionChart breakdown={casaData?.porCategoria} />
        <MonthlyTrendChart data={trendData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UserSpendingChart data={userSpendData} />
        <TopCategoriesTable breakdown={casaData?.porCategoria} />
      </div>
    </div>
  );
}

export default AdminReportsTab;
