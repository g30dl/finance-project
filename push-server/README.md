# Push server (Web Push API - Sin Blaze)

Servidor externo para enviar notificaciones push usando Web Push Protocol (sin Firebase Cloud Messaging).

## Requisitos
- Node.js 18+
- Una cuenta de servicio de Firebase (service account JSON)
- Claves VAPID (generar con `web-push generate-vapid-keys`)

## Variables de entorno
- `FIREBASE_SERVICE_ACCOUNT` = JSON completo de service account en una sola línea.
- `FIREBASE_DATABASE_URL` = URL de Realtime Database.
- `VAPID_PUBLIC_KEY` = Clave pública VAPID.
- `VAPID_PRIVATE_KEY` = Clave privada VAPID.
- `ALLOWED_ORIGINS` = Lista separada por comas de orígenes permitidos (opcional).
- `PORT` = Puerto del servidor (opcional, por defecto 8080).

Ejemplo `FIREBASE_SERVICE_ACCOUNT`:
```
{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

## Endpoints

### GET `/health`
Verifica que el servidor está corriendo.

**Response:**
```json
{ "ok": true }
```

### GET `/public-key`
Obtiene la clave VAPID pública para que el cliente se suscriba.

**Response:**
```json
{ "publicKey": "BG_y..." }
```

### POST `/subscribe`
Registra una nueva suscripción de push para el usuario autenticado.

**Headers:**
- `Authorization: Bearer <Firebase ID Token>`

**Body:**
```json
{
  "endpoint": "https://...",
  "keys": {
    "auth": "...",
    "p256dh": "..."
  }
}
```

**Response:**
```json
{ "success": true }
```

### POST `/unsubscribe`
Desuscribe un usuario de push notifications.

**Headers:**
- `Authorization: Bearer <Firebase ID Token>`

**Body:**
```json
{
  "endpoint": "https://..."
}
```

**Response:**
```json
{ "success": true }
```

### POST `/send-notification`
Envía una notificación push a usuarios especificados.

**Headers:**
- `Authorization: Bearer <Firebase ID Token>`

**Body:**
```json
{ "notificationId": "notif_123456789" }
```

**Response:**
```json
{
  "success": true,
  "sent": 5,
  "failed": 0
}
```

## Notas

- Este servidor debe estar desplegado en un hosting que soporte Node.js
- No requiere plan Blaze de Firebase
- Las suscripciones se guardan en Realtime Database bajo `familia_finanzas/push_subscriptions/{userId}`
- Los mensajes de notificación se guardan en `familia_finanzas/notificaciones`

