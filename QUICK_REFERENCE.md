# ⚡ REFERENCIA RÁPIDA - Vecino Activo

**Última actualización:** 28 de enero de 2026

---

## 🚀 COMANDOS PRINCIPALES

### Desarrollo
```bash
npm start                    # Iniciar en desarrollo (http://localhost:3000)
npm run build               # Build para producción
npm test                    # Ejecutar tests
npm run eject               # Eject de Create React App (irreversible)
```

### Base de Datos (Supabase)
```bash
# Ejecutar migraciones
psql -h tu_supabase_host -U postgres -d postgres -f database/migrations/ARCHIVO.sql

# Crear usuarios de prueba
psql -h tu_supabase_host -U postgres -d postgres -f database/setup/CREATE_TEST_USERS_SIMPLE.sql

# Verificar esquema
psql -h tu_supabase_host -U postgres -d postgres -f database/migrations/CHECK_DATABASE_STRUCTURE.sql
```

### Scripts de Utilidad
```bash
# Verificar estado completo del sistema
node scripts/testing/test-full-system-status.js

# Verificar Firebase
node scripts/testing/verify-firebase-status.js

# Verificar esquema de BD
node scripts/testing/verify_schema.js

# Test de conexiones en vivo
node scripts/testing/test-live-connections.js

# Diagnóstico profundo
node scripts/testing/deep_analysis.js
```

---

## 📁 ARCHIVOS CLAVE

| Archivo | Propósito |
|---------|-----------|
| `README.md` | Documentación principal del proyecto |
| `INICIO_AQUI.md` | Punto de entrada para nuevos usuarios |
| `ANALISIS_PROFUNDO_UNIDAD_VECINAL.md` | Análisis del sistema de UVs |
| `PLAN_ACCION_UNIDAD_VECINAL.md` | Tareas pendientes críticas |
| `ESTADO_SISTEMA_COMPLETO.md` | Estado actual del sistema |
| `CONFIGURACION_FIREBASE_COMPLETA.md` | Configuración de Firebase |

---

## 🏛️ ADMIN DASHBOARD

### Rutas Principales
```
/admin/dashboard/overview      # Dashboard principal con métricas
/admin/dashboard/tickets       # Gestión de tickets de soporte
/admin/dashboard/campaigns     # Campañas de comunicación
/admin/dashboard/users         # Gestión de usuarios/vecinos
/admin/dashboard/analytics     # Analíticas y reportes
/admin/dashboard/emergencies   # Gestión de emergencias
/admin/dashboard/settings      # Configuración del dashboard
```

### Componentes Clave
```javascript
// Componente principal
src/pages/AdminDashboard/AdminDashboard.js

// Header con selector de UV
src/components/AdminDashboard/AdminHeader.js

// Menú lateral
src/components/AdminDashboard/AdminSidebar.js

// Vista principal
src/pages/AdminDashboard/DashboardOverview.js

// Gestión de tickets
src/pages/AdminDashboard/TicketsManagement.js

// Gestión de campañas
src/pages/AdminDashboard/CampaignsManagement.js
```

### Redux Slices
```javascript
// Estado del admin dashboard
src/store/slices/adminDashboardSlice.js

// Gestión de tickets
src/store/slices/ticketsSlice.js

// Gestión de campañas
src/store/slices/campaignsSlice.js

// Gestión de emergencias
src/store/slices/emergencySlice.js
```

### Hooks Personalizados
```javascript
// Hook principal de admin
src/hooks/useReduxAdmin.js

// Hook de tickets
src/hooks/useReduxTickets.js

// Hook de campañas
src/hooks/useReduxCampaigns.js
```

---

## 🗄️ BASE DE DATOS

### Tablas Principales

#### Usuarios y Autenticación
```sql
users                    -- Usuarios de la plataforma
admin_roles             -- Roles administrativos (super_admin, uv_admin, delegate, moderator)
neighborhoods           -- Unidades Vecinales (UVs)
```

#### Sistema Administrativo
```sql
tickets                 -- Tickets de soporte vecinal
ticket_comments         -- Comentarios en tickets
communication_campaigns -- Campañas de comunicación
emergency_alerts        -- Alertas de emergencia
dashboard_config        -- Configuración del dashboard por UV
```

#### Red Social
```sql
posts                   -- Publicaciones
post_reactions          -- Reacciones (like, love, haha, wow, sad, angry)
comments                -- Comentarios
messages                -- Mensajes privados
conversations           -- Conversaciones
notifications           -- Notificaciones
```

#### Comunidad
```sql
events                  -- Eventos comunitarios
friends                 -- Relaciones de amistad
groups                  -- Grupos comunitarios
photos                  -- Fotos subidas
```

### Consultas Útiles
```sql
-- Ver usuarios administradores
SELECT u.name, u.email, ar.role_type, n.nombre as neighborhood
FROM users u
JOIN admin_roles ar ON u.id = ar.user_id
JOIN neighborhoods n ON ar.neighborhood_id = n.id
WHERE ar.is_active = true;

-- Ver tickets por UV
SELECT t.*, u.name as created_by_name
FROM tickets t
JOIN users u ON t.created_by = u.id
WHERE t.neighborhood_id = 'UV_ID'
ORDER BY t.created_at DESC;

-- Ver estadísticas de campañas
SELECT 
  status,
  COUNT(*) as total,
  SUM(total_sent) as total_enviados
FROM communication_campaigns
WHERE neighborhood_id = 'UV_ID'
GROUP BY status;
```

---

## 🔧 CONFIGURACIÓN

### Variables de Entorno (.env)
```env
# Supabase
REACT_APP_SUPABASE_URL=https://tu-proyecto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu_anon_key

# Firebase (opcional, para realtime)
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto
REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_VAPID_KEY=tu_vapid_key
```

