# 🔧 Configurar Supabase Self-Hosted para Desarrollo

## ❌ Error Actual

```
Error sending confirmation email
```

Este error ocurre porque Supabase self-hosted intenta enviar un email de confirmación pero no tiene configurado un servidor SMTP.

---

## ✅ Solución: Deshabilitar Confirmación de Email

### Opción 1: Configurar en el servidor Supabase (Recomendado)

Necesitas modificar la configuración de tu instancia de Supabase self-hosted:

1. **Ubicar archivo de configuración:**
   - Busca el archivo `.env` o `docker-compose.yml` de tu instalación de Supabase
   - Generalmente está en: `/path/to/supabase/docker/.env`

2. **Modificar variables de entorno:**
   ```env
   # Deshabilitar confirmación de email
   GOTRUE_MAILER_AUTOCONFIRM=true
   
   # O alternativamente
   GOTRUE_DISABLE_SIGNUP=false
   GOTRUE_EXTERNAL_EMAIL_ENABLED=true
   GOTRUE_MAILER_AUTOCONFIRM=true
   ```

3. **Reiniciar servicios:**
   ```bash
   cd /path/to/supabase/docker
   docker-compose down
   docker-compose up -d
   ```

### Opción 2: Configurar SMTP (Para producción)

Si quieres enviar emails reales:

```env
# Configuración SMTP
GOTRUE_SMTP_HOST=smtp.gmail.com
GOTRUE_SMTP_PORT=587
GOTRUE_SMTP_USER=tu-email@gmail.com
GOTRUE_SMTP_PASS=tu-app-password
GOTRUE_SMTP_ADMIN_EMAIL=admin@tudominio.com
GOTRUE_MAILER_AUTOCONFIRM=false
```

### Opción 3: Usar SQL directo (Temporal para desarrollo)

Si no puedes modificar la configuración del servidor, puedes crear usuarios directamente en la base de datos:

```sql
-- 1. Crear usuario en auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  'tu-email@example.com',
  crypt('tu-contraseña', gen_salt('bf')), -- Requiere extensión pgcrypto
  NOW(), -- Email confirmado inmediatamente
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Tu Nombre"}',
  false,
  'authenticated'
);

-- 2. Crear perfil en public.users
INSERT INTO public.users (
  id,
  email,
  name,
  avatar,
  verified,
  email_verified
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'tu-email@example.com'),
  'tu-email@example.com',
  'Tu Nombre',
  'https://ui-avatars.com/api/?name=Tu+Nombre&background=667eea&color=fff',
  false,
  true
);
```

---

## 🔍 Verificar Configuración Actual

Para ver la configuración actual de tu Supabase:

```sql
-- Ver configuración de auth
SELECT * FROM pg_settings WHERE name LIKE '%gotrue%';

-- Ver usuarios existentes
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users;
```

---

## 🚀 Solución Rápida para Continuar

Mientras configuras el servidor, puedes:

1. **Crear usuario manualmente con SQL** (ver Opción 3 arriba)
2. **Usar ese usuario para hacer login** en `/iniciar-sesion`
3. **Probar Storage** en `/storage-test`

---

## 📝 Script SQL para Crear Usuario de Prueba

```sql
-- Habilitar extensión pgcrypto si no está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Crear usuario de prueba
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- Insertar en auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  ) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'test@vecinoactivo.cl',
    crypt('Test123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Usuario de Prueba"}',
    false,
    'authenticated',
    'authenticated'
  )
  RETURNING id INTO user_id;

  -- Insertar en public.users
  INSERT INTO public.users (
    id,
    email,
    name,
    username,
    avatar,
    verified,
    email_verified,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    'test@vecinoactivo.cl',
    'Usuario de Prueba',
    'test.user',
    'https://ui-avatars.com/api/?name=Usuario+de+Prueba&background=667eea&color=fff',
    false,
    true,
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Usuario creado exitosamente: test@vecinoactivo.cl / Test123456';
END $$;
```

Ejecuta este SQL en tu base de datos y luego podrás hacer login con:
- **Email:** `test@vecinoactivo.cl`
- **Password:** `Test123456`

---

## 🎯 Siguiente Paso

Una vez que tengas un usuario (ya sea configurando el servidor o creando uno manualmente):

1. Ve a `/iniciar-sesion`
2. Inicia sesión
3. Ve a `/storage-test`
4. Prueba subir una imagen

---

**Recomendación:** Para desarrollo, usa `GOTRUE_MAILER_AUTOCONFIRM=true` en tu servidor Supabase.
