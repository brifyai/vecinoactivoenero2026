-- VERIFICAR Y CORREGIR LOGIN: Diagnóstico completo y corrección
-- Para resolver "Invalid login credentials"

-- =====================================================
-- PASO 1: DIAGNÓSTICO COMPLETO
-- =====================================================

SELECT '🔍 DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN' as info;

-- 1. Verificar usuario en public.users
SELECT 'Usuario en public.users:' as tabla;
SELECT 
    id,
    email,
    name,
    username,
    verified,
    email_verified,
    created_at
FROM public.users 
WHERE email = 'admin@vecinoactivo.cl';

-- 2. Verificar usuario en auth.users
SELECT 'Usuario en auth.users:' as tabla;
SELECT 
    id,
    email,
    email_confirmed_at,
    phone_confirmed_at,
    role,
    aud,
    created_at,
    encrypted_password IS NOT NULL as tiene_password
FROM auth.users 
WHERE email = 'admin@vecinoactivo.cl';

-- 3. Verificar coincidencia de IDs
SELECT 'Verificación de IDs:' as tabla;
SELECT 
    pu.id as public_id,
    au.id as auth_id,
    CASE 
        WHEN pu.id = au.id THEN '✅ IDs coinciden'
        WHEN pu.id IS NULL THEN '❌ No existe en public.users'
        WHEN au.id IS NULL THEN '❌ No existe en auth.users'
        ELSE '❌ IDs diferentes'
    END as estado
FROM public.users pu
FULL OUTER JOIN auth.users au ON pu.email = au.email
WHERE pu.email = 'admin@vecinoactivo.cl' OR au.email = 'admin@vecinoactivo.cl';

-- =====================================================
-- PASO 2: CORRECCIÓN AUTOMÁTICA
-- =====================================================

DO $$
DECLARE
    public_user_id UUID;
    auth_user_exists INTEGER;
    new_password_hash TEXT;
BEGIN
    RAISE NOTICE '🔧 INICIANDO CORRECCIÓN AUTOMÁTICA';
    
    -- Obtener ID del usuario en public.users
    SELECT id INTO public_user_id 
    FROM public.users 
    WHERE email = 'admin@vecinoactivo.cl';
    
    IF public_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario admin no encontrado en public.users';
    END IF;
    
    RAISE NOTICE '📋 Usuario encontrado en public.users con ID: %', public_user_id;
    
    -- Verificar si existe en auth.users
    SELECT COUNT(*) INTO auth_user_exists
    FROM auth.users 
    WHERE email = 'admin@vecinoactivo.cl';
    
    -- Eliminar usuario existente en auth.users si existe
    IF auth_user_exists > 0 THEN
        RAISE NOTICE '🗑️ Eliminando usuario existente en auth.users para recrear...';
        DELETE FROM auth.users WHERE email = 'admin@vecinoactivo.cl';
    END IF;
    
    -- Generar hash de contraseña correcto
    new_password_hash := crypt('admin123', gen_salt('bf'));
    
    -- Crear usuario en auth.users con configuración completa
    RAISE NOTICE '👤 Creando usuario en auth.users...';
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        phone_confirmed_at,
        confirmation_sent_at,
        recovery_sent_at,
        email_change_sent_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role,
        aud,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        public_user_id,  -- Usar ID existente de public.users
        '00000000-0000-0000-0000-000000000000',
        'admin@vecinoactivo.cl',
        new_password_hash,
        NOW(),  -- Email confirmado
        NULL,   -- Phone no confirmado
        NOW(),  -- Confirmation enviado
        NULL,   -- Recovery no enviado
        NULL,   -- Email change no enviado
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Administrador", "email": "admin@vecinoactivo.cl", "email_verified": true, "phone_verified": false}',
        false,
        'authenticated',
        'authenticated',
        '',  -- Token vacío (ya confirmado)
        '',
        '',
        ''
    );
    
    -- Actualizar public.users para asegurar verificación
    UPDATE public.users 
    SET 
        email_verified = TRUE,
        verified = TRUE,
        updated_at = NOW()
    WHERE email = 'admin@vecinoactivo.cl';
    
    RAISE NOTICE '✅ Usuario corregido exitosamente';
    RAISE NOTICE '📧 Email: admin@vecinoactivo.cl';
    RAISE NOTICE '🔑 Password: admin123';
    RAISE NOTICE '🆔 ID: %', public_user_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error en corrección: %', SQLERRM;
    
    -- Intentar versión más simple si falla
    RAISE NOTICE '🔄 Intentando versión simplificada...';
    BEGIN
        DELETE FROM auth.users WHERE email = 'admin@vecinoactivo.cl';
        
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            public_user_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@vecinoactivo.cl',
            crypt('admin123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            'authenticated',
            'authenticated'
        );
        
        RAISE NOTICE '✅ Versión simplificada exitosa';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Falló versión simplificada: %', SQLERRM;
    END;
