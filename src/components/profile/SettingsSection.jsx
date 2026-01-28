import React, { useState } from 'react';

function SettingsSection() {
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState('MXN');
  const [language, setLanguage] = useState('es');

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
          onClick={async () => {
            const next = !notifications;
            if (next && typeof Notification !== 'undefined' && Notification.permission === 'default') {
              try {
                await Notification.requestPermission();
              } catch (error) {
                console.warn('No se pudo solicitar permiso', error);
              }
            }
            setNotifications(next);
          }}
          className={`h-6 w-11 rounded-full p-1 transition-all ${
            notifications ? 'bg-primary' : 'bg-gray-200'
          }`}
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
