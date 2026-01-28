import { useMemo } from 'react';
import { useFirebaseData } from './useFirebaseData';
import { useMonthlyPersonalSummary } from './useMonthlyPersonalSummary';
import { CATEGORIES } from '../utils/constants';

const buildItems = ({ budgets, breakdown }) => {
  return CATEGORIES.map((category) => {
    const spent = Number(breakdown?.[category.id]) || 0;
    const budget = Number(budgets?.[category.id]) || 0;
    const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    return {
      category: category.id,
      spent,
      budget,
      percentage,
    };
  }).filter((item) => item.budget > 0 || item.spent > 0);
};

export const useCategoryBudgets = (userId) => {
  const budgetsPath = userId
    ? `familia_finanzas/cuentas/personales/${userId}/presupuestos`
    : null;
  const legacyBudgetsPath = userId ? `familia_finanzas/presupuestos/${userId}` : null;

  const { data: budgetsData, loading: loadingBudgets, error: budgetsError } =
    useFirebaseData(budgetsPath);
  const { data: legacyBudgets, loading: loadingLegacy, error: legacyError } =
    useFirebaseData(legacyBudgetsPath);

  const { summary, loading: loadingSummary, error: summaryError } =
    useMonthlyPersonalSummary(userId);

  const budgets = budgetsData || legacyBudgets || {};

  const items = useMemo(
    () => buildItems({ budgets, breakdown: summary?.categoryBreakdown }),
    [budgets, summary?.categoryBreakdown]
  );

  return {
    categories: items,
    loading: loadingBudgets || loadingLegacy || loadingSummary,
    error: budgetsError || legacyError || summaryError,
  };
};
