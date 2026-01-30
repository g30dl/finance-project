import React, { useEffect, useMemo, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const status = useMemo(
    () =>
      isOnline
        ? {
            label: 'Online',
            icon: <Wifi className="h-4 w-4" />,
            className: 'border-success/30 bg-success/10 text-success',
          }
        : {
            label: 'Offline',
            icon: <WifiOff className="h-4 w-4" />,
            className: 'border-warning/30 bg-warning/10 text-warning',
          },
    [isOnline]
  );

  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${status.className}`}
    >
      {status.icon}
      <span>{status.label}</span>
    </div>
  );
}

export default OfflineIndicator;
