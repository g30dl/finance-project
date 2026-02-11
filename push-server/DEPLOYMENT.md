# Guía de Deployment - Push Server en Railway

Esta guía te ayudará a desplegar el servidor push en **Railway**, que ofrece un tier gratuito con créditos mensuales suficientes para ejecutar este servidor.

## Pasos para Deploy

### 1. Preparar el servidor push

Asegúrate de que el directorio `/push-server` tiene:
- `index.js` (el servidor)
- `package.json` (con las dependencias)
- `README.md` (documentación)

### 2. Crear cuenta en Railway

1. Ir a [Railway.app](https://railway.app)
2. Registrarse con GitHub, Google o email
3. Crear un nuevo proyecto

### 3. Conectar Git Repository

1. En Railway, seleccionar "Deploy from GitHub"
2. Conectar tu repositorio de GitHub
3. Seleccionar la rama `main` (o la que uses)

### 4. Configurar variables de entorno

En el dashboard de Railway:

1. Ir a la pestaña "Variables"
2. Agregar todas las variables requeridas:
   - `FIREBASE_SERVICE_ACCOUNT` - Tu JSON de servicio (en una línea)
   - `FIREBASE_DATABASE_URL` - URL de Realtime Database
   - `VAPID_PUBLIC_KEY` - Clave VAPID pública
   - `VAPID_PRIVATE_KEY` - Clave VAPID privada
   - `ALLOWED_ORIGINS` - Orígenes permitidos (separados por comas)
   - `PORT` - 8080 (o el puerto que prefieras)

### 5. Especificar comando de inicio

Railway detectará automáticamente `package.json`, pero si necesitas especificar el comando:

En el archivo `package.json` asegúrate de tener:
```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

### 6. Deploy automático

Una vez configurado, Railway desplegará automáticamente cada vez que hagas push a la rama principal.

## Post-Deploy

Una vez desplegado en Railway:

1. **Obtener URL del servidor**: Railway te dará una URL pública como `https://proxyserver-production-xxxx.railway.app`

2. **Actualizar variable de entorno en tu app**:
   - En tu aplicación frontend, actualizar `VITE_PUSH_ENDPOINT` con la URL de Railway
   - Ejemplo: `VITE_PUSH_ENDPOINT=https://proxyserver-production-xxxx.railway.app`

3. **Verificar que funciona**:
   - Hacer un GET a `https://tu-railroad.railway.app/health`
   - Debería responder con `{ "ok": true }`

## Costos

Railway ofrece:
- **$5 USD de crédito gratuito por mes**
- Este servidor push usa aproximadamente $2-3 USD mensuales
- Suficiente para uso pequeño/medio

Si usas más de los créditos gratuitos, Railway te notificará antes de cobrar.

## Alternativas a Railway

### Render (render.com)
- Tier gratuito limitado (reinicia después de 15 minutos de inactividad)
- Mejor para desarrollo, no recomendado para producción

### Heroku (heroku.com)
- Ya no tiene tier gratuito
- Ahora requiere plan de pago

### Vercel con API Routes
- Puedes adaptar el código como API Routes de Vercel
- Tier gratuito generoso

## Troubleshooting

### Error: "VAPID keys not found"
- Verificar que las variables de entorno estén configuradas correctamente
- Las claves VAPID no deben tener comillas adicionales

### Error: "Database connection failed"
- Verificar que `FIREBASE_DATABASE_URL` sea correcta
- Asegurarse de que el servicio account tiene permisos en Realtime Database

### Las notificaciones no llegan
- Verificar que `VITE_PUSH_ENDPOINT` en el frontend apunta a la URL correcta de Railway
- Verificar permisos CORS en `ALLOWED_ORIGINS`

## Monitoreo

Para ver logs en tiempo real:
1. En Railway dashboard, seleccionar el servicio
2. Ir a Deployments
3. Ver logs en tiempo real

## Actualizar el servidor

Para actualizar el servidor:
1. Hacer cambios en `/push-server/index.js`
2. Hacer commit y push a GitHub
3. Railway desplegará automáticamente

No necesitas hacer nada manualmente.
