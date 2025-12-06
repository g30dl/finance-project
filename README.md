# finance-project
# 💰 Familia Finanzas

> App de gestión financiera familiar con React + Firebase

Una Progressive Web App (PWA) para gestionar las finanzas del hogar de manera eficiente, permitiendo el control de gastos, solicitudes de dinero con categorización, y seguimiento histórico de transacciones.

---

## 🎯 Características Principales

- ✅ **Gestión de Solicitudes**: Los miembros de la familia pueden solicitar dinero con monto, categoría y motivo
- ✅ **Aprobación/Rechazo**: Los administradores aprueban o rechazan solicitudes en tiempo real
- ✅ **Categorización de Gastos**: 10 categorías predefinidas para análisis detallado
- ✅ **Gastos Recurrentes**: Programación automática de pagos mensuales (luz, internet, etc.)
- ✅ **Reportes y Estadísticas**: Visualización de gastos por categoría, persona y periodo
- ✅ **Tiempo Real**: Sincronización instantánea entre todos los dispositivos
- ✅ **Funcionalidad Offline**: Sistema de cola para crear solicitudes sin internet
- ✅ **Notificaciones Push**: Alertas de nuevas solicitudes y aprobaciones
- ✅ **Exportar CSV**: Descarga de reportes para análisis externo
- ✅ **PWA**: Instalable en móviles y escritorio como app nativa

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Framework principal
- **Vite 5** - Build tool y dev server
- **Tailwind CSS 3** - Estilos y diseño responsive
- **Recharts 2** - Gráficos interactivos
- **Lucide React** - Iconos modernos
- **React Hook Form 7** - Manejo de formularios
- **date-fns 3** - Manejo de fechas

### Backend & Servicios
- **Firebase Realtime Database** - Base de datos en tiempo real
- **Firebase Authentication** - Sistema de autenticación
- **Firebase Cloud Functions** - Ejecución de gastos recurrentes (cron jobs)
- **Firebase Cloud Messaging** - Notificaciones push
- **Firebase Hosting** - Hosting de la PWA

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ y npm
- Cuenta de Firebase
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/familia-finanzas.git
cd familia-finanzas
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita los siguientes servicios:
   - Realtime Database
   - Authentication (Anonymous + Email/Password)
   - Cloud Messaging
   - Hosting

3. Copia tus credenciales de Firebase

4. Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://tu_proyecto-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 4. Importar estructura de base de datos

Importa el archivo `firebase-database-structure.json` en tu Realtime Database desde Firebase Console.

### 5. Configurar Security Rules

Copia las reglas del archivo `firebase-security-rules.json` en la pestaña "Rules" de tu Realtime Database.

---

## 💻 Desarrollo

### Ejecutar en modo desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`

### Build para producción

```bash
npm run build
```

Los archivos optimizados estarán en `/dist`

### Preview del build

```bash
npm run preview
```

---

## 🚀 Deploy

### Deploy a Firebase Hosting

```bash
# 1. Instalar Firebase CLI (primera vez)
npm install -g firebase-tools

# 2. Login en Firebase
firebase login

# 3. Inicializar Firebase en el proyecto (primera vez)
firebase init hosting

# 4. Build y deploy
npm run build
firebase deploy
```

Tu app estará disponible en: `https://tu-proyecto.web.app`

---

## 👥 Usuarios y Roles

### Tipos de Usuarios

1. **Solicitantes (3 usuarios)**
   - Pueden solicitar dinero
   - Ver sus propias solicitudes
   - Consultar saldo disponible
   - Acceso sin contraseña (autenticación simplificada)

2. **Administradores (2 usuarios)**
   - Aprobar/rechazar solicitudes
   - Agregar gastos directos
   - Registrar depósitos
   - Programar gastos recurrentes
   - Ver reportes completos
   - Exportar datos a CSV
   - Acceso con PIN de 6 dígitos

---

## 📁 Estructura del Proyecto

