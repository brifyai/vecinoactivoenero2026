-- RESPALDO SIMPLE: Si todo lo demás falla, esto funcionará
-- Usa el usuario existente tal como está

-- Paso 1: Obtener ID del usuario existente
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Obtener ID del usuario admin existente
    SELECT id INTO user_id FROM public.users WHERE email = 'admin@vecinoactivo.cl';
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario admin no encontrado';
    END IF;
    
    -- Limpiar auth.users si existe
    DELETE FROM auth.users WHERE email = 'admin@vecinoactivo.cl';
    
    -- Crear en auth.users con el ID existente
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
        user_id,  -- Usar ID existente
        '00000000-0000-0000-0000-000000000000',
        'admin@vecinoactivo.cl',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated'
    );
    
    -- Solo actualizar campos de verificación en public.users
    UPDATE public.users 
    SET email_verified = TRUE, verified = TRUE
    WHERE email = 'admin@vecinoactivo.cl';
    
    RAISE NOTICE '✅ Listo: admin@vecinoactivo.cl / admin123';
    
END $$;

-- Verificar
SELECT 'RESULTADO:' as info, email, role FROM auth.users WHERE email = 'admin@vecinoactivo.cl';