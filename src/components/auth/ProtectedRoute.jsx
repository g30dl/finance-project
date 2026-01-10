import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
      <span className="text-sm text-slate-400">Cargando...</span>
    </div>
  </div>
);

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <Navigate
        to="/"
        replace
        state={{ message: 'No tienes permiso para acceder a esta pagina.' }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;