### Archivos de Configuración
```javascript
// Supabase
src/config/supabase.js

// Firebase
src/config/firebase.js

// Service Worker de Firebase
public/firebase-messaging-sw.js
```

---

## 🎯 SISTEMA DE UNIDADES VECINALES (UVs)

### Roles y Permisos
```
super_admin    → Acceso total al sistema
uv_admin       → Administrador de una UV específica
delegate       → Delegado con permisos limitados
moderator      → Moderador de contenido
```

### Permisos por Rol
| Permiso | super_admin | uv_admin | delegate | moderator |
|---------|-------------|----------|----------|-----------|
| Gestionar Tickets | ✅ | ✅ | ✅ | ❌ |
| Enviar Campañas | ✅ | ✅ | ❌ | ❌ |
| Gestionar Usuarios | ✅ | ✅ | ❌ | ❌ |
| Ver Analíticas | ✅ | ✅ | ✅ | ❌ |
| Moderar Contenido | ✅ | ✅ | ✅ | ✅ |

### Funciones Útiles (useReduxAdmin)
```javascript
const {
  // Estado
  currentNeighborhood,
  userNeighborhoods,
  permissions,
  
  // Funciones
  getCurrentNeighborhoodId(),
  getCurrentNeighborhoodName(),
  hasPermission(permission),
  canManageTickets(),
  canSendCampaigns(),
  canManageUsers(),
  
  // Estadísticas
  getTotalTickets(),
  getTotalUsers(),
  getTotalCampaigns()
} = useReduxAdmin();
```

---

## 🐛 TROUBLESHOOTING

| Problema | Solución |
|----------|----------|
| Página en blanco | Verificar variables de entorno en `.env` |
| Error de autenticación | Verificar Supabase credentials |
| Firebase no funciona | Verificar Firebase config en `.env` |
| UV no se carga | Ver `PLAN_ACCION_UNIDAD_VECINAL.md` |
| Tickets no aparecen | Verificar `neighborhood_id` en la consulta |
| Campañas no se envían | Verificar servidor backend en `server/` |
| Reacciones no funcionan | Verificar RLS policies en Supabase |
| Fotos no suben | Verificar Storage bucket en Supabase |

---

## 📊 SERVICIOS PRINCIPALES

### Servicios de Admin
```javascript
// Servicio principal de admin
src/services/supabaseAdminService.js

// Servicio de tickets
src/services/supabaseTicketsService.js

// Servicio de campañas
src/services/supabaseCampaignsService.js

// Servicio de emergencias
src/services/emergencyService.js
```

### Servicios de Red Social
```javascript
// Posts
src/services/supabasePostsService.js

// Mensajes
src/services/supabaseMessagesService.js

// Fotos
src/services/supabasePhotosService.js

// Usuarios
src/services/supabaseUsersService.js
```

### Servicios de Firebase
```javascript
// Mensajes en tiempo real
src/services/firebaseMessagesService.js

// Notificaciones
src/services/firebaseNotificationsService.js

// Sincronización híbrida
src/services/hybridSyncService.js
```

---

## 🚨 TAREAS PENDIENTES CRÍTICAS

Ver **[PLAN_ACCION_UNIDAD_VECINAL.md](PLAN_ACCION_UNIDAD_VECINAL.md)** para detalles completos.

### 1. Agregar Selector de UV en AdminHeader
- **Archivo:** `src/components/AdminDashboard/AdminHeader.js`
- **Tiempo:** 15 minutos
- **Prioridad:** 🔴 CRÍTICA

### 2. Cargar UVs Reales en AdminDashboard
- **Archivo:** `src/pages/AdminDashboard/AdminDashboard.js`
- **Tiempo:** 20 minutos
- **Prioridad:** 🔴 CRÍTICA

### 3. Agregar Estado Vacío en DashboardOverview
- **Archivo:** `src/pages/AdminDashboard/DashboardOverview.js`
- **Tiempo:** 10 minutos
- **Prioridad:** 🟡 IMPORTANTE

---

## 📞 AYUDA RÁPIDA

### Documentación Completa
- **[README.md](README.md)** - Documentación principal
- **[INICIO_AQUI.md](INICIO_AQUI.md)** - Punto de entrada

### Sistema de UVs
- **[ANALISIS_PROFUNDO_UNIDAD_VECINAL.md](ANALISIS_PROFUNDO_UNIDAD_VECINAL.md)** - Análisis completo
- **[PLAN_ACCION_UNIDAD_VECINAL.md](PLAN_ACCION_UNIDAD_VECINAL.md)** - Plan de acción

### Estado del Sistema
- **[ESTADO_SISTEMA_COMPLETO.md](ESTADO_SISTEMA_COMPLETO.md)** - Estado actual
- **[ESTADO_FIREBASE_ACTUAL.md](ESTADO_FIREBASE_ACTUAL.md)** - Estado de Firebase

### Limpieza y Mantenimiento
- **[LIMPIEZA_ARCHIVOS_MD_COMPLETADA.md](LIMPIEZA_ARCHIVOS_MD_COMPLETADA.md)** - Limpieza reciente
- **[ARCHIVOS_MD_DESACTUALIZADOS.md](ARCHIVOS_MD_DESACTUALIZADOS.md)** - Archivos obsoletos

---

## 🔗 LINKS ÚTILES

- **Producción:** https://vecinoactivo.cl/
- **Admin Login:** https://vecinoactivo.cl/iniciar-sesion-admin
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Firebase Console:** https://console.firebase.google.com/

---

**Última actualización:** 28 de enero de 2026  
**Versión:** 2.0  
**Estado:** ✅ Actualizado
