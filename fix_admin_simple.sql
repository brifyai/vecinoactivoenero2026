-- Script simple para solucionar el problema del usuario administrador
-- Ejecutar paso a paso en Supabase SQL Editor

-- PASO 1: Agregar columna username si no existe
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

-- PASO 2: Crear índice para username
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- PASO 3: Generar usernames para usuarios existentes que no los tengan
UPDATE public.users 
SET username = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '.', ''), 'ñ', 'n'))
WHERE username IS NULL;

-- PASO 4: Crear usuario administrador si no existe
INSERT INTO public.users (
    id,
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
) 
SELECT 
    gen_random_uuid(),
    'admin@vecinoactivo.cl',
    'Administrador',
    'administrador',
    'https://i.pravatar.cc/150?img=1',
    'Administrador del sistema Vecino Activo. Aquí para ayudar a la comunidad.',
    TRUE,
    TRUE,
    'Administración Central',
    'ADM-001',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = 'admin@vecinoactivo.cl' 
    OR username = 'administrador' 
    OR name = 'Administrador'
);

-- PASO 5: Crear usuario María González si no existe
INSERT INTO public.users (
    id, email, name, username, avatar, bio, verified, email_verified,
    neighborhood_name, neighborhood_code, created_at, updated_at
) 
SELECT 
    gen_random_uuid(), 'maria@vecinoactivo.cl', 'María González', 'maria-gonzalez',
    'https://i.pravatar.cc/150?img=5', 'Vecina activa de Las Condes. Me encanta organizar eventos comunitarios.',
    FALSE, TRUE, 'Las Condes Centro', 'LC-001', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'maria@vecinoactivo.cl');

-- PASO 6: Crear usuario Carlos Rodríguez si no existe
INSERT INTO public.users (
    id, email, name, username, avatar, bio, verified, email_verified,
    neighborhood_name, neighborhood_code, created_at, updated_at
) 
SELECT 
    gen_random_uuid(), 'carlos@vecinoactivo.cl', 'Carlos Rodríguez', 'carlos-rodriguez',
    'https://i.pravatar.cc/150?img=8', 'Ingeniero y padre de familia. Siempre dispuesto a ayudar a mis vecinos.',
    FALSE, TRUE, 'Providencia Norte', 'PR-002', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'carlos@vecinoactivo.cl');

-- PASO 7: Crear usuario Ana Martínez si no existe
INSERT INTO public.users (
    id, email, name, username, avatar, bio, verified, email_verified,
    neighborhood_name, neighborhood_code, created_at, updated_at
) 
SELECT 
    gen_random_uuid(), 'ana@vecinoactivo.cl', 'Ana Martínez', 'ana-martinez',
    'https://i.pravatar.cc/150?img=9', 'Profesora y activista comunitaria. Trabajando por un barrio mejor.',
    TRUE, TRUE, 'Ñuñoa Centro', 'NU-003', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'ana@vecinoactivo.cl');

-- VERIFICACIÓN: Mostrar usuarios creados
SELECT 
    'Usuario creado:' as status,
    name,
    username,
    email,
    CASE WHEN verified THEN 'Verificado' ELSE 'No verificado' END as verificacion,
    neighborhood_name
FROM public.users
WHERE username IN ('administrador', 'maria-gonzalez', 'carlos-rodriguez', 'ana-martinez')
ORDER BY name;

-- VERIFICACIÓN: Confirmar que la columna username existe
SELECT 
    'Columna username existe:' as status,
    CASE WHEN COUNT(*) > 0 THEN 'SÍ' ELSE 'NO' END as resultado
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'username';

-- VERIFICACIÓN: Mostrar estructura de la tabla
SELECT 
    column_name,
    data_type,
    CASE WHEN is_nullable = 'YES' THEN 'Sí' ELSE 'No' END as permite_null,
    COALESCE(column_default, 'Sin valor por defecto') as valor_defecto
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;