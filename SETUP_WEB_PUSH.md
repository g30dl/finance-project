# Setup de Web Push - Guía Rápida

## 1. Generar claves VAPID (Una sola vez)

Las claves VAPID son necesarias para que Web Push Function. Solo las generas una vez y las reutilizas siempre.

### Opción A: Con npm (recomendado)
```bash
# Instalar web-push globalmente
npm install -g web-push

# Generar claves
web-push generate-vapid-keys

# Output ejemplo:
# Public Key: BG_yXFq8sdfasdfasdfasdfasdfsad...
# Private Key: a-b2Tsd_as_asdasdfadsfasdfasdf...
```

### Opción B: Online
Si no quieres instalar npm, puedes usar:
https://web-push-codelab.glitch.me/

## 2. Guardar las claves

### Opción A: En archivo .env del servidor (para desarrollo local)
```bash
# Crear archivo push-server/.env
VAPID_PUBLIC_KEY=BG_yXFq8sdfasdfasdfasdfasdfsad...
VAPID_PRIVATE_KEY=a-b2Tsd_as_asdasdfadsfasdfasdf...
```

### Opción B: En Railway (para producción)
1. Ir a tu proyecto en Railway
2. Variables → Agregar variables
3. Copiar y pegar las claves en `VAPID_PUBLIC_KEY` y `VAPID_PRIVATE_KEY`

## 3. Estructura de carpetas

```
finance-project/
├── .env                           # Variables locales (git ignored)
├── .env.example                   # Ejemplo de variables
├── public/
│   ├── web-push-sw.js            # Service Worker (nuevo)
│   ├── notification-sound.mp3     # Tu archivo de sonido (crea link con tu archivo)
│   └── ...
├── src/
│   ├── services/
│   │   ├── webPush.js             # Servicio Web Push (nuevo)
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.jsx        # Actualizado con push
│   └── ...
└── push-server/
    ├── index.js                   # servidor push (actualizado)
    ├── package.json               # dependencias (actualizado)
    ├── README.md                  # documentación
    ├── DEPLOYMENT.md              # Guía Railway
    └── .env                       # Variables servidor (git ignored)
```

## 4. Variables de Entorno Necesarias

### Para el Frontend (archivo `.env` raíz)

```env
# Firebase - obtén estos de Firebase Console
VITE_FIREBASE_API_KEY=AIzaSyD...
VITE_FIREBASE_AUTH_DOMAIN=tuproyecto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://tuproyecto.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=tuproyecto
VITE_FIREBASE_STORAGE_BUCKET=tuproyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123DEF

# Web Push - URL del servidor push
VITE_PUSH_ENDPOINT=http://localhost:8080

# Admin
VITE_ADMIN_EMAILS=admin@example.com,otro@example.com
```

### Para el Backend (archivo `push-server/.env`)

```env
# Firebase Service Account - descarga desde Firebase Console
# Ir a: Project Settings → Service Accounts → Generate new private key
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
FIREBASE_DATABASE_URL=https://tuproyecto.firebasedatabase.app

# VAPID Keys - generar con web-push generate-vapid-keys
VAPID_PUBLIC_KEY=BG_yXFq8sdfasdfasdfasdfasdfsad...
VAPID_PRIVATE_KEY=a-b2Tsd_as_asdasdfadsfasdfasdf...

# Otros
ALLOWED_ORIGINS=http://localhost:5173,https://tuapp.com
PORT=8080
```

## 5. Obtener Firebase Service Account

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Seleccionar tu proyecto
3. Ir a ⚙️ Project Settings
4. Pestaña "Service Accounts"
5. Click en "Generate New Private Key"
6. Se descargará un JSON
7. Copiar el contenido completo en UNA SOLA LÍNEA sin saltos

Ejemplo:
```
{"type":"service_account","project_id":"tuproyecto","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvAIBA...","client_email":"firebase-adminsdk@tuproyecto.iam.gserviceaccount.com",...}
```

## 6. Archivo de sonido de notificación

El servicio worker reproducirá `/notification-sound.mp3` cuando llegue una notificación.

Opciones:
1. **Usar sonido por defecto del SO**: Modificar `web-push-sw.js` para no reproducir sonido personalizado
2. **Agregar tu propio sonido**:
   - Obtener un archivo MP3 (máximo 500KB recomendado)
   - Ponerlo en `public/notification-sound.mp3`
   - Asegurarse que tenga ese exacto nombre y ubicación

Si no existe el archivo, el servicio worker lanza una advertencia pero las notificaciones funcionan igual (sin sonido).

## 7. Instalar dependencias del servidor push

```bash
cd push-server
npm install
```

## 8. Prueba local

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Push server
cd push-server
npm start
```

Acceder a: http://localhost:5173

El servidor push estará en: http://localhost:8080

## 9. Checklist antes de producción

- [ ] Generar y guardar claves VAPID
- [ ] Obtener Firebase Service Account JSON
- [ ] Configurar variables de entorno en Railway
- [ ] Actualizar VITE_PUSH_ENDPOINT con URL de Railway
- [ ] Agregar archivo notification-sound.mp3 (opcional)
- [ ] Permitir orígenes en ALLOWED_ORIGINS (tu dominio)
- [ ] Probar en navegador: dar permiso de notificaciones
- [ ] Probar en navegador: cerrar app y enviar notificación
- [ ] Verificar que el sonido se reproduce

## Referencia rápida

| Cosa | Dónde obtener |
|------|--|
| Claves VAPID | Ejecutar `web-push generate-vapid-keys` |
| Firebase config | Firebase Console → Project Settings |
| Service Account | Firebase Console → Project Settings → Service Accounts |
| Database URL | Firebase Console → Realtime Database |
