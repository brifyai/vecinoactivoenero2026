-- Script completo para solucionar el problema del usuario administrador
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- PASO 1: AGREGAR COLUMNA USERNAME SI NO EXISTE
-- ============================================

DO $$
BEGIN
    -- Verificar si la columna username existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'username'
    ) THEN
        -- Agregar la columna username
        ALTER TABLE public.users 
        ADD COLUMN username VARCHAR(50) UNIQUE;
        
        RAISE NOTICE '✅ Columna username agregada exitosamente';
        
        -- Crear índice para la columna username
        CREATE INDEX idx_users_username ON public.users(username);
        RAISE NOTICE '✅ Índice para username creado';
        
    ELSE
        RAISE NOTICE 'ℹ️ La columna username ya existe';
    END IF;
END $$;

-- ============================================
-- PASO 2: GENERAR USERNAMES PARA USUARIOS EXISTENTES
-- ============================================

DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Generar usernames para usuarios que no los tengan
    UPDATE public.users 
    SET username = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '.', ''), 'ñ', 'n'))
    WHERE username IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '✅ Usernames generados para % usuarios existentes', updated_count;
END $$;

-- ============================================
-- PASO 3: CREAR USUARIO ADMINISTRADOR
-- ============================================

DO $$
DECLARE
    admin_exists INTEGER;
BEGIN
    -- Verificar si el usuario administrador existe
    SELECT COUNT(*) INTO admin_exists 
    FROM public.users 
    WHERE email = 'admin@vecinoactivo.cl' OR username = 'administrador' OR name = 'Administrador';
    
    IF admin_exists = 0 THEN
        -- Insertar usuario administrador
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
            gen_random_uuid(),
            'admin@vecinoactivo.cl',
            'Administrador',
            'administrador',
            'https://i.pravatar.cc/150?img=1',
            'Administrador del sistema Vecino Activo. Aquí para ayudar a la comunidad.',
            TRUE,
            TRUE,
            'Administración Central',
            'ADM-001',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ Usuario administrador creado exitosamente';
    ELSE
        RAISE NOTICE 'ℹ️ Usuario administrador ya existe';
    END IF;
END $$;

-- ============================================
-- PASO 4: CREAR ALGUNOS USUARIOS DE DEMOSTRACIÓN
-- ============================================

DO $$
BEGIN
    -- Usuario María González
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'maria@vecinoactivo.cl') THEN
        INSERT INTO public.users (
            id, email, name, username, avatar, bio, verified, email_verified,
            neighborhood_name, neighborhood_code, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), 'maria@vecinoactivo.cl', 'María González', 'maria-gonzalez',
            'https://i.pravatar.cc/150?img=5', 'Vecina activa de Las Condes. Me encanta organizar eventos comunitarios.',
            FALSE, TRUE, 'Las Condes Centro', 'LC-001', NOW(), NOW()
        );
        RAISE NOTICE '✅ Usuario María González creado';
    END IF;
    
    -- Usuario Carlos Rodríguez
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'carlos@vecinoactivo.cl') THEN
        INSERT INTO public.users (
            id, email, name, username, avatar, bio, verified, email_verified,
            neighborhood_name, neighborhood_code, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), 'carlos@vecinoactivo.cl', 'Carlos Rodríguez', 'carlos-rodriguez',
            'https://i.pravatar.cc/150?img=8', 'Ingeniero y padre de familia. Siempre dispuesto a ayudar a mis vecinos.',
            FALSE, TRUE, 'Providencia Norte', 'PR-002', NOW(), NOW()
        );
        RAISE NOTICE '✅ Usuario Carlos Rodríguez creado';
    END IF;
    
    -- Usuario Ana Martínez
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'ana@vecinoactivo.cl') THEN
        INSERT INTO public.users (
            id, email, name, username, avatar, bio, verified, email_verified,
            neighborhood_name, neighborhood_code, created_at, updated_at
        ) VALUES (
            gen_random_uuid(), 'ana@vecinoactivo.cl', 'Ana Martínez', 'ana-martinez',
            'https://i.pravatar.cc/150?img=9', 'Profesora y activista comunitaria. Trabajando por un barrio mejor.',
            TRUE, TRUE, 'Ñuñoa Centro', 'NU-003', NOW(), NOW()
        );
        RAISE NOTICE '✅ Usuario Ana Martínez creado';
    END IF;
END $$;

-- ============================================
-- PASO 5: VERIFICACIÓN FINAL
-- ============================================

-- Mostrar estructura de la tabla users
SELECT 'Estructura de la tabla users:' as info, NULL::text as detail
UNION ALL
SELECT column_name, CONCAT(data_type, CASE WHEN is_nullable = 'YES' THEN ' (nullable)' ELSE ' (not null)' END)
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'users'
ORDER BY info, detail;

-- Mostrar usuarios creados
SELECT 'Usuarios disponibles:' as info;
SELECT 
    CONCAT(name, ' (@', username, ')') as usuario,
    email,
    CASE WHEN verified THEN 'Verificado' ELSE 'No verificado' END as estado,
    neighborhood_name,
    created_at::date as fecha_creacion
FROM public.users
ORDER BY created_at DESC;

-- Verificar específicamente el usuario administrador
SELECT 'Usuario administrador encontrado:' as info;
SELECT 
    name,
    username,
    email,
    CASE WHEN verified THEN 'Verificado' ELSE 'No verificado' END as estado,
    bio,
    neighborhood_name
FROM public.users 
WHERE username = 'administrador' OR email = 'admin@vecinoactivo.cl';

-- Mensaje final
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.users WHERE username = 'administrador') THEN
        RAISE NOTICE '🎉 ¡Script completado exitosamente! El usuario administrador está disponible.';
        RAISE NOTICE '🔗 Puedes acceder al perfil en: /administrador';
    ELSE
        RAISE NOTICE '❌ Error: El usuario administrador no fue creado correctamente.';
    END IF;
END $$;