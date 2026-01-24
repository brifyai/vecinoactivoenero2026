-- DIAGNÓSTICO: Analizar estado actual de la tabla users
-- Ejecutar en Supabase SQL Editor para entender el problema

-- 1. Verificar si la tabla users existe
SELECT 
    CASE WHEN COUNT(*) > 0 THEN 'La tabla users EXISTE' ELSE 'La tabla users NO EXISTE' END as resultado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- 2. Ver todas las columnas de la tabla users
SELECT 
    column_name as "Columna",
    data_type as "Tipo",
    is_nullable as "Permite NULL",
    column_default as "Valor por defecto"
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Contar usuarios existentes
SELECT COUNT(*) as "Total de usuarios" FROM public.users;

-- 4. Ver algunos usuarios de ejemplo (sin username)
SELECT 
    id,
    name,
    email,
    created_at
FROM public.users 
LIMIT 3;

-- 5. Verificar específicamente si la columna username existe
SELECT 
    CASE WHEN COUNT(*) > 0 THEN 'La columna username EXISTE' ELSE 'La columna username NO EXISTE' END as resultado
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users' 
AND column_name = 'username';

-- 6. Buscar si hay algún usuario administrador (sin usar username)
SELECT 
    CASE WHEN COUNT(*) > 0 THEN 'Usuario administrador EXISTE' ELSE 'Usuario administrador NO EXISTE' END as resultado
FROM public.users 
WHERE email = 'admin@vecinoactivo.cl' OR name = 'Administrador';

-- 7. Ver estructura completa de la tabla
\d public.users;