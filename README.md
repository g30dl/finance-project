# Familia Finanzas

Aplicacion web progresiva (PWA) para gestionar las finanzas del hogar. Permite registrar solicitudes de dinero, aprobarlas, categorizar gastos, ver historiales y operar en tiempo real con Firebase.

## Tabla de contenidos

- Descripcion general
- Funcionalidades
- Stack tecnologico
- Estructura del proyecto
- Requisitos
- Configuracion de Firebase
- Variables de entorno
- Desarrollo local
- Build y preview
- Tests
- Scripts utiles
- Deploy
- Roles y acceso admin
- PWA y funcionamiento offline
- Notificaciones push
- Seguridad
- Licencia

## Descripcion general

La app esta pensada para uso familiar. Existen dos tipos de usuarios:

- Solicitantes: crean solicitudes de dinero y consultan sus movimientos.
- Administradores: aprueban o rechazan solicitudes, registran gastos y depositos, configuran gastos recurrentes y consultan reportes.

## Funcionalidades

- Solicitudes de dinero con monto, categoria y motivo.
- Aprobacion o rechazo en tiempo real.
- Categorizacion de gastos con categorias predefinidas.
- Gastos recurrentes programados.
- Reportes y estadisticas por periodo, categoria y persona.
- Sincronizacion en tiempo real.
- Modo offline con cola local.
- Exportacion a CSV.
- PWA instalable en movil y escritorio.

## Stack tecnologico

- React 18
- Vite 5
- Tailwind CSS 3
- Recharts 2
- Zod
- Sonner
- Firebase Realtime Database
- Firebase Authentication
- Firebase Cloud Functions
- Firebase Cloud Messaging
- Firebase Hosting

## Estructura del proyecto

```
.
|-- .github/                   Workflows de GitHub Actions
|-- .firebase/                 Metadatos locales del CLI de Firebase
|-- dist/                      Build de produccion (salida de Vite)
|-- dev-dist/                  Assets de service worker en desarrollo
|-- functions/                 Cloud Functions de Firebase
|-- public/                    Assets estaticos (manifest, icons, sw de messaging)
|-- scripts/                   Scripts auxiliares
|-- src/                       Codigo fuente de la app
|-- .env.example               Plantilla de variables de entorno
|-- .firebaserc                Configuracion del proyecto de Firebase
|-- firebase.json              Configuracion de Firebase Hosting/Database
|-- index.html                 HTML base de Vite
|-- package.json               Scripts y dependencias
`-- vite.config.js             Configuracion de Vite
```

## Requisitos

- Node.js 18+
- npm
- Cuenta de Firebase

## Configuracion de Firebase

En Firebase Console, crea un proyecto y habilita:

- Realtime Database
- Authentication (Email/Password y Google)
- Cloud Messaging (si usas notificaciones)
- Hosting
- Functions

Recomendado:

- Agregar dominios autorizados en Authentication > Settings > Authorized domains

## Variables de entorno

Crea un archivo `.env.local` en la raiz, basado en `.env.example`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_ADMIN_EMAILS=correo1@dominio.com,correo2@dominio.com
```

Nota:
- `VITE_ADMIN_EMAILS` controla el acceso admin en el frontend.
- `VITE_FIREBASE_MEASUREMENT_ID` es opcional y habilita Analytics si esta configurado.

## Desarrollo local

```
npm install
npm run dev
```

## Build y preview

```
npm run build
npm run preview
```

La salida queda en `dist/`.

## Tests

```
npm run test
npm run test:coverage
```

## Scripts utiles

```
npm run build:analyze
npm run optimize:images
npm run audit
```

## Deploy

### Manual (Firebase CLI)

```
npm run build
firebase deploy
```

### Automatico (GitHub Actions)

El repo incluye workflows para:

- Deploy en `main`
- Preview en Pull Requests

Requisitos en GitHub:

- Configurar el secreto `FIREBASE_SERVICE_ACCOUNT_FAMILIA_FINANZAS_589F3` con el JSON del service account.

## Roles y acceso admin

El acceso admin usa:

- `VITE_ADMIN_EMAILS` para permitir cuentas.
- Custom claims en Firebase Auth (set desde Functions).

Flujo resumido:

1. El admin inicia sesion (Google o email/password).
2. Se valida contra la whitelist de emails.
3. Se sincroniza el custom claim `role=admin`.
4. Se redirige al dashboard admin.

Si el admin no tiene claim, se puede ejecutar la funcion `syncMyRole`.

## PWA y funcionamiento offline

La app es instalable y soporta modo offline:

- Las solicitudes se guardan en una cola local.
- Cuando vuelve la conexion, se sincronizan.
- Los datos en tiempo real no se actualizan mientras no haya conexion.

## Notificaciones push

Para habilitar FCM en el service worker:

1. Copia `public/firebase-messaging-config.example.js` a `public/firebase-messaging-config.js`.
2. Completa la configuracion de Firebase.
3. No subas este archivo al repo (esta en `.gitignore`).

## Seguridad

No versionar:

- `.env.local` y cualquier `.env.*` con valores reales.
- Service accounts de Firebase (`*firebase-adminsdk*.json`, `serviceAccount*.json`).
- Certificados privados (`*.pem`, `*.key`, `*.p12`).

Recomendado:

- Revisar reglas de Realtime Database.
- Rotar claves si alguna se subio por error.

## Licencia

MIT. Ver `LICENSE`.
