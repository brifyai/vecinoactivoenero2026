-- Script para deshabilitar confirmación de email y crear usuario admin
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Deshabilitar confirmación de email en configuración
-- Nota: Esto debe hacerse también en el dashboard de Supabase

-- PASO 2: Crear usuario administrador directamente sin confirmación
DO $$
DECLARE
    user_exists INTEGER;
    new_user_id UUID;
BEGIN
    -- Verificar si ya existe el usuario
    SELECT COUNT(*) INTO user_exists 
    FROM auth.users 
    WHERE email = 'admin@vecinoactivo.cl';
    
    IF user_exists = 0 THEN
        -- Generar ID único
        new_user_id := gen_random_uuid();
        
        -- Insertar en auth.users (SIN confirmación de email)
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,  -- ← Confirmado inmediatamente
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role,
            confirmation_token,
            email_change_token_new,
            recovery_token
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@vecinoactivo.cl',
            crypt('admin123', gen_salt('bf')),
            NOW(),  -- ← Email confirmado inmediatamente
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Administrador", "email": "admin@vecinoactivo.cl"}',
            false,
            'authenticated',
            '',  -- Sin token de confirmación
            '',  -- Sin token de cambio
            ''   -- Sin token de recuperación
        );
        
        -- Insertar en auth.identities
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            new_user_id,
            format('{"sub": "%s", "email": "%s", "email_verified": true}', new_user_id::text, 'admin@vecinoactivo.cl')::jsonb,
            'email',
            'admin@vecinoactivo.cl',
            NOW(),
            NOW()
        );
        
        -- Actualizar o crear en public.users
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
            new_user_id,
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
        )
        ON CONFLICT (email) DO UPDATE SET
            id = new_user_id,
            name = 'Administrador',
            username = 'administrador',
            verified = TRUE,
            email_verified = TRUE,
            updated_at = NOW();
        
        RAISE NOTICE 'Usuario administrador creado exitosamente con ID: %', new_user_id;
        RAISE NOTICE 'Email confirmado automáticamente - no se requiere verificación';
    ELSE
        RAISE NOTICE 'Usuario administrador ya existe en auth.users';
    END IF;
END $$;

-- PASO 3: Crear usuario de prueba adicional
DO $$
DECLARE
    user_exists INTEGER;
    new_user_id UUID;
BEGIN
    -- Verificar si ya existe
    SELECT COUNT(*) INTO user_exists 
    FROM auth.users 
    WHERE email = 'test@vecinoactivo.cl';
    
    IF user_exists = 0 THEN
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
            'test@vecinoactivo.cl',
            crypt('test123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Usuario Test", "email": "test@vecinoactivo.cl"}',
            false,
            'authenticated'
        );
        
        -- Insertar en auth.identities
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            created_at,
            updated_at
        ) VALUES (
            new_user_id,
            new_user_id,
            format('{"sub": "%s", "email": "%s", "email_verified": true}', new_user_id::text, 'test@vecinoactivo.cl')::jsonb,
            'email',
            'test@vecinoactivo.cl',
            NOW(),
            NOW()
        );
        
        -- Insertar en public.users
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
            new_user_id,
            'test@vecinoactivo.cl',
            'Usuario Test',
            'test-user',
            'https://i.pravatar.cc/150?img=2',
            'Usuario de prueba del sistema',
            TRUE,
            TRUE,
            'Barrio Test',
            'TEST-001',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Usuario test creado exitosamente con ID: %', new_user_id;
    ELSE
        RAISE NOTICE 'Usuario test ya existe';
    END IF;
END $$;

-- PASO 4: Verificar usuarios creados
SELECT 'Usuarios en auth.users:' as info;
SELECT id, email, email_confirmed_at, created_at, role
FROM auth.users 
WHERE email IN ('admin@vecinoactivo.cl', 'test@vecinoactivo.cl')
ORDER BY created_at;

SELECT 'Usuarios en public.users:' as info;
SELECT id, email, name, username, verified, email_verified
FROM public.users 
WHERE email IN ('admin@vecinoactivo.cl', 'test@vecinoactivo.cl')
ORDER BY created_at;

-- PASO 5: Mostrar credenciales disponibles
SELECT 'CREDENCIALES DISPONIBLES PARA LOGIN:' as info;
SELECT 
    'admin@vecinoactivo.cl / admin123' as credenciales_admin,
    'test@vecinoactivo.cl / test123' as credenciales_test;