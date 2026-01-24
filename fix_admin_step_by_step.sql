-- SOLUCIÓN PASO A PASO: Usuario administrador no encontrado
-- Ejecutar cada sección por separado en Supabase SQL Editor

-- ============================================
-- PASO 1: VERIFICAR ESTADO ACTUAL
-- ============================================

-- Ver si la columna username existe
SELECT 
    CASE WHEN COUNT(*) > 0 THEN 'La columna username YA EXISTE' ELSE 'La columna username NO EXISTE - necesita ser creada' END as estado
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'username';

-- Ver usuarios actuales
SELECT COUNT(*) as total_usuarios FROM public.users;

-- Buscar si el administrador ya existe
SELECT 
    CASE WHEN COUNT(*) > 0 THEN 'Usuario administrador YA EXISTE' ELSE 'Usuario administrador NO EXISTE - necesita ser creado' END as estado
FROM public.users 
WHERE email = 'admin@vecinoactivo.cl' OR name = 'Administrador';

-- ============================================
-- PASO 2: AGREGAR COLUMNA USERNAME (si no existe)
-- ============================================

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Verificar que se agregó
SELECT 'Columna username agregada correctamente' as resultado;

-- ============================================
-- PASO 3: GENERAR USERNAMES PARA USUARIOS EXISTENTES
-- ============================================

UPDATE public.users 
SET username = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '.', ''), 'ñ', 'n'))
WHERE username IS NULL;

-- Ver cuántos usuarios se actualizaron
SELECT 
    COUNT(*) as usuarios_con_username,
    'usernames generados automáticamente' as resultado
FROM public.users 
WHERE username IS NOT NULL;

-- ============================================
-- PASO 4: CREAR USUARIO ADMINISTRADOR
-- ============================================

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
) 
SELECT 
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
WHERE NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = 'admin@vecinoactivo.cl' 
    OR username = 'administrador' 
    OR name = 'Administrador'
);

-- Verificar que se creó
SELECT 
    CASE WHEN COUNT(*) > 0 THEN 'Usuario administrador CREADO EXITOSAMENTE' ELSE 'ERROR: Usuario administrador NO se pudo crear' END as resultado
FROM public.users 
WHERE username = 'administrador';

-- ============================================
-- PASO 5: CREAR USUARIOS DE DEMOSTRACIÓN
-- ============================================

-- María González
INSERT INTO public.users (
    id, email, name, username, avatar, bio, verified, email_verified,
    neighborhood_name, neighborhood_code, created_at, updated_at
) 
SELECT 
    gen_random_uuid(), 'maria@vecinoactivo.cl', 'María González', 'maria-gonzalez',
    'https://i.pravatar.cc/150?img=5', 'Vecina activa de Las Condes.',
    FALSE, TRUE, 'Las Condes Centro', 'LC-001', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'maria@vecinoactivo.cl');

-- Carlos Rodríguez
INSERT INTO public.users (
    id, email, name, username, avatar, bio, verified, email_verified,
    neighborhood_name, neighborhood_code, created_at, updated_at
) 
SELECT 
    gen_random_uuid(), 'carlos@vecinoactivo.cl', 'Carlos Rodríguez', 'carlos-rodriguez',
    'https://i.pravatar.cc/150?img=8', 'Ingeniero y padre de familia.',
    FALSE, TRUE, 'Providencia Norte', 'PR-002', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'carlos@vecinoactivo.cl');

-- Ana Martínez
INSERT INTO public.users (
    id, email, name, username, avatar, bio, verified, email_verified,
    neighborhood_name, neighborhood_code, created_at, updated_at
) 
SELECT 
    gen_random_uuid(), 'ana@vecinoactivo.cl', 'Ana Martínez', 'ana-martinez',
    'https://i.pravatar.cc/150?img=9', 'Profesora y activista comunitaria.',
    TRUE, TRUE, 'Ñuñoa Centro', 'NU-003', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'ana@vecinoactivo.cl');

-- ============================================
-- PASO 6: VERIFICACIÓN FINAL
-- ============================================

-- Mostrar todos los usuarios creados
SELECT 
    name as "Nombre",
    username as "Username",
    email as "Email",
    CASE WHEN verified THEN '✅ Verificado' ELSE '❌ No verificado' END as "Estado",
    neighborhood_name as "Vecindario"
FROM public.users
WHERE username IN ('administrador', 'maria-gonzalez', 'carlos-rodriguez', 'ana-martinez')
ORDER BY name;

-- Verificar que la columna username existe y funciona
SELECT 
    'VERIFICACIÓN FINAL:' as titulo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username')
        AND EXISTS (SELECT 1 FROM public.users WHERE username = 'administrador')
        THEN '🎉 TODO CORRECTO - El usuario administrador está disponible en /administrador'
        ELSE '❌ ALGO FALLÓ - Revisar los pasos anteriores'
    END as resultado;

-- URLs disponibles
SELECT 
    'URLs de perfil disponibles:' as titulo,
    CONCAT('vecinoactivo.cl/', username) as url
FROM public.users
WHERE username IN ('administrador', 'maria-gonzalez', 'carlos-rodriguez', 'ana-martinez')
ORDER BY username;