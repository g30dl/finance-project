import React, { useEffect, useMemo, useState } from 'react';
import { Download, X } from 'lucide-react';
import Button from './Button';

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_WINDOW_MS = 24 * 60 * 60 * 1000;

function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  const dismissedRecently = useMemo(() => {
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY);
      if (!dismissed) return false;
      return Date.now() - Number(dismissed) < DISMISS_WINDOW_MS;
    } catch (error) {
      console.warn('No se pudo leer localStorage', error);
      return false;
    }
  }, []);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);

      if (!dismissedRecently) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissedRecently]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (error) {
      console.warn('No se pudo guardar localStorage', error);
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up md:left-auto md:right-4 md:w-96">
      <div className="rounded-2xl border border-primary/30 bg-white p-4 shadow-card-hover">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Download className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-heading text-sm font-semibold text-foreground">
              Instalar Familia Finanzas
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Instala la app para acceso rapido y funcionalidad offline
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleDismiss} fullWidth>
            Ahora no
          </Button>
          <Button variant="primary" size="sm" onClick={handleInstall} fullWidth>
            Instalar
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InstallPWA;
