-- SCRIPT BÁSICO: Agregar columna username y crear usuario administrador
-- Ejecutar LÍNEA POR LÍNEA en Supabase SQL Editor

-- PASO 1: Ver estructura actual de la tabla
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- PASO 2: Agregar columna username (ejecutar solo esta línea)
ALTER TABLE public.users ADD COLUMN username VARCHAR(50);

-- PASO 3: Verificar que se agregó la columna
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'username';

-- PASO 4: Hacer la columna única (ejecutar solo esta línea)
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- PASO 5: Crear índice
CREATE INDEX idx_users_username ON public.users(username);

-- PASO 6: Ver usuarios actuales (sin username aún)
SELECT id, name, email FROM public.users LIMIT 5;

-- PASO 7: Generar usernames para usuarios existentes
UPDATE public.users 
SET username = LOWER(REPLACE(name, ' ', '-'))
WHERE username IS NULL;

-- PASO 8: Verificar que se generaron los usernames
SELECT name, username, email FROM public.users LIMIT 5;

-- PASO 9: Crear usuario administrador
INSERT INTO public.users (
    email,
    name,
    username,
    avatar,
    bio,
    verified,
    email_verified,
    neighborhood_name,
    neighborhood_code,
    created_at,
    updated_at
) VALUES (
    'admin@vecinoactivo.cl',
    'Administrador',
    'administrador',
    'https://i.pravatar.cc/150?img=1',
    'Administrador del sistema Vecino Activo',
    TRUE,
    TRUE,
    'Administración Central',
    'ADM-001',
    NOW(),
    NOW()
);

-- PASO 10: Verificar que se creó el administrador
SELECT name, username, email, verified FROM public.users WHERE username = 'administrador';