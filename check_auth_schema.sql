-- Script para verificar el esquema de las tablas de autenticación
-- Ejecutar PRIMERO para entender la estructura

-- 1. Verificar estructura de auth.users
SELECT 'ESTRUCTURA DE auth.users:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Verificar estructura de auth.identities
SELECT 'ESTRUCTURA DE auth.identities:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'identities'
ORDER BY ordinal_position;

-- 3. Ver ejemplos existentes en auth.identities (si los hay)
SELECT 'EJEMPLOS EN auth.identities:' as info;
SELECT 
    id,
    provider_id,
    user_id,
    provider,
    identity_data,
    created_at
FROM auth.identities 
LIMIT 3;

-- 4. Ver ejemplos existentes en auth.users (si los hay)
SELECT 'EJEMPLOS EN auth.users:' as info;
SELECT 
    id,
    email,
    email_confirmed_at,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at
FROM auth.users 
LIMIT 3;

-- 5. Contar registros en cada tabla
SELECT 'CONTEO DE REGISTROS:' as info;
SELECT 
    'auth.users' as tabla,
    COUNT(*) as total
FROM auth.users
UNION ALL
SELECT 
    'auth.identities' as tabla,
    COUNT(*) as total
FROM auth.identities
UNION ALL
SELECT 
    'public.users' as tabla,
    COUNT(*) as total
FROM public.users;