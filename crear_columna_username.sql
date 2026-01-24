-- SCRIPT SIMPLE: Crear columna username y usuario administrador
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar estructura actual de la tabla users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- PASO 2: Agregar la columna username
ALTER TABLE public.users 
ADD COLUMN username VARCHAR(50);

-- PASO 3: Hacer la columna única (después de agregar datos)
-- (Lo haremos después de generar los usernames)

-- PASO 4: Verificar que se agregó la columna
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
AND column_name = 'username';

-- PASO 5: Generar usernames para usuarios existentes
UPDATE public.users 
SET username = LOWER(REPLACE(REPLACE(name, ' ', '-'), '.', ''))
WHERE username IS NULL;

-- PASO 6: Ahora hacer la columna única
ALTER TABLE public.users 
ADD CONSTRAINT users_username_unique UNIQUE (username);

-- PASO 7: Crear índice para optimizar búsquedas
CREATE INDEX idx_users_username ON public.users(username);

-- PASO 8: Verificar usuarios existentes
SELECT id, name, username, email 
FROM public.users 
LIMIT 5;

-- PASO 9: Crear usuario administrador
INSERT INTO public.users (
    id,
    email,
    password,
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
    gen_random_uuid(),
    'admin@vecinoactivo.cl',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
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

-- PASO 10: Verificar que el usuario administrador se creó
SELECT name, username, email, verified 
FROM public.users 
WHERE username = 'administrador';

-- PASO 11: Mostrar todos los usuarios con sus usernames
SELECT 
    name,
    username,
    email,
    CASE WHEN verified THEN 'Verificado' ELSE 'No verificado' END as estado
FROM public.users
ORDER BY created_at DESC;