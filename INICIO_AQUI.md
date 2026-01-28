# 🚀 INICIO AQUÍ - Vecino Activo

**Última actualización:** 28 de enero de 2026

---

## 📋 BIENVENIDO A VECINO ACTIVO

Vecino Activo es una plataforma completa para gestión de comunidades vecinales (Unidades Vecinales) con red social integrada, panel administrativo, sistema de tickets, campañas de comunicación y más.

**Sitio en producción:** https://vecinoactivo.cl/

---

## 🎯 PARA EMPEZAR

### 👨‍💻 Si eres Desarrollador:

#### 1. Lee la Documentación Principal
- **[README.md](README.md)** - Documentación completa del proyecto
- **[ANALISIS_PROFUNDO_UNIDAD_VECINAL.md](ANALISIS_PROFUNDO_UNIDAD_VECINAL.md)** - Sistema de UVs

#### 2. Configura tu Entorno
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/vecino-activo.git
cd vecino-activo

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase y Firebase

# Iniciar en desarrollo
npm start
```

#### 3. Tareas Pendientes Críticas
Ver **[PLAN_ACCION_UNIDAD_VECINAL.md](PLAN_ACCION_UNIDAD_VECINAL.md)** para:
- ⚠️ Agregar selector de UV en AdminHeader
- ⚠️ Implementar inicialización automática de UVs
- ⚠️ Agregar estado vacío cuando no hay UV seleccionada

#### 4. Estructura del Código
```
src/
├── components/AdminDashboard/  # Componentes del admin
├── pages/AdminDashboard/       # Páginas del admin
├── store/slices/               # Redux Toolkit slices
├── services/                   # Servicios de backend
└── hooks/                      # Hooks personalizados
```

---

### 🏛️ Si eres Administrador:

#### 1. Accede al Panel Administrativo
👉 https://vecinoactivo.cl/iniciar-sesion-admin

#### 2. Usa tus Credenciales
```
Email: tu_email@admin.com
Password: tu_contraseña
```

#### 3. Selecciona tu Unidad Vecinal
- El selector aparecerá en el header superior
- Puedes cambiar entre múltiples UVs si tienes acceso

#### 4. Explora el Dashboard
- **Overview:** Métricas y estadísticas
- **Tickets:** Gestión de solicitudes vecinales
- **Campañas:** Comunicación con vecinos
- **Usuarios:** Gestión de vecinos
- **Emergencias:** Alertas de emergencia
- **Analíticas:** Reportes y gráficos

---

### 👤 Si eres Usuario/Vecino:

#### 1. Accede a la Plataforma
👉 https://vecinoactivo.cl/

#### 2. Regístrate o Inicia Sesión
- Crea tu cuenta con email y contraseña
- Verifica tu email
- Completa tu perfil

#### 3. Explora la Comunidad
- **Feed:** Publicaciones de vecinos
- **Mensajes:** Chat con otros vecinos
- **Eventos:** Eventos comunitarios
- **Directorio:** Encuentra vecinos
- **Mapa:** Explora tu Unidad Vecinal

---

## 📚 DOCUMENTACIÓN CLAVE

### 🏛️ Sistema Administrativo

| Documento | Descripción |
|-----------|-------------|
| [ANALISIS_PROFUNDO_UNIDAD_VECINAL.md](ANALISIS_PROFUNDO_UNIDAD_VECINAL.md) | Análisis completo del sistema de UVs |
| [PLAN_ACCION_UNIDAD_VECINAL.md](PLAN_ACCION_UNIDAD_VECINAL.md) | Plan de implementación y tareas pendientes |
| [SISTEMA_ENVIO_CAMPANAS_IMPLEMENTADO.md](SISTEMA_ENVIO_CAMPANAS_IMPLEMENTADO.md) | Sistema de campañas de comunicación |

### ✅ Sistemas Implementados

| Documento | Descripción |
|-----------|-------------|
| [SISTEMA_AUTENTICACION_CONFIGURADO.md](SISTEMA_AUTENTICACION_CONFIGURADO.md) | Sistema de autenticación |
| [SISTEMA_FOTOS_COMPLETADO.md](SISTEMA_FOTOS_COMPLETADO.md) | Gestión de fotos |
| [SISTEMA_MENSAJES_TIEMPO_REAL.md](SISTEMA_MENSAJES_TIEMPO_REAL.md) | Mensajería en tiempo real |
| [SISTEMA_REACCIONES_IMPLEMENTADO.md](SISTEMA_REACCIONES_IMPLEMENTADO.md) | Sistema de reacciones |
| [FEED_ACTIVIDAD_IMPLEMENTADO.md](FEED_ACTIVIDAD_IMPLEMENTADO.md) | Feed de actividad |
| [LAZY_LOADING_MAPA_IMPLEMENTADO.md](LAZY_LOADING_MAPA_IMPLEMENTADO.md) | Mapa optimizado |

### ⚙️ Configuración

| Documento | Descripción |
|-----------|-------------|
| [CONFIGURACION_FIREBASE_COMPLETA.md](CONFIGURACION_FIREBASE_COMPLETA.md) | Configuración de Firebase |
| [GUIA_CONFIGURACION_FIREBASE_PASO_A_PASO.md](GUIA_CONFIGURACION_FIREBASE_PASO_A_PASO.md) | Guía paso a paso Firebase |
| [ESTADO_SISTEMA_COMPLETO.md](ESTADO_SISTEMA_COMPLETO.md) | Estado actual del sistema |
| [INSTRUCCIONES_CREAR_USUARIOS_PRUEBA.md](INSTRUCCIONES_CREAR_USUARIOS_PRUEBA.md) | Crear usuarios de prueba |

### 🧹 Limpieza y Mantenimiento

| Documento | Descripción |
|-----------|-------------|
| [LIMPIEZA_ARCHIVOS_MD_COMPLETADA.md](LIMPIEZA_ARCHIVOS_MD_COMPLETADA.md) | Limpieza de documentación |
| [ARCHIVOS_MD_DESACTUALIZADOS.md](ARCHIVOS_MD_DESACTUALIZADOS.md) | Análisis de archivos obsoletos |
| [LIMPIEZA_CODIGO_COMPLETADA.md](LIMPIEZA_CODIGO_COMPLETADA.md) | Limpieza de código |

---

## 🔧 TAREAS PENDIENTES CRÍTICAS

### ⚠️ Prioridad 1: Sistema de Unidades Vecinales

Ver **[PLAN_ACCION_UNIDAD_VECINAL.md](PLAN_ACCION_UNIDAD_VECINAL.md)** para detalles completos.

#### 1. Agregar Selector de UV en AdminHeader
- **Archivo:** `src/components/AdminDashboard/AdminHeader.js`
- **Tiempo:** 15 minutos
- **Estado:** ⏳ Pendiente

#### 2. Cargar UVs Reales en AdminDashboard
- **Archivo:** `src/pages/AdminDashboard/AdminDashboard.js`
- **Tiempo:** 20 minutos
- **Estado:** ⏳ Pendiente

#### 3. Agregar Estado Vacío en DashboardOverview
- **Archivo:** `src/pages/AdminDashboard/DashboardOverview.js`
- **Tiempo:** 10 minutos
- **Estado:** ⏳ Pendiente

**Total:** ~45 minutos de implementación

---

## 🚀 COMANDOS RÁPIDOS

### Desarrollo
```bash
npm start                    # Iniciar en desarrollo (puerto 3000)
npm run build               # Build para producción
npm test                    # Ejecutar tests
```

### Base de Datos
```bash
# Ejecutar migraciones
psql -h tu_host -U postgres -d vecino_activo -f database/migrations/ARCHIVO.sql

