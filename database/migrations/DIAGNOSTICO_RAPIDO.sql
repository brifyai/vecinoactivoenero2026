-- DIAGNÓSTICO RÁPIDO: Ver exactamente qué está pasando

-- 1. ¿Existe el usuario en auth.users?
SELECT 'USUARIO EN AUTH.USERS:' as info;
SELECT 
    COUNT(*) as existe,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Usuario existe'
        ELSE '❌ Usuario NO existe'
    END as estado
FROM auth.users 
WHERE email = 'admin@vecinoactivo.cl';

-- 2. ¿Existe el usuario en public.users?
SELECT 'USUARIO EN PUBLIC.USERS:' as info;
SELECT 
    COUNT(*) as existe,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Usuario existe'
        ELSE '❌ Usuario NO existe'
    END as estado
FROM public.users 
WHERE email = 'admin@vecinoactivo.cl';

-- 3. Detalles del usuario en auth.users (si existe)
SELECT 'DETALLES AUTH.USERS:' as info;
SELECT 
    email,
    email_confirmed_at IS NOT NULL as email_confirmado,
    encrypted_password IS NOT NULL as tiene_password,
    role,
    aud,
    created_at
FROM auth.users 
WHERE email = 'admin@vecinoactivo.cl';

-- 4. ¿Los IDs coinciden?
SELECT 'COINCIDENCIA DE IDs:' as info;
SELECT 
    au.id as auth_id,
    pu.id as public_id,
    au.id = pu.id as coinciden
FROM auth.users au
FULL OUTER JOIN public.users pu ON au.email = pu.email
WHERE au.email = 'admin@vecinoactivo.cl' OR pu.email = 'admin@vecinoactivo.cl';

-- 5. Probar hash de contraseña
DO $$
DECLARE
    hash_actual TEXT;
    password_correcta BOOLEAN;
BEGIN
    SELECT encrypted_password INTO hash_actual 
    FROM auth.users 
    WHERE email = 'admin@vecinoactivo.cl';
    
    IF hash_actual IS NOT NULL THEN
        password_correcta := (hash_actual = crypt('admin123', hash_actual));
        RAISE NOTICE 'CONTRASEÑA: %', CASE WHEN password_correcta THEN '✅ Correcta' ELSE '❌ Incorrecta' END;
    ELSE
        RAISE NOTICE 'CONTRASEÑA: ❌ No hay hash almacenado';
    END IF;
END $$;