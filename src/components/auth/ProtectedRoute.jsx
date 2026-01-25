import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      <span className="text-sm text-muted-foreground">Cargando...</span>
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
