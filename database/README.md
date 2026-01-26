# 🗄️ DATABASE ORGANIZATION - VECINO ACTIVO

Esta carpeta contiene todos los archivos SQL organizados por categoría para facilitar el mantenimiento y despliegue.

## 📁 ESTRUCTURA DE CARPETAS

### `/schema` - Esquemas Base
- `database_schema.sql` - Esquema principal de la base de datos
- `database_functions.sql` - Funciones y procedimientos almacenados

### `/admin` - Panel de Administración
- `ADMIN_DASHBOARD_FINAL.sql` - Esquema completo del dashboard admin
- `admin_dashboard_schema.sql` - Esquema base del dashboard
- `admin_dashboard_schema_fixed.sql` - Correcciones del esquema

### `/auth` - Autenticación y Usuarios
- `INSERTAR_USUARIO_ADMIN.sql` - Crear usuario administrador
- `CREAR_USUARIO_ADMIN_SIMPLE.sql` - Versión simplificada
- `CREATE_USERS_ONLY.sql` - Solo crear usuarios
- `VERIFICAR_Y_CORREGIR_LOGIN.sql` - Correcciones de login
- `AGREGAR_IDENTIDAD_FALTANTE.sql` - Agregar identidades faltantes
- `deshabilitar_confirmacion_email.sql` - Deshabilitar confirmación email

### `/emergency` - Sistema de Emergencias
- `EMERGENCY_ALERTS_SCHEMA.sql` - Esquema de alertas de emergencia
- `EMERGENCY_ALERTS_SIMPLE.sql` - Versión simplificada
- `EMERGENCY_ALERTS_SCHEMA_COMPATIBLE.sql` - Versión compatible
- `EMERGENCY_ALERTS_SCHEMA_FIXED.sql` - Versión corregida

### `/realtime` - Sistema Realtime
- Archivos relacionados con configuración de tiempo real
- Configuraciones de WebSocket y polling
- Setups de Supabase Realtime

### `/migrations` - Migraciones y Scripts Varios
- Scripts de migración
- Correcciones puntuales
- Archivos de setup diversos

## 🚀 ORDEN DE EJECUCIÓN RECOMENDADO

### 1. Configuración Base
```sql
-- 1. Esquema principal
\i schema/database_schema.sql

-- 2. Funciones
\i schema/database_functions.sql
```

### 2. Autenticación
```sql
-- 3. Configurar autenticación
\i auth/CREATE_USERS_ONLY.sql

-- 4. Crear usuario admin
\i auth/INSERTAR_USUARIO_ADMIN.sql
```

### 3. Funcionalidades Avanzadas
```sql
-- 5. Dashboard admin
\i admin/ADMIN_DASHBOARD_FINAL.sql

-- 6. Sistema de emergencias
\i emergency/EMERGENCY_ALERTS_SCHEMA.sql
```

### 4. Realtime (Opcional)
```sql
-- 7. Configurar realtime si es necesario
\i realtime/[archivo_apropiado].sql
```

## 📋 CREDENCIALES POR DEFECTO

### Usuario Administrador
- **Email**: `admin@vecinoactivo.cl`
- **Password**: `123456`
- **Acceso**: Dashboard admin

### Usuarios Demo
- **Password Universal**: `123456`
- **Acceso**: Aplicación principal

## ⚠️ NOTAS IMPORTANTES

1. **Orden de Ejecución**: Seguir el orden recomendado para evitar errores de dependencias
2. **Backups**: Siempre hacer backup antes de ejecutar scripts en producción
3. **Variables**: Verificar variables de entorno antes de ejecutar
4. **Testing**: Probar en ambiente de desarrollo primero

## 🔧 MANTENIMIENTO

- **Nuevos Scripts**: Agregar en la carpeta apropiada
- **Documentación**: Actualizar este README al agregar nuevos archivos
- **Versionado**: Usar nombres descriptivos para los archivos
- **Limpieza**: Remover archivos obsoletos regularmente