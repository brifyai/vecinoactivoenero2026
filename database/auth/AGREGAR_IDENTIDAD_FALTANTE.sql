-- AGREGAR IDENTIDAD FALTANTE: Crear registro en auth.identities
-- El usuario existe en auth.users pero falta en auth.identities

DO $$
DECLARE
    admin_user_id UUID := '88671149-ff82-48c1-aea4-47f8a8cbb0cf';
    user_exists INTEGER;
    identity_exists INTEGER;
BEGIN
    RAISE NOTICE '🔍 Verificando estado actual...';
    
    -- Verificar que el usuario existe en auth.users
    SELECT COUNT(*) INTO user_exists 
    FROM auth.users 
    WHERE id = admin_user_id AND email = 'admin@vecinoactivo.cl';
    
    -- Verificar si ya existe identidad
    SELECT COUNT(*) INTO identity_exists 
    FROM auth.identities 
    WHERE user_id = admin_user_id;
    
    RAISE NOTICE 'Usuario en auth.users: %', user_exists;
    RAISE NOTICE 'Identidad en auth.identities: %', identity_exists;
    
    IF user_exists = 0 THEN
        RAISE EXCEPTION 'Usuario no encontrado en auth.users';
    END IF;
    
    IF identity_exists > 0 THEN
        RAISE NOTICE '⚠️ Identidad ya existe, eliminando para recrear...';
        DELETE FROM auth.identities WHERE user_id = admin_user_id;
    END IF;
    
    -- Crear la identidad faltante
    RAISE NOTICE '🚀 Creando identidad en auth.identities...';
    
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
        jsonb_build_object(
            'sub', admin_user_id::text,
            'email', 'admin@vecinoactivo.cl',
            'email_verified', true,
            'phone_verified', false,
            'aud', 'authenticated',
            'role', 'authenticated'
        ),
        'email',
        NOW(),
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Identidad creada exitosamente';
    RAISE NOTICE '📧 Email: admin@vecinoactivo.cl';
    RAISE NOTICE '🔑 Password: admin123';
    RAISE NOTICE '🆔 User ID: %', admin_user_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: %', SQLERRM;
    
    -- Intentar versión más simple si falla
    RAISE NOTICE '🔄 Intentando versión simplificada...';
    BEGIN
        INSERT INTO auth.identities (
            provider_id,
            user_id,
            identity_data,
            provider,
            created_at,
            updated_at
        ) VALUES (
            'admin@vecinoactivo.cl',
            admin_user_id,
            '{"sub": "' || admin_user_id || '", "email": "admin@vecinoactivo.cl", "email_verified": true}',
            'email',
            NOW(),
            NOW()
        );
        RAISE NOTICE '✅ Identidad creada con versión simplificada';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Falló versión simplificada: %', SQLERRM;
    END;
END $$;

-- Verificar que se creó correctamente
SELECT '🔍 VERIFICACIÓN FINAL:' as info;

SELECT 
    'auth.users' as tabla,
    COUNT(*) as registros,
    email
FROM auth.users 
WHERE email = 'admin@vecinoactivo.cl'
GROUP BY email
UNION ALL
SELECT 
    'auth.identities' as tabla,
    COUNT(*) as registros,
    provider_id as email
FROM auth.identities 
WHERE provider_id = 'admin@vecinoactivo.cl'
GROUP BY provider_id;

-- Verificar integridad completa
SELECT 'Verificación de integridad:' as info;
SELECT 
    au.email,
    au.id as auth_id,
    ai.user_id as identity_user_id,
    au.id = ai.user_id as ids_coinciden,
    CASE 
        WHEN au.id = ai.user_id THEN '✅ PERFECTO - Listo para login'
        ELSE '❌ ERROR - IDs no coinciden'
    END as estado
FROM auth.users au
LEFT JOIN auth.identities ai ON au.id = ai.user_id
WHERE au.email = 'admin@vecinoactivo.cl';

-- Mensaje final
DO $$
DECLARE
    user_count INTEGER;
    identity_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users WHERE email = 'admin@vecinoactivo.cl';
    SELECT COUNT(*) INTO identity_count FROM auth.identities WHERE provider_id = 'admin@vecinoactivo.cl';
    
    RAISE NOTICE '============================================';
    RAISE NOTICE '🔧 REPARACIÓN DE IDENTIDAD COMPLETADA';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Usuarios en auth.users: %', user_count;
    RAISE NOTICE 'Identidades en auth.identities: %', identity_count;
    
    IF user_count > 0 AND identity_count > 0 THEN
        RAISE NOTICE '🎉 ¡ÉXITO! Ambas tablas tienen registros';
        RAISE NOTICE '🚀 LOGIN DEBERÍA FUNCIONAR AHORA';
        RAISE NOTICE '============================================';
        RAISE NOTICE '📧 Email: admin@vecinoactivo.cl';
        RAISE NOTICE '🔑 Password: admin123';
        RAISE NOTICE '🌐 URL: https://vecinoactivo.cl';
        RAISE NOTICE '============================================';
    ELSE
        RAISE NOTICE '❌ Aún hay problemas con los registros';
    END IF;
END $$;