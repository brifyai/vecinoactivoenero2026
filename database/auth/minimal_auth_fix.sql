-- Script mínimo para crear usuario admin sin errores de esquema
-- Versión ultra-simple que funciona con cualquier versión de Supabase

-- PASO 1: Crear solo en auth.users (lo esencial)
DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- Generar ID único
    admin_id := gen_random_uuid();
    
    -- Crear usuario en auth.users
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
        admin_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@vecinoactivo.cl',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Administrador"}',
        'authenticated'
    );
    
    -- Actualizar public.users con el ID correcto
    UPDATE public.users 
    SET id = admin_id,
        email_verified = TRUE,
        verified = TRUE,
        updated_at = NOW()
    WHERE email = 'admin@vecinoactivo.cl';
    
    RAISE NOTICE '✅ Usuario admin creado con ID: %', admin_id;
    RAISE NOTICE '📧 Email: admin@vecinoactivo.cl';
    RAISE NOTICE '🔑 Password: admin123';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: %', SQLERRM;
END $$;

-- PASO 2: Verificar que se creó correctamente
SELECT 'VERIFICACIÓN:' as info;
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at IS NOT NULL as confirmado,
    pu.name,
    pu.username
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'admin@vecinoactivo.cl';

-- PASO 3: Instrucciones
SELECT '🎯 PRÓXIMO PASO:' as info;
SELECT 'Intenta hacer login con: admin@vecinoactivo.cl / admin123' as instruccion;