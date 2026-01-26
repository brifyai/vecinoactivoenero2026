# 📋 Configuración de Base de Datos - Admin Settings

## 🎯 Descripción

Este directorio contiene el esquema SQL para la funcionalidad de configuración administrativa del dashboard.

## 📦 Archivos

- `admin_settings_schema.sql` - Esquema completo de tablas, vistas y políticas RLS

## 🚀 Instalación

### Opción 1: Supabase Dashboard (Recomendado)

1. Ir a tu proyecto en https://supabase.com/dashboard
2. Click en **SQL Editor** en el menú lateral
3. Click en **New Query**
4. Copiar y pegar el contenido de `admin_settings_schema.sql`
5. Click en **Run** (o presionar Ctrl/Cmd + Enter)
6. Verificar que se ejecutó sin errores

### Opción 2: CLI de Supabase

```bash
# Desde la raíz del proyecto
supabase db push database/admin/admin_settings_schema.sql
```

### Opción 3: psql (PostgreSQL CLI)

```bash
psql -h db.your-project.supabase.co -U postgres -d postgres -f database/admin/admin_settings_schema.sql
```

## 📊 Tablas Creadas

### 1. `admin_settings`
Almacena la configuración administrativa por unidad vecinal.

**Campos principales:**
- Notificaciones (email, push, SMS, alertas)
- Información de la UV (nombre, dirección, contacto)
- Canales de comunicación (email, push, WhatsApp, SMS)
- Personalización de tema (modo, colores)
- Seguridad (2FA, timeouts, expiración de contraseñas)

**Constraint:** Una configuración por UV (UNIQUE neighborhood_id)

### 2. `admin_users`
Gestiona usuarios con permisos administrativos.

**Campos principales:**
- `user_id` - Referencia al usuario
- `neighborhood_id` - UV a la que pertenece
- `role` - Rol: super_admin, admin, moderator
- `permissions` - Array JSON de permisos específicos
- `is_active` - Estado del administrador

**Constraint:** Un usuario puede ser admin de múltiples UVs

### 3. `admin_users_detailed` (Vista)
Vista que combina información de admin_users con datos del usuario y UV.

## 🔒 Seguridad (RLS)

Las políticas de Row Level Security están configuradas para:

- **admin_settings**: Solo admins de la UV pueden ver y editar
- **admin_users**: Solo admins pueden ver otros admins de su UV
- **Modificación de admins**: Solo super_admins pueden modificar

## 🧪 Verificación

Después de ejecutar el SQL, verifica que las tablas se crearon correctamente:

```sql
-- Verificar tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('admin_settings', 'admin_users');

-- Verificar vista
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name = 'admin_users_detailed';

-- Ver configuraciones existentes
SELECT * FROM admin_settings;

-- Ver administradores
SELECT * FROM admin_users_detailed;
```

## 📝 Datos Iniciales

El script automáticamente:
- Crea configuración por defecto para UVs existentes
- Configura triggers para actualizar `updated_at`
- Establece políticas RLS

## 🔄 Actualización

Si ya ejecutaste el script anteriormente, puedes volver a ejecutarlo de forma segura. Usa `IF NOT EXISTS` y `ON CONFLICT DO NOTHING` para evitar errores.

## 🆘 Troubleshooting

### Error: "relation already exists"
**Solución**: Normal si ya ejecutaste el script. Las tablas ya existen.

### Error: "permission denied"
**Solución**: Asegúrate de estar conectado como usuario con permisos de creación de tablas.

### Error: "foreign key constraint"
**Solución**: Verifica que las tablas `users` y `neighborhoods` existan antes de ejecutar este script.

## 📚 Uso en la Aplicación

El servicio `supabaseSettingsService.js` maneja todas las operaciones:

```javascript
import supabaseSettingsService from './services/supabaseSettingsService';

// Obtener configuración
const settings = await supabaseSettingsService.getSettings(neighborhoodId);

// Actualizar configuración
await supabaseSettingsService.updateSettings(neighborhoodId, settings, userId);

// Obtener administradores
const admins = await supabaseSettingsService.getAdminUsers(neighborhoodId);
```

## ✅ Checklist de Instalación

- [ ] Ejecutar `admin_settings_schema.sql` en Supabase
- [ ] Verificar que las tablas se crearon
- [ ] Verificar que las políticas RLS están activas
- [ ] Probar la página de configuración en el dashboard
- [ ] Guardar cambios y verificar que se persisten en la BD

---

**Fecha de creación**: 26 de enero de 2026  
**Versión**: 1.0.0  
**Estado**: ✅ Listo para producción
