# 🏘️ Vecino Activo - Plataforma de Comunidades Vecinales

![React](https://img.shields.io/badge/React-18.x-blue)
![Redux](https://img.shields.io/badge/Redux-Toolkit-purple)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange)
![Status](https://img.shields.io/badge/Status-Producción-success)

Plataforma completa para gestión de comunidades vecinales (Unidades Vecinales) con red social integrada, panel administrativo, sistema de tickets, campañas de comunicación y más.

**Sitio en producción:** https://vecinoactivo.cl/

---

## ✨ Características Principales

### 🏛️ Panel Administrativo (Admin Dashboard)
- ✅ Dashboard con métricas en tiempo real
- ✅ Gestión de Tickets (soporte vecinal)
- ✅ Campañas de Comunicación (Email, WhatsApp, Push)
- ✅ Gestión de Usuarios y Vecinos
- ✅ Analíticas y Reportes
- ✅ Gestión de Emergencias
- ✅ Sistema de Roles y Permisos
- ✅ Selector de Unidad Vecinal (múltiples UVs)
- ✅ Configuración personalizada por UV

### 🏘️ Sistema de Unidades Vecinales (UVs)
- ✅ Múltiples UVs por administrador
- ✅ Roles: super_admin, uv_admin, delegate, moderator
- ✅ Permisos granulares por rol
- ✅ Estadísticas por UV
- ✅ Configuración independiente por UV
- ✅ Mapa interactivo con polígonos geográficos

### 🔐 Autenticación y Usuarios
- ✅ Registro de usuarios con validación
- ✅ Login dual (usuarios y administradores)
- ✅ Recuperación de contraseña
- ✅ Sesión persistente con Supabase Auth
- ✅ Verificación de email
- ✅ Perfiles de usuario completos

### 📝 Red Social
- ✅ Publicaciones con texto, imágenes y videos
- ✅ 6 tipos de reacciones (Like, Love, Haha, Wow, Sad, Angry)
- ✅ Sistema de comentarios anidados
- ✅ Compartir publicaciones
- ✅ Feed de actividad en tiempo real
- ✅ Carrusel de fotos en posts

### 💬 Mensajería
- ✅ Chat 1 a 1 en tiempo real (Firebase)
- ✅ Conversaciones persistentes (Supabase)
- ✅ Notificaciones de mensajes
- ✅ Marcar como leído
- ✅ Historial completo

### 🎫 Sistema de Tickets
- ✅ Crear tickets de soporte
- ✅ Categorías (seguridad, infraestructura, ruido, etc.)
- ✅ Prioridades (baja, media, alta, urgente)
- ✅ Estados (pendiente, en progreso, resuelto)
- ✅ Asignación a administradores
- ✅ Comentarios y seguimiento
- ✅ Estadísticas y métricas

### 📢 Campañas de Comunicación
- ✅ Crear campañas multicanal
- ✅ Canales: Email, WhatsApp, Push Notifications
- ✅ Programación de envíos
- ✅ Segmentación de audiencia
- ✅ Plantillas personalizables
- ✅ Estadísticas de envío
- ✅ Borradores y revisión

### 🚨 Sistema de Emergencias
- ✅ Botón de emergencia visible
- ✅ Captura de fotos/videos
- ✅ Geolocalización automática
- ✅ Notificación inmediata a administradores
- ✅ Panel de gestión de emergencias
- ✅ Estados y seguimiento

### 📅 Eventos
- ✅ Crear eventos comunitarios
- ✅ RSVP (Asistiré/Me interesa)
- ✅ Categorías de eventos
- ✅ Calendario integrado
- ✅ Imágenes de eventos

### 👥 Amigos y Comunidad
- ✅ Solicitudes de amistad
- ✅ Descubrir vecinos cercanos
- ✅ Directorio de vecinos
- ✅ Perfiles públicos

### 🖼️ Gestión de Fotos
- ✅ Subida de imágenes optimizada
- ✅ Compresión automática
- ✅ Storage en Supabase
- ✅ Galerías de fotos
- ✅ Foto de perfil y portada

### 🔔 Notificaciones
- ✅ Notificaciones en tiempo real (Firebase)
- ✅ Push notifications (FCM)
- ✅ Notificaciones en app
- ✅ Centro de notificaciones
- ✅ Marcar como leída

### 🗺️ Mapa Interactivo
- ✅ Mapa de Unidades Vecinales
- ✅ Polígonos geográficos (GeoJSON)
- ✅ Información demográfica
- ✅ Lazy loading optimizado
- ✅ Interactividad completa

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase
- Cuenta de Firebase (opcional, para realtime)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/vecino-activo.git
cd vecino-activo

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

### Configuración de Variables de Entorno

```env
# Supabase
REACT_APP_SUPABASE_URL=tu_supabase_url
REACT_APP_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Firebase (opcional)
REACT_APP_FIREBASE_API_KEY=tu_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=tu_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=tu_firebase_app_id
REACT_APP_FIREBASE_VAPID_KEY=tu_firebase_vapid_key
```

### Ejecutar en Desarrollo

```bash
npm start
```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000)

### Build para Producción

```bash
npm run build
```

---

## 📁 Estructura del Proyecto

```
vecino-activo/
├── public/
│   ├── data/geo/              # Datos geográficos (GeoJSON)
│   ├── firebase-messaging-sw.js
│   └── index.html
├── src/
│   ├── components/            # 100+ componentes
│   │   ├── AdminDashboard/    # Componentes del admin
│   │   ├── EmergencyButton/   # Sistema de emergencias
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Post/
│   │   ├── CreatePostModal/
│   │   └── ...
│   ├── pages/                 # Páginas principales
│   │   ├── AdminDashboard/    # Panel administrativo
│   │   │   ├── DashboardOverview.js
│   │   │   ├── TicketsManagement.js
│   │   │   ├── CampaignsManagement.js
│   │   │   ├── UsersManagement.js
│   │   │   ├── Analytics.js
│   │   │   ├── EmergencyManagement.js
│   │   │   └── SettingsPage.js
│   │   ├── Home.js
│   │   ├── Timeline.js
│   │   ├── DirectMessages.js
│   │   ├── AdminLogin.js
│   │   └── ...
│   ├── store/                 # Redux Toolkit
│   │   ├── slices/
│   │   │   ├── adminDashboardSlice.js
│   │   │   ├── ticketsSlice.js
│   │   │   ├── campaignsSlice.js
│   │   │   ├── emergencySlice.js
│   │   │   ├── authSlice.js
│   │   │   ├── postsSlice.js
│   │   │   └── ...
│   │   └── store.js
│   ├── services/              # Servicios de backend
│   │   ├── supabaseAdminService.js
│   │   ├── supabaseTicketsService.js
│   │   ├── supabaseCampaignsService.js
│   │   ├── emergencyService.js
│   │   ├── supabasePostsService.js
│   │   ├── firebaseMessagesService.js
│   │   └── ...
│   ├── hooks/                 # Hooks personalizados
│   │   ├── useReduxAdmin.js
│   │   ├── useReduxTickets.js
│   │   ├── useReduxCampaigns.js
│   │   ├── useReduxAuth.js
│   │   └── ...
│   ├── config/
│   │   ├── supabase.js
│   │   └── firebase.js
│   ├── utils/
│   └── App.js
├── database/                  # Scripts SQL
│   ├── admin/
│   ├── migrations/
│   ├── reactions/
│   ├── photos/
│   └── setup/
├── scripts/                   # Scripts de utilidad
│   ├── testing/
│   ├── debugging/
│   ├── deployment/
│   └── utilities/
├── server/                    # Backend Node.js
│   ├── campaignServer.js
│   └── whatsappServer.js
├── docs/                      # Documentación
└── package.json
```

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Framework principal
- **Redux Toolkit** - Gestión de estado global
- **React Router DOM** - Navegación
- **Material UI Icons** - Iconografía
- **Leaflet** - Mapas interactivos
- **SweetAlert2** - Alertas y notificaciones

### Backend
- **Supabase** - Base de datos PostgreSQL, Auth, Storage
- **Firebase** - Realtime (Firestore), Push Notifications (FCM)
- **Node.js/Express** - Servidor para campañas

### Base de Datos
- **PostgreSQL** (Supabase) - Datos principales
- **Firestore** (Firebase) - Datos en tiempo real

---

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### Usuarios y Autenticación
- `users` - Usuarios de la plataforma
- `admin_roles` - Roles administrativos
- `neighborhoods` - Unidades Vecinales

#### Red Social
- `posts` - Publicaciones
- `post_reactions` - Reacciones a posts
- `comments` - Comentarios
- `messages` - Mensajes privados
- `conversations` - Conversaciones
- `notifications` - Notificaciones

#### Sistema Administrativo
- `tickets` - Tickets de soporte
- `ticket_comments` - Comentarios en tickets
- `communication_campaigns` - Campañas de comunicación
- `emergency_alerts` - Alertas de emergencia
- `dashboard_config` - Configuración del dashboard

#### Comunidad
- `events` - Eventos comunitarios
- `friends` - Relaciones de amistad
- `groups` - Grupos comunitarios

#### Storage
- `photos` - Fotos subidas
- Buckets de Supabase Storage para archivos

---

## 👤 Usuarios de Prueba

### Usuario Regular
```
Email: usuario@test.com
Password: 123456
```

### Administrador
```
Email: admin@test.com
Password: admin123
```

---

## 📖 Documentación

### Documentación Principal
- **[ANALISIS_PROFUNDO_UNIDAD_VECINAL.md](ANALISIS_PROFUNDO_UNIDAD_VECINAL.md)** - Sistema de UVs
- **[PLAN_ACCION_UNIDAD_VECINAL.md](PLAN_ACCION_UNIDAD_VECINAL.md)** - Plan de implementación
- **[ESTADO_SISTEMA_COMPLETO.md](ESTADO_SISTEMA_COMPLETO.md)** - Estado actual del sistema

### Sistemas Implementados
- **[SISTEMA_AUTENTICACION_CONFIGURADO.md](SISTEMA_AUTENTICACION_CONFIGURADO.md)** - Autenticación
- **[SISTEMA_ENVIO_CAMPANAS_IMPLEMENTADO.md](SISTEMA_ENVIO_CAMPANAS_IMPLEMENTADO.md)** - Campañas
- **[SISTEMA_FOTOS_COMPLETADO.md](SISTEMA_FOTOS_COMPLETADO.md)** - Gestión de fotos
- **[SISTEMA_MENSAJES_TIEMPO_REAL.md](SISTEMA_MENSAJES_TIEMPO_REAL.md)** - Mensajería
- **[SISTEMA_REACCIONES_IMPLEMENTADO.md](SISTEMA_REACCIONES_IMPLEMENTADO.md)** - Reacciones

### Configuración
- **[CONFIGURACION_FIREBASE_COMPLETA.md](CONFIGURACION_FIREBASE_COMPLETA.md)** - Firebase
- **[GUIA_CONFIGURACION_FIREBASE_PASO_A_PASO.md](GUIA_CONFIGURACION_FIREBASE_PASO_A_PASO.md)** - Guía Firebase
- **[INSTRUCCIONES_CREAR_USUARIOS_PRUEBA.md](INSTRUCCIONES_CREAR_USUARIOS_PRUEBA.md)** - Usuarios de prueba

---

## 🎯 Funcionalidades por Módulo

### Panel Administrativo
- Dashboard con métricas en tiempo real
- Gestión completa de tickets
- Creación y envío de campañas
- Gestión de usuarios y vecinos
- Analíticas y reportes
- Gestión de emergencias
- Configuración personalizada

### Red Social
- Feed de publicaciones
- Crear posts con multimedia
- Reacciones y comentarios
- Compartir contenido
- Mensajería privada
- Notificaciones en tiempo real

### Comunidad
- Eventos comunitarios
- Directorio de vecinos
- Grupos y discusiones
- Mapa interactivo de UVs

---

## 📊 Métricas del Proyecto

- **Páginas:** 30+
- **Componentes:** 100+
- **Redux Slices:** 31
- **Servicios:** 33
- **Hooks Personalizados:** 21
- **Líneas de código:** ~50,000+
- **Funcionalidad:** 100% ✅
- **Idioma:** 100% Español ✅
- **Base de datos:** PostgreSQL (Supabase) ✅
- **Realtime:** Firebase Firestore ✅

---

## 🔮 Roadmap

### En Desarrollo
- [ ] Selector de UV en AdminHeader (ver PLAN_ACCION_UNIDAD_VECINAL.md)
- [ ] Inicialización automática de UVs
- [ ] Estado vacío cuando no hay UV seleccionada

### Próximas Funcionalidades
- [ ] App móvil (React Native)
- [ ] Videollamadas
- [ ] Marketplace vecinal
- [ ] Sistema de votaciones
- [ ] Integración con servicios municipales

---

## 🐛 Solución de Problemas

### La aplicación no carga
1. Verifica variables de entorno en `.env`
2. Verifica conexión a Supabase
3. Revisa la consola del navegador (F12)

### Error de autenticación
1. Verifica credenciales de Supabase
2. Verifica que RLS esté configurado correctamente
3. Revisa logs en Supabase Dashboard

### Problemas con Firebase
1. Verifica credenciales de Firebase
2. Verifica que Firestore esté habilitado
3. Revisa reglas de seguridad de Firestore

---

## 📝 Licencia

Este proyecto es privado y propietario.

---

## 👨‍💻 Desarrollo

**Stack:** React, Redux Toolkit, Supabase, Firebase, Node.js

**Estado:** ✅ EN PRODUCCIÓN

**Sitio:** https://vecinoactivo.cl/

**Última actualización:** Enero 2026

---

## 📧 Contacto

Para soporte o consultas, revisa la documentación completa en la carpeta `docs/`.

---

**¡Transforma tu comunidad con Vecino Activo!** 🏘️🚀
