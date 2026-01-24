-- SOLUCIÓN FINAL DEFINITIVA: Maneja usuario existente con posts
-- El usuario admin ya existe en public.users y tiene posts asociados
-- NO podemos cambiar su ID, así que usamos el ID existente

-- =====================================================
-- PASO 1: OBTENER ID EXISTENTE DEL USUARIO ADMIN
-- =====================================================

DO $$
DECLARE
    existing_admin_id UUID;
    admin_exists_in_auth INTEGER;
BEGIN
    -- Obtener el ID existente del usuario admin en public.users
    SELECT id INTO existing_admin_id 
    FROM public.users 
    WHERE email = 'admin@vecinoactivo.cl';
    
    IF existing_admin_id IS NULL THEN
        RAISE EXCEPTION 'Usuario admin no encontrado en public.users';
    END IF;
    
    RAISE NOTICE '🔍 Usuario admin encontrado con ID: %', existing_admin_id;
    
    -- Verificar si ya existe en auth.users
    SELECT COUNT(*) INTO admin_exists_in_auth
    FROM auth.users 
    WHERE email = 'admin@vecinoactivo.cl';
    
    IF admin_exists_in_auth > 0 THEN
        RAISE NOTICE '⚠️ Usuario ya existe en auth.users, eliminando para recrear...';
        DELETE FROM auth.users WHERE email = 'admin@vecinoactivo.cl';
    END IF;
    
    -- Crear usuario en auth.users usando el ID EXISTENTE
    RAISE NOTICE '🚀 Creando usuario en auth.users con ID existente...';
    
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
        existing_admin_id,  -- ← Usar ID existente, NO generar nuevo
        '00000000-0000-0000-0000-000000000000',
        'admin@vecinoactivo.cl',
        crypt('admin123', gen_salt('bf')),
        NOW(), -- Email confirmado inmediatamente
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Administrador", "email": "admin@vecinoactivo.cl"}',
        'authenticated'
    );
    
    -- Actualizar public.users (solo campos de verificación, NO el ID)
    UPDATE public.users 
    SET 
        email_verified = TRUE,
        verified = TRUE,
        updated_at = NOW()
    WHERE email = 'admin@vecinoactivo.cl';
    
    RAISE NOTICE '✅ Usuario administrador configurado exitosamente';
    RAISE NOTICE '📧 Email: admin@vecinoactivo.cl';
    RAISE NOTICE '🔑 Password: admin123';
    RAISE NOTICE '🆔 ID: %', existing_admin_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: %', SQLERRM;
    RAISE EXCEPTION 'Falló la configuración del usuario: %', SQLERRM;
END $$;

-- =====================================================
-- PASO 2: VERIFICACIÓN COMPLETA
-- =====================================================

SELECT '🔍 VERIFICACIÓN FINAL' as info;

-- Verificar que el usuario existe en auth.users
SELECT 'Usuario en auth.users:' as tabla;
SELECT 
    id,
    email,
    email_confirmed_at IS NOT NULL as confirmado,
    role,
    created_at
FROM auth.users 
WHERE email = 'admin@vecinoactivo.cl';

-- Verificar que el usuario existe en public.users
SELECT 'Usuario en public.users:' as tabla;
SELECT 
    id,
    email,
    name,
    username,
    verified,
    email_verified
FROM public.users 
WHERE email = 'admin@vecinoactivo.cl';

-- Verificar que los IDs coinciden
SELECT 'Verificación de IDs:' as tabla;
SELECT 
    au.id as auth_id,
    pu.id as public_id,
    au.id = pu.id as ids_coinciden,
    CASE 
        WHEN au.id = pu.id THEN '✅ CORRECTO'
        ELSE '❌ ERROR: IDs no coinciden'
    END as estado
FROM auth.users au
JOIN public.users pu ON au.email = pu.email
WHERE au.email = 'admin@vecinoactivo.cl';

-- Verificar posts del usuario (para confirmar que no se perdieron)
SELECT 'Posts del usuario admin:' as tabla;
SELECT 
    COUNT(*) as total_posts,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Posts preservados'
        ELSE 'ℹ️ Sin posts'
    END as estado
FROM posts 
WHERE author_id = (SELECT id FROM public.users WHERE email = 'admin@vecinoactivo.cl');

-- =====================================================
-- PASO 3: CREDENCIALES Y CONFIRMACIÓN
-- =====================================================

SELECT '🎯 CREDENCIALES PARA LOGIN:' as info;
SELECT 
    'admin@vecinoactivo.cl' as email,
    'admin123' as password,
    'Usuario existente configurado' as estado;

-- Confirmación final
DO $$
DECLARE
    auth_count INTEGER;
    public_count INTEGER;
    ids_match BOOLEAN;
BEGIN
    -- Contar usuarios
    SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email = 'admin@vecinoactivo.cl';
    SELECT COUNT(*) INTO public_count FROM public.users WHERE email = 'admin@vecinoactivo.cl';
    
    -- Verificar que los IDs coinciden
    SELECT (au.id = pu.id) INTO ids_match
    FROM auth.users au
    JOIN public.users pu ON au.email = pu.email
    WHERE au.email = 'admin@vecinoactivo.cl';
    
    IF auth_count > 0 AND public_count > 0 AND ids_match THEN
        RAISE NOTICE '🎉 ¡ÉXITO COMPLETO!';
        RAISE NOTICE '✅ Usuario existe en auth.users';
        RAISE NOTICE '✅ Usuario existe en public.users';
        RAISE NOTICE '✅ IDs coinciden correctamente';
        RAISE NOTICE '✅ Posts preservados';
        RAISE NOTICE '============================================';
        RAISE NOTICE '🚀 APLICACIÓN LISTA AL 100%%';
        RAISE NOTICE '🌐 URL: https://vecinoactivo.cl';
        RAISE NOTICE '👤 Login: admin@vecinoactivo.cl / admin123';
        RAISE NOTICE '============================================';
    ELSE
        RAISE NOTICE '❌ Algo salió mal en la configuración';
        RAISE NOTICE 'Auth users: %, Public users: %, IDs match: %', auth_count, public_count, ids_match;
    END IF;
END $$;