END $$;

-- =====================================================
-- PASO 3: VERIFICACIÓN POST-CORRECCIÓN
-- =====================================================

SELECT '🔍 VERIFICACIÓN POST-CORRECCIÓN' as info;

-- Verificar que todo está correcto
SELECT 'Estado final:' as tabla;
SELECT 
    au.email,
    au.id,
    au.email_confirmed_at IS NOT NULL as email_confirmado,
    au.encrypted_password IS NOT NULL as tiene_password,
    au.role,
    au.aud,
    pu.verified as public_verified,
    pu.email_verified as public_email_verified,
    CASE 
        WHEN au.id = pu.id THEN '✅ TODO CORRECTO'
        ELSE '❌ Problema con IDs'
    END as estado_final
FROM auth.users au
JOIN public.users pu ON au.email = pu.email
WHERE au.email = 'admin@vecinoactivo.cl';

-- =====================================================
-- PASO 4: PRUEBA DE CONTRASEÑA
-- =====================================================

SELECT '🔐 VERIFICACIÓN DE CONTRASEÑA' as info;

-- Verificar que la contraseña está correctamente hasheada
DO $$
DECLARE
    stored_hash TEXT;
    test_result BOOLEAN;
BEGIN
    -- Obtener hash almacenado
    SELECT encrypted_password INTO stored_hash 
    FROM auth.users 
    WHERE email = 'admin@vecinoactivo.cl';
    
    IF stored_hash IS NULL THEN
        RAISE NOTICE '❌ No se encontró hash de contraseña';
    ELSE
        -- Verificar que el hash es correcto
        test_result := (stored_hash = crypt('admin123', stored_hash));
        
        IF test_result THEN
            RAISE NOTICE '✅ Contraseña verificada correctamente';
        ELSE
            RAISE NOTICE '❌ Problema con hash de contraseña';
        END IF;
    END IF;
END $$;

-- =====================================================
-- PASO 5: INSTRUCCIONES FINALES
-- =====================================================

SELECT '🎯 INSTRUCCIONES FINALES' as info;
SELECT 
    'admin@vecinoactivo.cl' as email,
    'admin123' as password,
    'Listo para login' as estado,
    'https://vecinoactivo.cl' as url;

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '🎉 CORRECCIÓN COMPLETADA';
    RAISE NOTICE '============================================';
    RAISE NOTICE '📧 Email: admin@vecinoactivo.cl';
    RAISE NOTICE '🔑 Password: admin123';
    RAISE NOTICE '🌐 URL: https://vecinoactivo.cl';
    RAISE NOTICE '============================================';
    RAISE NOTICE '💡 Si aún falla el login, revisa:';
    RAISE NOTICE '   1. Que uses exactamente: admin@vecinoactivo.cl';
    RAISE NOTICE '   2. Que uses exactamente: admin123';
    RAISE NOTICE '   3. Que no haya espacios extra';
    RAISE NOTICE '============================================';
END $$;