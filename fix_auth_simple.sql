-- Script simplificado para crear usuarios de autenticación
-- Versión corregida que maneja correctamente auth.identities

-- PASO 1: Crear usuario administrador
DO $$
DECLARE
    admin_user_id UUID;
    admin_exists INTEGER;
BEGIN
    -- Verificar si ya existe
    SELECT COUNT(*) INTO admin_exists 
    FROM auth.users 
    WHERE email = 'admin@vecinoactivo.cl';
    
    IF admin_exists = 0 THEN
        -- Generar ID único
        admin_user_id := gen_random_uuid();
        
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
            admin_user_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@vecinoactivo.cl',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Administrador", "email": "admin@vecinoactivo.cl"}',
            false,
            'authenticated'
        );
        
        -- Insertar en auth.identities con provider_id
        INSERT INTO auth.identities (
            provider_id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            'admin@vecinoactivo.cl',
            admin_user_id,
            format('{"sub": "%s", "email": "%s", "email_verified": true, "phone_verified": false}', admin_user_id::text, 'admin@vecinoactivo.cl')::jsonb,
            'email',
            NOW(),
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
            admin_user_id,
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
            id = admin_user_id,
            name = 'Administrador',
            username = 'administrador',
            verified = TRUE,
            email_verified = TRUE,
            updated_at = NOW();
        
        RAISE NOTICE '✅ Usuario administrador creado con ID: %', admin_user_id;
    ELSE
        RAISE NOTICE '⚠️ Usuario administrador ya existe';
    END IF;
END $$;

-- PASO 2: Crear usuario de prueba
DO $$
DECLARE
    test_user_id UUID;
    test_exists INTEGER;
BEGIN
    -- Verificar si ya existe
    SELECT COUNT(*) INTO test_exists 
    FROM auth.users 
    WHERE email = 'test@vecinoactivo.cl';
    
    IF test_exists = 0 THEN
        -- Generar ID único
        test_user_id := gen_random_uuid();
        
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
            test_user_id,
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
        
        -- Insertar en auth.identities con provider_id
        INSERT INTO auth.identities (
            provider_id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            'test@vecinoactivo.cl',
            test_user_id,
            format('{"sub": "%s", "email": "%s", "email_verified": true, "phone_verified": false}', test_user_id::text, 'test@vecinoactivo.cl')::jsonb,
            'email',
            NOW(),
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
            test_user_id,
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
        
        RAISE NOTICE '✅ Usuario test creado con ID: %', test_user_id;
    ELSE
        RAISE NOTICE '⚠️ Usuario test ya existe';
    END IF;
END $$;

-- PASO 3: Verificar resultados
SELECT '🔍 VERIFICACIÓN DE USUARIOS CREADOS' as info;

SELECT 'Usuarios en auth.users:' as tabla;
SELECT 
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmado,
    role,
    created_at
FROM auth.users 
WHERE email IN ('admin@vecinoactivo.cl', 'test@vecinoactivo.cl')
ORDER BY created_at;

SELECT 'Usuarios en auth.identities:' as tabla;
SELECT 
    provider_id,
    user_id,
    provider,
    created_at
FROM auth.identities 
WHERE provider_id IN ('admin@vecinoactivo.cl', 'test@vecinoactivo.cl')
ORDER BY created_at;

SELECT 'Usuarios en public.users:' as tabla;
SELECT 
    id,
    email,
    name,
    username,
    verified,
    email_verified
FROM public.users 
WHERE email IN ('admin@vecinoactivo.cl', 'test@vecinoactivo.cl')
ORDER BY created_at;

-- PASO 4: Mostrar credenciales
SELECT '🔑 CREDENCIALES PARA LOGIN:' as info;
SELECT 
    'admin@vecinoactivo.cl' as email,
    'admin123' as password,
    'Administrador del sistema' as descripcion
UNION ALL
SELECT 
    'test@vecinoactivo.cl' as email,
    'test123' as password,
    'Usuario de prueba' as descripcion;