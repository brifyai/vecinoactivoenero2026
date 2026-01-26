-- Script para crear usuario administrador en Supabase
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar usuarios existentes
SELECT 'Usuarios en auth.users:' as info;
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

SELECT 'Usuarios en public.users:' as info;
SELECT id, email, name, username, created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- PASO 2: Buscar específicamente el usuario administrador
SELECT 'Buscando administrador en auth.users:' as info;
SELECT id, email, created_at
FROM auth.users 
WHERE email LIKE '%admin%' OR email LIKE '%administrador%';

SELECT 'Buscando administrador en public.users:' as info;
SELECT id, email, name, username, created_at
FROM public.users 
WHERE email LIKE '%admin%' OR name LIKE '%admin%' OR name LIKE '%Administrador%' OR username = 'administrador';

-- PASO 3: Crear usuario administrador si no existe
-- Nota: En Supabase, normalmente los usuarios se crean a través de auth.users primero
-- Este script es solo para verificación y creación manual en public.users

-- Verificar si existe en public.users
DO $$
DECLARE
    admin_exists INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_exists 
    FROM public.users 
    WHERE email = 'admin@vecinoactivo.cl' OR username = 'administrador' OR name = 'Administrador';
    
    IF admin_exists = 0 THEN
        -- Insertar usuario administrador en public.users
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
        ) VALUES (
            gen_random_uuid(),
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
        
        RAISE NOTICE 'Usuario administrador creado exitosamente';
    ELSE
        RAISE NOTICE 'Usuario administrador ya existe';
    END IF;
END $$;

-- PASO 4: Verificar la creación
SELECT 'Usuario administrador creado:' as info;
SELECT id, email, name, username, verified, created_at
FROM public.users 
WHERE email = 'admin@vecinoactivo.cl' OR username = 'administrador' OR name = 'Administrador';

-- PASO 5: Mostrar todos los usuarios disponibles
SELECT 'Todos los usuarios disponibles:' as info;
SELECT 
    COALESCE(username, SPLIT_PART(email, '@', 1)) as username_display,
    name,
    email,
    username,
    verified,
    created_at
FROM public.users
ORDER BY created_at DESC;