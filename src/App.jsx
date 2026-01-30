import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginScreen from './components/auth/LoginScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import BottomNav from './components/layout/BottomNav';
import { InstallPWA, QueueIndicator } from './components/common';
import { cleanupQueue } from './utils/indexedDBHelper';

const AdminDashboard = lazy(() => import('./components/dashboard/AdminDashboard'));
const SolicitanteDashboard = lazy(() => import('./components/dashboard/SolicitanteDashboard'));
const PersonalExpenseForm = lazy(() => import('./components/personal/PersonalExpenseForm'));
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
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground font-body">
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </div>
          <QueueIndicator />
          <InstallPWA />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
