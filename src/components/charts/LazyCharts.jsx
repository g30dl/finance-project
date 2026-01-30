import { lazy } from 'react';

export const CategoryDonutChart = lazy(() => import('./CategoryDonutChart'));
export const MonthlyBarChart = lazy(() => import('./MonthlyBarChart'));
export const BalanceTrendChart = lazy(() => import('./BalanceTrendChart'));

export const ChartLoader = () => (
  <div className="flex h-40 items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
  </div>
);
