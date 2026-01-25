import React, { useState } from 'react';
import * as UI from '../components/common';
import { Mail, Save, Search, Trash2, User } from 'lucide-react';

function ComponentsShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        <header>
          <h1 className="mb-2 text-4xl font-bold text-foreground">
            Biblioteca de Componentes
          </h1>
          <p className="text-muted-foreground">
            Vista previa de los componentes UI disponibles.
          </p>
        </header>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Buttons</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <UI.Button variant="primary">Primary</UI.Button>
              <UI.Button variant="secondary">Secondary</UI.Button>
              <UI.Button variant="danger">Danger</UI.Button>
              <UI.Button variant="ghost">Ghost</UI.Button>
              <UI.Button variant="outline">Outline</UI.Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <UI.Button size="sm">Small</UI.Button>
              <UI.Button size="md">Medium</UI.Button>
              <UI.Button size="lg">Large</UI.Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <UI.Button icon={<Save size={16} />}>Con icono</UI.Button>
              <UI.Button loading>Cargando</UI.Button>
              <UI.Button disabled>Deshabilitado</UI.Button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Inputs</h2>
          <div className="max-w-md space-y-4">
            <UI.Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              icon={<Mail size={16} />}
              helperText="Ingresa tu correo electronico"
            />
            <UI.Input
              label="Nombre"
              placeholder="Juan Perez"
              icon={<User size={16} />}
              error="Este campo es requerido"
            />
            <UI.Input
              label="Buscar"
              placeholder="Buscar..."
              iconRight={<Search size={16} />}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Select</h2>
          <div className="max-w-md">
            <UI.Select
              label="Categoria"
              options={[
                { value: 'comida', label: 'Comida' },
                { value: 'transporte', label: 'Transporte' },
                { value: 'salud', label: 'Salud' },
              ]}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Textarea</h2>
          <div className="max-w-md">
            <UI.Textarea
              label="Descripcion"
              placeholder="Escribe una descripcion..."
              maxLength={200}
              showCount
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <UI.Badge variant="success">Exitoso</UI.Badge>
            <UI.Badge variant="warning">Advertencia</UI.Badge>
            <UI.Badge variant="danger">Peligro</UI.Badge>
            <UI.Badge variant="info">Informacion</UI.Badge>
            <UI.Badge variant="neutral">Neutral</UI.Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <UI.Badge variant="success" dot>
              Con punto
            </UI.Badge>
            <UI.Badge variant="info" size="sm">
              Pequeno
            </UI.Badge>
            <UI.Badge variant="warning" size="lg">
              Grande
            </UI.Badge>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Alerts</h2>
          <div className="max-w-2xl space-y-3">
            <UI.Alert variant="success" title="Exito">
              Tu operacion se completo correctamente.
            </UI.Alert>
            <UI.Alert variant="warning">Advertencia: El saldo esta bajo.</UI.Alert>
            <UI.Alert variant="danger" onClose={() => {}}>
              Error: No se pudo procesar la solicitud.
            </UI.Alert>
            <UI.Alert variant="info" title="Informacion">
              Tienes 3 solicitudes pendientes de aprobacion.
            </UI.Alert>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Cards</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <UI.Card title="Card Simple">Contenido de la tarjeta.</UI.Card>
            <UI.Card
              title="Con Header Action"
              subtitle="Subtitulo de ejemplo"
              headerAction={
                <UI.Button size="sm" variant="ghost">
                  Accion
                </UI.Button>
              }
            >
              Contenido con accion en el header.
            </UI.Card>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Modal</h2>
          <UI.Button onClick={() => setModalOpen(true)}>Abrir Modal</UI.Button>

          <UI.Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Modal de Ejemplo"
          >
            <p className="mb-4 text-muted-foreground">Este es el contenido del modal.</p>
            <div className="flex justify-end gap-3">
              <UI.Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </UI.Button>
              <UI.Button onClick={() => setModalOpen(false)}>Aceptar</UI.Button>
            </div>
          </UI.Modal>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Empty State</h2>
          <UI.Card>
            <UI.EmptyState
              icon={<Trash2 size={48} />}
              title="No hay elementos"
              description="Aun no tienes ningun elemento en esta seccion."
              action={<UI.Button>Crear Nuevo</UI.Button>}
            />
          </UI.Card>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Tooltip</h2>
          <div className="flex flex-wrap gap-4">
            <UI.Tooltip content="Tooltip arriba" position="top">
              <UI.Button variant="outline">Hover Top</UI.Button>
            </UI.Tooltip>
            <UI.Tooltip content="Tooltip abajo" position="bottom">
              <UI.Button variant="outline">Hover Bottom</UI.Button>
            </UI.Tooltip>
            <UI.Tooltip content="Tooltip izquierda" position="left">
              <UI.Button variant="outline">Hover Left</UI.Button>
            </UI.Tooltip>
            <UI.Tooltip content="Tooltip derecha" position="right">
              <UI.Button variant="outline">Hover Right</UI.Button>
            </UI.Tooltip>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-foreground">Skeleton</h2>
          <div className="max-w-md space-y-3">
            <UI.Skeleton height="h-12" />
            <UI.Skeleton height="h-6" width="w-3/4" />
            <UI.Skeleton height="h-4" width="w-1/2" />
          </div>
        </section>
      </div>
    </div>
  );
}

export default ComponentsShowcase;
