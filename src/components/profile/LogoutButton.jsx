import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm('Quieres cerrar sesion?');
    if (!confirmed) return;
    logout();
    navigate('/', { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 shadow-card transition-colors hover:bg-red-100"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesion
    </button>
  );
}

export default LogoutButton;
