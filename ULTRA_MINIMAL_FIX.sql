-- ULTRA MINIMAL: Solo lo esencial para que funcione el login
-- Esta versión evita todos los campos problemáticos

-- Paso 1: Limpiar conflictos
DELETE FROM auth.users WHERE email = 'admin@vecinoactivo.cl';

-- Paso 2: Crear usuario mínimo en auth.users
DO $$
DECLARE
    admin_id UUID;
BEGIN
    admin_id := gen_random_uuid();
    
    -- Insertar solo campos obligatorios
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
        admin_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@vecinoactivo.cl',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated'
    );
    
    -- Actualizar public.users con el ID correcto
    UPDATE public.users 
    SET id = admin_id,
        email_verified = TRUE,
        verified = TRUE
    WHERE email = 'admin@vecinoactivo.cl';
    
    RAISE NOTICE '✅ Usuario creado: admin@vecinoactivo.cl / admin123';
    RAISE NOTICE '🚀 ID: %', admin_id;
    
END $$;

-- Paso 3: Verificar
SELECT 
    'VERIFICACIÓN:' as info,
    email,
    email_confirmed_at IS NOT NULL as confirmado,
    role
FROM auth.users 
WHERE email = 'admin@vecinoactivo.cl';