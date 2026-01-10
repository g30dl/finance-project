import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginScreen from './components/auth/LoginScreen';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './components/dashboard/AdminDashboard';
import SolicitanteDashboard from './components/dashboard/SolicitanteDashboard';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-950 text-slate-50">
            <Routes>
              <Route path="/" element={<LoginScreen />} />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
