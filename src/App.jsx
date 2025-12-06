import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

const PlaceholderCard = ({ title, children }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
    <h2 className="text-lg font-semibold text-white">{title}</h2>
    <p className="mt-2 text-sm text-slate-400">{children}</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <div className="min-h-screen bg-slate-950 text-slate-50">
          <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
            <header className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Familia Finanzas</p>
              <h1 className="text-3xl font-bold">Estructura base creada</h1>
              <p className="text-slate-400">
                Usa los directorios de <code className="font-mono text-cyan-300">src/</code> para agregar componentes, hooks y servicios.
              </p>
            </header>
            <section className="grid gap-6 md:grid-cols-2">
              <PlaceholderCard title="Componentes">
                Anade pantallas en src/components/dashboard, solicitudes y reportes segun el flujo de negocio.
              </PlaceholderCard>
              <PlaceholderCard title="Servicios Firebase">
                Completa src/services/firebase.js con tus credenciales y expande database.js y notifications.js.
              </PlaceholderCard>
              <PlaceholderCard title="Hooks">
                Implementa logica en useAuth.js, useFirebase.js y useOffline.js para autenticacion, datos y modo offline.
              </PlaceholderCard>
              <PlaceholderCard title="Estilos">
                Tailwind ya esta configurado. Ajusta tokens en tailwind.config.js y estilos globales en src/styles/global.css.
              </PlaceholderCard>
            </section>
          </main>
        </div>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
