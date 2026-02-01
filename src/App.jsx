import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginScreen from './components/auth/LoginScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import BottomNav from './components/layout/BottomNav';
import { ErrorBoundary, InstallPWA, QueueIndicator } from './components/common';
import { cleanupQueue } from './utils/indexedDBHelper';
import { Toaster } from 'sonner';

const AdminDashboard = lazy(() => import('./components/dashboard/AdminDashboard'));
const SolicitanteDashboard = lazy(() => import('./components/dashboard/SolicitanteDashboard'));
const PersonalExpenseForm = lazy(() => import('./components/personal/PersonalExpenseForm'));
const AccountDetailPage = lazy(() => import('./pages/AccountDetailPage'));
const RecurringExpensesPage = lazy(() => import('./pages/RecurringExpensesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ActivityTab = lazy(() => import('./pages/tabs/ActivityTab'));
const HomeTab = lazy(() => import('./pages/tabs/HomeTab'));
const ProfileTab = lazy(() => import('./pages/tabs/ProfileTab'));
const RequestTab = lazy(() => import('./pages/tabs/RequestTab'));
const RequestsTab = lazy(() => import('./pages/tabs/RequestsTab'));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
      <span className="text-sm text-muted-foreground">Cargando...</span>
    </div>
  </div>
);

function TabsShell({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

function App() {
  useEffect(() => {
    let interval;

    const runCleanup = async () => {
      try {
        await cleanupQueue();
      } catch (error) {
        console.warn('No se pudo limpiar la cola offline', error);
      }
    };

    if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
      runCleanup();
      interval = setInterval(runCleanup, 24 * 60 * 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-50 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-card"
            >
              Saltar al contenido principal
            </a>
            <div className="min-h-screen bg-background text-foreground font-body">
              <Suspense fallback={<PageLoader />}>
                <main id="main-content" tabIndex={-1} className="min-h-screen">
                  <Routes>
                    <Route path="/" element={<LoginScreen />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <TabsShell>
                            <HomeTab />
                          </TabsShell>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/activity"
                      element={
                        <ProtectedRoute>
                          <TabsShell>
                            <ActivityTab />
                          </TabsShell>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/request"
                      element={
                        <ProtectedRoute>
                          <TabsShell>
                            <RequestTab />
                          </TabsShell>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/requests"
                      element={
                        <ProtectedRoute>
                          <TabsShell>
                            <RequestsTab />
                          </TabsShell>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <TabsShell>
                            <ProfileTab />
                          </TabsShell>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/solicitante/:userId"
                      element={
                        <ProtectedRoute>
                          <SolicitanteDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard/admin"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/gasto-personal"
                      element={
                        <ProtectedRoute>
                          <PersonalExpenseForm />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/gastos-recurrentes"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <RecurringExpensesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cuenta-detalle/:userId"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <AccountDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/reportes"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <ReportsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notificaciones"
                      element={
                        <ProtectedRoute>
                          <NotificationsPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </Suspense>
            </div>
            <QueueIndicator />
            <InstallPWA />
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
