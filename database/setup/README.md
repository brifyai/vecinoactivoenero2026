# Configuración de Autenticación - Vecino Activo

## 🎯 Objetivo

Este directorio contiene los scripts necesarios para configurar el sistema de autenticación de Vecino Activo, permitiendo el login de vecinos y unidades vecinales.

## 📋 Requisitos Previos

1. Tener Supabase configurado y corriendo
2. Variables de entorno configuradas en `.env`:
   ```
   REACT_APP_SUPABASE_URL=tu_url_de_supabase
   REACT_APP_SUPABASE_ANON_KEY=tu_anon_key
   ```

## 🚀 Instalación Rápida

### Opción 1: Script Automático (Recomendado)

```bash
node scripts/setup-auth-users.js
```

Este script:
- Crea o actualiza usuarios en la tabla `users`
- Configura contraseñas y roles
- Muestra las credenciales al finalizar

### Opción 2: SQL Manual

1. Abre tu cliente de Supabase (Dashboard SQL Editor)
2. Copia y pega el contenido de `SETUP_AUTH_USERS.sql`
3. Ejecuta el script

## 🔐 Credenciales Creadas

### Administrador (Unidad Vecinal)
- **Email**: `admin@vecinoactivo.cl`
- **Contraseña**: `admin123`
- **Rol**: `admin`
- **Acceso**: Panel administrativo en `/admin/dashboard`

### Vecinos
1. **Juan Pérez**
   - Email: `vecino@vecinoactivo.cl`
   - Contraseña: `vecino123`
   - Rol: `user`

2. **María González**
   - Email: `maria@vecinoactivo.cl`
   - Contraseña: `maria123`
   - Rol: `user`

3. **Carlos Rodríguez**
   - Email: `carlos@vecinoactivo.cl`
   - Contraseña: `carlos123`
   - Rol: `user`

## 🔄 Flujo de Autenticación

### Para Vecinos:
1. Ir a `http://localhost:3000/iniciar-sesion`
2. Seleccionar pestaña "Vecinos"
3. Ingresar email y contraseña
4. Redirige a `/app` (aplicación principal)

### Para Unidad Vecinal (Admin):
1. Ir a `http://localhost:3000/iniciar-sesion`
2. Seleccionar pestaña "Unidad Vecinal"
3. Ingresar email y contraseña de admin
4. Redirige a `/admin/dashboard` (panel administrativo)

## 🗄️ Estructura de la Tabla `users`

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT,           -- Contraseña en texto plano (desarrollo)
    password_hash TEXT,      -- Hash de contraseña (producción)
    name TEXT NOT NULL,
    username TEXT UNIQUE,
    role TEXT DEFAULT 'user', -- 'user' o 'admin'
    avatar TEXT,
    bio TEXT,
    verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Seguridad

### Desarrollo
- Las contraseñas están en texto plano para facilitar el desarrollo
- Esto es **SOLO para desarrollo local**

### Producción
- **IMPORTANTE**: Antes de producción, implementar:
  1. Hash de contraseñas con bcrypt
  2. Tokens JWT seguros
  3. Rate limiting en endpoints de login
  4. Validación de sesiones
  5. HTTPS obligatorio

## 🛠️ Troubleshooting

### Error: "Usuario no encontrado"
- Verifica que ejecutaste el script de setup
- Revisa que la tabla `users` existe en Supabase
- Confirma que las variables de entorno están correctas

### Error: "Credenciales inválidas"
- Verifica que estás usando las credenciales correctas
- Asegúrate de que el campo `password` existe en la tabla
- Revisa los logs de la consola del navegador

### Error: "No tienes permisos de administrador"
- Verifica que el usuario tiene `role = 'admin'` en la BD
- Asegúrate de seleccionar la pestaña "Unidad Vecinal" al hacer login

## 📝 Notas Adicionales

- El sistema usa la misma tabla `users` para ambos tipos de usuarios
- La distinción se hace por el campo `role`
- Las sesiones se guardan en `localStorage` con clave `vecino-activo-auth`
- La sesión expira después de 24 horas

## 🔄 Actualizar Usuarios

Para actualizar usuarios existentes, simplemente ejecuta el script nuevamente:

```bash
node scripts/setup-auth-users.js
```

El script usa `ON CONFLICT` para actualizar en lugar de duplicar.

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de la consola del navegador
2. Verifica la conexión a Supabase
3. Confirma que las tablas existen
4. Revisa las variables de entorno
