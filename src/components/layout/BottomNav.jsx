import React from 'react';
import { Home, BarChart3, Plus, FileText, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { id: 'home', icon: Home, label: 'Inicio', path: '/dashboard' },
  { id: 'activity', icon: BarChart3, label: 'Actividad', path: '/activity' },
  { id: 'request', icon: Plus, label: 'Solicitar', path: '/request', isFAB: true },
  { id: 'requests', icon: FileText, label: 'Solicitudes', path: '/requests' },
  { id: 'profile', icon: User, label: 'Perfil', path: '/profile' },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50 safe-area-bottom"
    >
      <div className="flex justify-around items-center h-16 max-w-screen-sm mx-auto px-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          if (tab.isFAB) {
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="relative -mt-8 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
