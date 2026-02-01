import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../hooks/useAuth';
import { registerPushToken, unregisterPushToken } from '../../services/pushNotifications';

function SettingsSection() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    if (typeof Notification === 'undefined') return false;
    return Notification.permission === 'granted';
  });
  const [currency, setCurrency] = useState('MXN');
  const [language, setLanguage] = useState('es');

  const handleToggleNotifications = async () => {
    const next = !notifications;

    if (next) {
      if (!user?.userId) {
        toast.error('Inicia sesion para activar notificaciones.');
        return;
      }
      const result = await registerPushToken(user.userId);
      if (!result.success) {
        toast.error(result.error || 'No se pudieron activar notificaciones.');
        setNotifications(false);
        return;
      }
      toast.success('Notificaciones activadas.');
      setNotifications(true);
      return;
    }

    await unregisterPushToken(user?.userId);
    toast.message('Notificaciones desactivadas.');
    setNotifications(false);
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Configuracion</h3>

      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm font-medium text-gray-900">Notificaciones</p>
          <p className="text-xs text-gray-500">Avisos de solicitudes y saldo</p>
        </div>
        <button
          type="button"
          onClick={handleToggleNotifications}
          className={`h-6 w-11 rounded-full p-1 transition-all ${
            notifications ? 'bg-primary' : 'bg-gray-200'
          }`}
          aria-pressed={notifications}
          aria-label={notifications ? 'Desactivar notificaciones' : 'Activar notificaciones'}
        >
          <span
            className={`block h-4 w-4 rounded-full bg-white transition-transform ${
              notifications ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm font-medium text-gray-900">Moneda</p>
          <p className="text-xs text-gray-500">Selecciona tu moneda principal</p>
        </div>
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm"
        >
          <option value="MXN">MXN</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm font-medium text-gray-900">Idioma</p>
          <p className="text-xs text-gray-500">Preferencia de idioma</p>
        </div>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm"
        >
          <option value="es">Espanol</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );
}

export default SettingsSection;
