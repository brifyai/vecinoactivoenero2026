-- Script para verificar el estado actual de los usuarios
-- Ejecutar ANTES de aplicar la solución

-- 1. Verificar usuarios en public.users
SELECT 'USUARIOS EN PUBLIC.USERS:' as info;
SELECT 
    id,
    email,
    name,
    username,
    verified,
    email_verified,
    created_at
FROM public.users 
WHERE email IN ('admin@vecinoactivo.cl', 'test@vecinoactivo.cl')
ORDER BY created_at;

-- 2. Verificar usuarios en auth.users
SELECT 'USUARIOS EN AUTH.USERS:' as info;
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    role
FROM auth.users 
WHERE email IN ('admin@vecinoactivo.cl', 'test@vecinoactivo.cl')
ORDER BY created_at;

-- 3. Contar total de usuarios en cada tabla
SELECT 'RESUMEN DE USUARIOS:' as info;
SELECT 
    'public.users' as tabla,
    COUNT(*) as total_usuarios
FROM public.users
UNION ALL
SELECT 
    'auth.users' as tabla,
    COUNT(*) as total_usuarios
FROM auth.users;

-- 4. Verificar si existe discrepancia
SELECT 'ANÁLISIS DE DISCREPANCIA:' as info;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM public.users WHERE email = 'admin@vecinoactivo.cl') > 0 
        AND (SELECT COUNT(*) FROM auth.users WHERE email = 'admin@vecinoactivo.cl') = 0
        THEN '❌ PROBLEMA: Usuario admin existe en public.users pero NO en auth.users'
        
        WHEN (SELECT COUNT(*) FROM public.users WHERE email = 'admin@vecinoactivo.cl') = 0 
        AND (SELECT COUNT(*) FROM auth.users WHERE email = 'admin@vecinoactivo.cl') = 0
        THEN '⚠️ ESTADO: No existe usuario admin en ninguna tabla'
        
        WHEN (SELECT COUNT(*) FROM public.users WHERE email = 'admin@vecinoactivo.cl') > 0 
        AND (SELECT COUNT(*) FROM auth.users WHERE email = 'admin@vecinoactivo.cl') > 0
        THEN '✅ CORRECTO: Usuario admin existe en ambas tablas'
        
        ELSE '🔍 ESTADO DESCONOCIDO'
    END as diagnostico;

-- 5. Mostrar próximos pasos
SELECT 'PRÓXIMOS PASOS:' as info;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM auth.users WHERE email = 'admin@vecinoactivo.cl') = 0
        THEN 'Ejecutar: deshabilitar_confirmacion_email.sql para crear usuarios en auth.users'
        ELSE 'Los usuarios ya están configurados correctamente'
    END as accion_requerida;