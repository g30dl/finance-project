import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginScreen from './components/auth/LoginScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './components/dashboard/AdminDashboard';
import SolicitanteDashboard from './components/dashboard/SolicitanteDashboard';
import BottomNav from './components/layout/BottomNav';
import PersonalExpenseForm from './components/personal/PersonalExpenseForm';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import ActivityTab from './pages/tabs/ActivityTab';
import HomeTab from './pages/tabs/HomeTab';
import ProfileTab from './pages/tabs/ProfileTab';
import RequestTab from './pages/tabs/RequestTab';
import RequestsTab from './pages/tabs/RequestsTab';
import { InstallPWA, QueueIndicator } from './components/common';
import { cleanupQueue } from './utils/indexedDBHelper';

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
          </div>
          <QueueIndicator />
          <InstallPWA />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