```
familia-finanzas/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Service worker para offline
│   └── icons/                 # Iconos de la app
├── src/
│   ├── components/            # Componentes React
│   │   ├── common/           # Componentes reutilizables
│   │   ├── dashboard/        # Dashboards
│   │   ├── solicitudes/      # Gestión de solicitudes
│   │   └── reportes/         # Reportes y gráficos
│   ├── contexts/             # React Contexts
│   │   ├── AuthContext.jsx   # Contexto de autenticación
│   │   └── DataContext.jsx   # Contexto de datos Firebase
│   ├── hooks/                # Custom hooks
│   │   ├── useAuth.js        # Hook de autenticación
│   │   ├── useFirebase.js    # Hook de Firebase
│   │   └── useOffline.js     # Hook de funcionalidad offline
│   ├── services/             # Servicios
│   │   ├── firebase.js       # Configuración Firebase
│   │   ├── database.js       # Operaciones de base de datos
│   │   └── notifications.js  # Notificaciones push
│   ├── utils/                # Utilidades
│   │   ├── helpers.js        # Funciones auxiliares
│   │   ├── constants.js      # Constantes
│   │   └── validators.js     # Validadores
│   ├── styles/               # Estilos globales
│   ├── App.jsx               # Componente principal
│   └── main.jsx              # Punto de entrada
├── .env.local                # Variables de entorno (NO subir a Git)
├── .gitignore                # Archivos ignorados por Git
├── firebase.json             # Configuración Firebase
├── package.json              # Dependencias del proyecto
├── vite.config.js            # Configuración Vite
└── tailwind.config.js        # Configuración Tailwind
```

---

## 📊 Categorías de Gastos

1. 🛒 **Comida/Mercado** - Supermercado, frutas, verduras
2. 💡 **Servicios** - Luz, agua, internet, gas
3. 🚗 **Transporte** - Gasolina, Uber, taxi
4. 🏥 **Salud** - Medicinas, consultas médicas
5. 📚 **Educación** - Útiles escolares, libros, cursos
6. 🏠 **Hogar** - Reparaciones, mantenimiento
7. 👕 **Ropa** - Vestimenta, calzado
8. 🎬 **Entretenimiento** - Cine, restaurantes, salidas
9. 💻 **Tecnología** - Electrónicos, apps, software
10. 📦 **Otros** - Gastos varios

---

## 🔒 Seguridad

- ✅ Firebase Security Rules configuradas
- ✅ Autenticación requerida para todas las operaciones
- ✅ Validación de permisos por rol
- ✅ Tokens JWT seguros
- ✅ HTTPS obligatorio
- ✅ Variables de entorno para credenciales
- ✅ Repositorio privado

---

## 📱 Funcionalidad Offline

La app permite crear solicitudes sin conexión a internet:

1. Las solicitudes se guardan en cola local (IndexedDB)
2. Se muestran con estado "En cola"
3. Al recuperar conexión, se envían automáticamente
4. El usuario recibe confirmación cuando se envían

**Limitaciones offline:**
- ❌ No se pueden aprobar/rechazar solicitudes (solo administradores)
- ❌ No se actualizan datos en tiempo real
- ✅ Se puede consultar historial previamente cargado

---

## 🎯 Roadmap

### ✅ Fase 1: MVP (Completada)
- [x] Sistema de autenticación
- [x] Solicitudes de dinero
- [x] Aprobación/rechazo
- [x] Categorización de gastos
- [x] Historial básico

### 🔄 Fase 2: Funcionalidades Avanzadas (En desarrollo)
- [ ] Gastos recurrentes automáticos
- [ ] Sistema de cola offline
- [ ] Reportes con gráficos
- [ ] Filtros avanzados
- [ ] Notificaciones internas

### 📅 Fase 3: Optimización (Próximamente)
- [ ] Notificaciones push del navegador
- [ ] Exportar CSV
- [ ] Comparativas mensuales
- [ ] Insights automáticos
- [ ] Dark mode

### 🚀 Fase 4: Futuro
- [ ] Presupuestos por categoría
- [ ] ML para detectar gastos inusuales
- [ ] Storage para fotos de recibos
- [ ] Multi-idioma

---

## 🤝 Contribución

Este es un proyecto personal/familiar, pero las sugerencias son bienvenidas:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing Feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📞 Contacto

**Proyecto creado para uso familiar**

Si tienes preguntas o sugerencias, no dudes en abrir un issue en GitHub.

---

## 🙏 Agradecimientos

- Firebase por su plataforma gratuita y robusta
- React y Vite por hacer el desarrollo web moderno más accesible
- Tailwind CSS por facilitar el diseño responsive
- La comunidad open source por sus increíbles herramientas

---

## 📸 Screenshots

> Próximamente: Capturas de pantalla de la aplicación en funcionamiento

---

**Desarrollado con ❤️ para mejorar la gestión financiera familiar**