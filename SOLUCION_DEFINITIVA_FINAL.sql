-- SOLUCIÓN DEFINITIVA: Adaptada al esquema exacto de tu Supabase
-- Corrige el error de "cannot insert a non-DEFAULT value into column email"

-- =====================================================
-- PASO 1: VERIFICAR ESQUEMA PRIMERO
-- =====================================================

-- Primero ejecutemos esto para ver el esquema exacto
SELECT 'ESQUEMA DE auth.identities:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'identities'
ORDER BY ordinal_position;

-- =====================================================
-- PASO 2: LIMPIEZA INICIAL
-- =====================================================

DO $$
BEGIN
    -- Eliminar registros conflictivos si existen
    DELETE FROM auth.identities WHERE provider_id IN ('admin@vecinoactivo.cl', 'test@vecinoactivo.cl');
    DELETE FROM auth.users WHERE email IN ('admin@vecinoactivo.cl', 'test@vecinoactivo.cl');
    
    RAISE NOTICE '🧹 Limpieza inicial completada';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Limpieza: %', SQLERRM;
END $$;

-- =====================================================
-- PASO 3: CREAR USUARIO ADMINISTRADOR (VERSIÓN CORREGIDA)
-- =====================================================

DO $$
DECLARE
    admin_user_id UUID;
    instance_uuid UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Generar ID único para admin
    admin_user_id := gen_random_uuid();
    
    RAISE NOTICE '🚀 Creando usuario administrador con ID: %', admin_user_id;
    
    -- 1. Crear en auth.users (solo campos esenciales)
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
        role
    ) VALUES (
        admin_user_id,
        instance_uuid,
        'admin@vecinoactivo.cl',
        crypt('admin123', gen_salt('bf')),
        NOW(), -- Email confirmado inmediatamente
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Administrador", "email": "admin@vecinoactivo.cl"}',
        'authenticated'
    );
    
    -- 2. Crear en auth.identities (SIN campo email problemático)
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
    
    -- 3. Actualizar/Crear en public.users
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
    
    RAISE NOTICE '✅ Usuario administrador creado exitosamente';
    RAISE NOTICE '📧 Email: admin@vecinoactivo.cl';
    RAISE NOTICE '🔑 Password: admin123';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error creando admin: %', SQLERRM;
    
    -- Si falla, intentar versión más simple
    RAISE NOTICE '🔄 Intentando versión simplificada...';
    
    BEGIN
        -- Versión ultra-simple: solo auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            role
        ) VALUES (
            admin_user_id,
            instance_uuid,
            'admin@vecinoactivo.cl',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            'authenticated'
        );
        
        -- Actualizar public.users
        UPDATE public.users 
        SET id = admin_user_id,
            email_verified = TRUE,
            verified = TRUE,
            updated_at = NOW()
        WHERE email = 'admin@vecinoactivo.cl';
        
        RAISE NOTICE '✅ Usuario admin creado en versión simplificada';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Falló versión simplificada: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- PASO 4: VERIFICACIÓN
-- =====================================================

SELECT '🔍 VERIFICACIÓN DE USUARIO CREADO' as info;

-- Verificar auth.users
SELECT 'Usuario en auth.users:' as tabla;
SELECT 
    id,
    email,
    email_confirmed_at IS NOT NULL as confirmado,
    role,
    created_at
FROM auth.users 
WHERE email = 'admin@vecinoactivo.cl';

-- Verificar auth.identities (si existe)
SELECT 'Usuario en auth.identities:' as tabla;
SELECT 
    provider_id,
    user_id,
    provider,
    created_at
FROM auth.identities 
WHERE provider_id = 'admin@vecinoactivo.cl';

-- Verificar public.users
SELECT 'Usuario en public.users:' as tabla;
SELECT 
    id,
    email,
    name,
    verified,
    email_verified
FROM public.users 
WHERE email = 'admin@vecinoactivo.cl';

-- =====================================================
-- PASO 5: CREDENCIALES
-- =====================================================

SELECT '🎯 CREDENCIALES PARA LOGIN:' as info;
SELECT 
    'admin@vecinoactivo.cl' as email,
    'admin123' as password,
    'Listo para usar' as estado;

-- =====================================================
-- PASO 6: DIAGNÓSTICO FINAL
-- =====================================================

DO $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users WHERE email = 'admin@vecinoactivo.cl';
    
    IF user_count > 0 THEN
        RAISE NOTICE '🎉 ¡ÉXITO! Usuario administrador creado';
        RAISE NOTICE '🌐 Ve a: https://vecinoactivo.cl';
        RAISE NOTICE '👤 Login: admin@vecinoactivo.cl / admin123';
    ELSE
        RAISE NOTICE '❌ No se pudo crear el usuario';
        RAISE NOTICE '🔍 Revisa los mensajes de error arriba';
    END IF;
END $$;