# Crear usuarios de prueba
psql -h tu_host -U postgres -d vecino_activo -f database/setup/CREATE_TEST_USERS_SIMPLE.sql
```

### Scripts de Verificación
```bash
# Verificar estado del sistema
node scripts/testing/test-full-system-status.js

# Verificar Firebase
node scripts/testing/verify-firebase-status.js

# Verificar esquema de BD
node scripts/testing/verify_schema.js
```

---

## 🗺️ MAPA DE NAVEGACIÓN

### Rutas Públicas
- `/` - Landing page
- `/iniciar-sesion` - Login de usuarios
- `/registro` - Registro de usuarios
- `/iniciar-sesion-admin` - Login de administradores

### Rutas de Usuario (Autenticado)
- `/inicio` - Feed principal
- `/perfil/:username` - Perfil de usuario
- `/mensajes` - Mensajería
- `/eventos` - Eventos comunitarios
- `/directorio` - Directorio de vecinos
- `/fotos` - Galería de fotos

### Rutas de Admin (Autenticado como Admin)
- `/admin/dashboard/overview` - Dashboard principal
- `/admin/dashboard/tickets` - Gestión de tickets
- `/admin/dashboard/campaigns` - Campañas de comunicación
- `/admin/dashboard/users` - Gestión de usuarios
- `/admin/dashboard/analytics` - Analíticas
- `/admin/dashboard/emergencies` - Gestión de emergencias
- `/admin/dashboard/settings` - Configuración

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: La aplicación no carga
**Solución:**
1. Verificar variables de entorno en `.env`
2. Verificar conexión a Supabase
3. Revisar consola del navegador (F12)

### Problema: Error de autenticación
**Solución:**
1. Verificar credenciales de Supabase en `.env`
2. Verificar que RLS esté configurado correctamente
3. Revisar logs en Supabase Dashboard

### Problema: Firebase no funciona
**Solución:**
1. Verificar credenciales de Firebase en `.env`
2. Verificar que Firestore esté habilitado
3. Revisar reglas de seguridad de Firestore

### Problema: UV no se carga en el dashboard
**Solución:**
1. Ver [ANALISIS_PROFUNDO_UNIDAD_VECINAL.md](ANALISIS_PROFUNDO_UNIDAD_VECINAL.md)
2. Implementar cambios de [PLAN_ACCION_UNIDAD_VECINAL.md](PLAN_ACCION_UNIDAD_VECINAL.md)
3. Verificar que el usuario tenga roles asignados en `admin_roles`

---

## 📞 SOPORTE Y AYUDA

### Documentación Completa
- **README.md** - Documentación principal
- **docs/** - Carpeta con documentación adicional

### Problemas Conocidos
- **ARCHIVOS_MD_DESACTUALIZADOS.md** - Archivos obsoletos identificados
- **LIMPIEZA_ARCHIVOS_MD_COMPLETADA.md** - Limpieza reciente

### Análisis Técnicos
- **ANALISIS_PROFUNDO_UNIDAD_VECINAL.md** - Sistema de UVs
- **PLAN_ACCION_UNIDAD_VECINAL.md** - Tareas pendientes

---

## ✅ CHECKLIST DE INICIO

### Para Desarrolladores:
- [ ] Clonar repositorio
- [ ] Instalar dependencias (`npm install`)
- [ ] Configurar `.env` con credenciales
- [ ] Leer README.md
- [ ] Leer ANALISIS_PROFUNDO_UNIDAD_VECINAL.md
- [ ] Revisar PLAN_ACCION_UNIDAD_VECINAL.md
- [ ] Ejecutar `npm start`
- [ ] Verificar que la app carga correctamente

### Para Administradores:
- [ ] Acceder a https://vecinoactivo.cl/iniciar-sesion-admin
- [ ] Iniciar sesión con credenciales
- [ ] Seleccionar Unidad Vecinal
- [ ] Explorar dashboard
- [ ] Revisar tickets pendientes
- [ ] Verificar campañas activas

### Para Usuarios:
- [ ] Acceder a https://vecinoactivo.cl/
- [ ] Registrarse o iniciar sesión
- [ ] Completar perfil
- [ ] Explorar feed
- [ ] Conectar con vecinos

---

## 🎯 PRÓXIMOS PASOS

1. **Implementar cambios pendientes de UVs** (45 minutos)
   - Ver [PLAN_ACCION_UNIDAD_VECINAL.md](PLAN_ACCION_UNIDAD_VECINAL.md)

2. **Actualizar documentación restante** (opcional)
   - Ver [ACTUALIZACION_DOCUMENTACION_COMPLETADA.md](ACTUALIZACION_DOCUMENTACION_COMPLETADA.md)

3. **Continuar desarrollo de features**
   - Ver roadmap en README.md

---

**¡Bienvenido a Vecino Activo!** 🏘️

Transforma tu comunidad vecinal en una comunidad digital activa y conectada.

---

**Última actualización:** 28 de enero de 2026  
**Versión:** 2.0  
**Estado:** ✅ Actualizado
