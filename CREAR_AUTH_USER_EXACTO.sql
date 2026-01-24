-- CREAR AUTH USER EXACTO: Usando el ID específico encontrado
-- ID del usuario existente: 88671149-ff82-48c1-aea4-47f8a8cbb0cf

DO $$
DECLARE
    user_id UUID := '88671149-ff82-48c1-aea4-47f8a8cbb0cf';
BEGIN
    RAISE NOTICE '🚀 Creando usuario en auth.users con ID exacto: %', user_id;
    
    -- Limpiar cualquier registro existente
    DELETE FROM auth.users WHERE email = 'admin@vecinoactivo.cl';
    
    -- Crear usuario en auth.users con el ID EXACTO de public.users
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
        user_id,  -- ID exacto del usuario existente
        '00000000-0000-0000-0000-000000000000',
        'admin@vecinoactivo.cl',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated'
    );
    
    -- Actualizar public.users para asegurar verificación
    UPDATE public.users 
    SET 
        email_verified = TRUE,
        verified = TRUE,
        updated_at = NOW()
    WHERE id = user_id;
    
    RAISE NOTICE '✅ Usuario creado exitosamente';
    RAISE NOTICE '📧 Email: admin@vecinoactivo.cl';
    RAISE NOTICE '🔑 Password: admin123';
    RAISE NOTICE '🆔 ID: %', user_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: %', SQLERRM;
END $$;

-- Verificar que se creó correctamente
SELECT '🔍 VERIFICACIÓN FINAL:' as info;
SELECT 
    au.id as auth_id,
    pu.id as public_id,
    au.email,
    au.email_confirmed_at IS NOT NULL as confirmado,
    au.role,
    CASE 
        WHEN au.id = pu.id THEN '✅ PERFECTO - IDs coinciden'
        ELSE '❌ ERROR - IDs no coinciden'
    END as estado
FROM auth.users au
JOIN public.users pu ON au.email = pu.email
WHERE au.email = 'admin@vecinoactivo.cl';

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '🎉 LISTO PARA LOGIN';
    RAISE NOTICE '============================================';
    RAISE NOTICE '📧 Email: admin@vecinoactivo.cl';
    RAISE NOTICE '🔑 Password: admin123';
    RAISE NOTICE '🌐 URL: https://vecinoactivo.cl';
    RAISE NOTICE '============================================';
END $$;