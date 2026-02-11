# Deploy Push-Server en Railway (Gratis)

Railway te da **$5 USD de créditos mensuales gratis**, suficiente para correr este servidor 24/7.

## Paso 1: Crear cuenta en Railway

1. Ir a [railway.app](https://railway.app)
2. Click en "Start Free" 
3. Registrarse con GitHub (recomendado - es más rápido)
4. Autorizar a Railway para acceder a tu GitHub

## Paso 2: Conectar tu repositorio

1. En Railway, click en "New Project"
2. Seleccionar "Deploy from GitHub repo"
3. Buscar y seleccionar tu repositorio `finance-project`
4. Autorizar si es necesario
5. Railway detectará automáticamente que tienes un `package.json`

## Paso 3: Configurar variables de entorno

1. En el dashboard de Railway, ir a la pestaña "Variables"
2. Agregar estos secrets (copiar de tu `.env` local):

| Variable | Valor |
|----------|-------|
| `FIREBASE_SERVICE_ACCOUNT` | El JSON completo de tu service account |
| `FIREBASE_DATABASE_URL` | `https://familia-finanzas-589f3-default-rtdb.firebaseio.com` |
| `VAPID_PUBLIC_KEY` | `BB9RjjY30mhm5LisTS_wAYL2kTxi3cv7IR0HRejyEyDqHfUFI7UoZ1JmmhUirpWHUKw6fbBJLBUp_a-RdnGuOSE` |
| `VAPID_PRIVATE_KEY` | `X4EEPyHTX714-tW4KH5QljRTURRV12Dwl5WAJ9fucqI` |
| `ALLOWED_ORIGINS` | `https://familia-finanzas-589f3.web.app` |
| `PORT` | `8080` |

## Paso 4: Especificar el directorio y comando

1. En Railway, ir a "Settings"
2. Root Directory: `push-server`
3. Start Command: `npm start` (o dejar en blanco, Railway lo detecta automáticamente)

## Paso 5: Deploy

Railway desplegará automáticamente cuando hagas push a `main`. 

Para desplegar manualmente:
1. En Railway, click en "Deploy"
2. Esperar a que termine (2-3 minutos)

## Paso 6: Obtener la URL pública

Una vez deployado:
1. En Railway, ir a "Deployments"
2. Buscar el URL público (algo como `https://push-server-production-xxxx.railway.app`)
3. Copiar ese URL

## Paso 7: Actualizar tu app

Ahora que tienes el URL del push-server, actualiza tu app:

1. En `.env` de la raíz:
```
VITE_PUSH_ENDPOINT=https://push-server-production-xxxx.railway.app
```

2. En GitHub Secrets, agrega:
```
VITE_PUSH_ENDPOINT=https://push-server-production-xxxx.railway.app
```

3. En `.github/workflows/firebase-hosting-merge.yml`, agrega en el `Build` step:
```yaml
VITE_PUSH_ENDPOINT: ${{ secrets.VITE_PUSH_ENDPOINT }}
```

## Verificar que funciona

Abre en el navegador:
```
https://push-server-production-xxxx.railway.app/health
```

Deberías ver:
```json
{ "ok": true }
```

Si ves eso, ¡está deployado! 🚀

## Monitorear logs

En Railway puedes ver los logs en tiempo real:
1. Click en tu proyecto
2. Pestaña "Deployments"
3. Click en el deployment actual
4. Ver logs en vivo

## Costos

- **Gratis**: $5 USD mensuales de créditos
- Este push-server: ~$2-3 USD mensuales
- Si tienes otras cosas: functions, hosting, etc., se sumará al total
