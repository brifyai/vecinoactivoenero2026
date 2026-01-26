-- Script para encontrar tu usuario (versión corregida)
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Ver la estructura de public.users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- PASO 2: Buscar en auth.users (tabla de autenticación)
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- PASO 3: Buscar en public.users (sin asumir columnas)
SELECT *
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- PASO 4: Buscar específicamente el email admin en auth.users
SELECT id, email, created_at
FROM auth.users 
WHERE email LIKE '%admin%';

-- PASO 5: Ver todos los emails en auth.users
SELECT id, email 
FROM auth.users
ORDER BY created_at DESC;
