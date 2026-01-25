# Configuración de Supabase - Instrucciones Completas

## 🚨 IMPORTANTE: Ejecutar en Supabase

Para que la aplicación funcione correctamente, necesitas ejecutar el esquema de base de datos en tu instancia de Supabase.

## Pasos a seguir:

### 1. Acceder a Supabase Dashboard
- Ve a https://supabase.vecinoactivo.cl (tu instancia)
- Inicia sesión como administrador
- Ve a la sección **SQL Editor**

### 2. Ejecutar el esquema principal
Ejecuta el archivo `database_schema.sql` completo en el SQL Editor:

```sql
-- Copiar y pegar todo el contenido de database_schema.sql
```

### 3. Ejecutar funciones adicionales
Después ejecuta `database_functions.sql`:

```sql
-- Copiar y pegar todo el contenido de database_functions.sql
```

### 4. Verificar tablas creadas
Deberías ver estas tablas en la sección **Table Editor**:

#### Tablas principales:
- ✅ `users` - Usuarios del sistema
- ✅ `posts` - Publicaciones
- ✅ `comments` - Comentarios
- ✅ `reactions` - Reacciones a posts
- ✅ `notifications` - Notificaciones
- ✅ `friendships` - Relaciones de amistad
- ✅ `conversations` - Conversaciones privadas
- ✅ `messages` - Mensajes directos

#### Tablas de comunidad:
- ✅ `events` - Eventos del vecindario
- ✅ `event_attendees` - Asistentes a eventos
- ✅ `groups` - Grupos comunitarios
- ✅ `group_members` - Miembros de grupos
- ✅ `projects` - Proyectos colaborativos
- ✅ `project_participants` - Participantes en proyectos

#### Tablas de servicios:
- ✅ `local_businesses` - Negocios locales
- ✅ `business_reviews` - Reseñas de negocios
- ✅ `help_requests` - Solicitudes de ayuda
- ✅ `help_responses` - Respuestas a solicitudes
- ✅ `shared_resources` - Recursos compartidos
- ✅ `resource_bookings` - Reservas de recursos
- ✅ `polls` - Encuestas
- ✅ `poll_options` - Opciones de encuestas
- ✅ `poll_votes` - Votos en encuestas

### 5. Configurar Row Level Security (RLS)
El esquema incluye políticas de seguridad. Verifica que estén activas:

```sql
-- Verificar que RLS esté habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
```

### 6. Crear usuario administrador
Ejecuta uno de estos archivos para crear un usuario admin:
- `create_admin_user.sql`
- `crear_usuario_auth_admin.sql`

### 7. Configurar Realtime (Opcional)
Si quieres funcionalidad en tiempo real, ejecuta:
- `WORKING_REALTIME_SETUP.sql`

## ⚠️ Notas importantes:

1. **Orden de ejecución**: Ejecuta primero `database_schema.sql`, luego `database_functions.sql`

2. **Extensiones**: El esquema requiere las extensiones `uuid-ossp` y `postgis`

3. **Datos de prueba**: Después de crear las tablas, puedes ejecutar `initialize_demo_data.js` para agregar datos de ejemplo

4. **Credenciales**: Los servicios ya están configurados para usar las credenciales de tu `.env`

## 🔧 Verificación

Una vez ejecutado todo, verifica que:
- [ ] Todas las tablas están creadas
- [ ] Las políticas RLS están activas
- [ ] Puedes hacer login con el usuario admin
- [ ] La aplicación se conecta correctamente

## 📁 Archivos relacionados:
- `database_schema.sql` - Esquema principal
- `database_functions.sql` - Funciones y triggers
- `create_admin_user.sql` - Usuario administrador
- `WORKING_REALTIME_SETUP.sql` - Configuración realtime

## 🚀 Después de la configuración:
Una vez completado, la aplicación debería funcionar completamente con:
- Login/registro de usuarios
- Publicaciones y comentarios
- Sistema de amistades
- Mensajería directa
- Eventos y grupos
- Proyectos colaborativos
- Negocios locales
- Encuestas y recursos compartidos