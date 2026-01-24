-- Script para crear usuario administrador en auth.users
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Verificar si existe en auth.users
SELECT 'Verificando usuario en auth.users:' as info;
SELECT id, email, created_at, email_confirmed_at
FROM auth.users 
WHERE email = 'admin@vecinoactivo.cl';

-- PASO 2: Crear usuario en auth.users si no existe
-- Nota: Usamos la función de Supabase para crear usuarios con contraseña

DO $$
DECLARE
    user_exists INTEGER;
    new_user_id UUID;
BEGIN
    -- Verificar si ya existe
    SELECT COUNT(*) INTO user_exists 
    FROM auth.users 
    WHERE email = 'admin@vecinoactivo.cl';
    
    IF user_exists = 0 THEN
        -- Generar ID para el usuario
        new_user_id := gen_random_uuid();
        
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
            role
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@vecinoactivo.cl',
            crypt('admin123', gen_salt('bf')), -- Encriptar contraseña
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Administrador"}',
            false,
            'authenticated'
        );
        
        -- Insertar en auth.identities
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            new_user_id,
            format('{"sub": "%s", "email": "%s"}', new_user_id::text, 'admin@vecinoactivo.cl')::jsonb,
            'email',
            NOW(),
            NOW()
        );
        
        -- Actualizar public.users con el ID correcto si existe
        UPDATE public.users 
        SET id = new_user_id 
        WHERE email = 'admin@vecinoactivo.cl';
        
        RAISE NOTICE 'Usuario administrador creado en auth.users con ID: %', new_user_id;
    ELSE
        RAISE NOTICE 'Usuario administrador ya existe en auth.users';
    END IF;
END $$;

-- PASO 3: Verificar la creación
SELECT 'Usuario creado en auth.users:' as info;
SELECT id, email, created_at, email_confirmed_at, role
FROM auth.users 
WHERE email = 'admin@vecinoactivo.cl';

-- PASO 4: Verificar sincronización con public.users
SELECT 'Usuario en public.users:' as info;
SELECT id, email, name, username, created_at
FROM public.users 
WHERE email = 'admin@vecinoactivo.cl';

-- PASO 5: Verificar que los IDs coincidan
SELECT 'Verificando sincronización de IDs:' as info;
SELECT 
    'auth.users' as tabla,
    id,
    email
FROM auth.users 
WHERE email = 'admin@vecinoactivo.cl'
UNION ALL
SELECT 
    'public.users' as tabla,
    id,
    email
FROM public.users 
WHERE email = 'admin@vecinoactivo.cl';