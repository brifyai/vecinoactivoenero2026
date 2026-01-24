-- Script para encontrar tu usuario
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Buscar en auth.users (tabla de autenticación)
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- PASO 2: Buscar en public.users (tabla de perfil)
SELECT id, email, name, created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- PASO 3: Buscar específicamente el email admin
SELECT 'auth.users' as tabla, id, email 
FROM auth.users 
WHERE email LIKE '%admin%'
UNION ALL
SELECT 'public.users' as tabla, id, email 
FROM public.users 
WHERE email LIKE '%admin%';

-- PASO 4: Ver todos los emails disponibles
SELECT 'auth.users' as tabla, email 
FROM auth.users
UNION ALL
SELECT 'public.users' as tabla, email 
FROM public.users;
