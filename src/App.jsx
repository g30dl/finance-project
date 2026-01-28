import React from 'react';
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

function TabsShell({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

function App() {
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
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
