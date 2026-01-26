-- DIAGNÓSTICO PROFUNDO DEL ESQUEMA AUTH
-- Para resolver "Database error querying schema"

-- =====================================================
-- PASO 1: VERIFICAR EXISTENCIA DEL ESQUEMA AUTH
-- =====================================================

SELECT '🔍 VERIFICANDO ESQUEMA AUTH' as info;

-- Verificar que el esquema auth existe
SELECT 'Esquemas disponibles:' as info;
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name IN ('auth', 'public', 'storage')
ORDER BY schema_name;

-- =====================================================
-- PASO 2: VERIFICAR TABLAS DEL ESQUEMA AUTH
-- =====================================================

SELECT 'Tablas en esquema auth:' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'auth'
ORDER BY table_name;

-- =====================================================
-- PASO 3: VERIFICAR ESTRUCTURA DE TABLAS CRÍTICAS
-- =====================================================

-- Verificar auth.users
SELECT 'Estructura de auth.users:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'users'
ORDER BY ordinal_position;

-- Verificar auth.identities
SELECT 'Estructura de auth.identities:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'identities'
ORDER BY ordinal_position;

-- =====================================================
-- PASO 4: VERIFICAR PERMISOS Y ROLES
-- =====================================================

SELECT 'Roles y permisos:' as info;
SELECT 
    r.rolname,
    r.rolsuper,
    r.rolinherit,
    r.rolcreaterole,
    r.rolcreatedb,
    r.rolcanlogin
FROM pg_roles r
WHERE r.rolname IN ('postgres', 'supabase_admin', 'authenticator', 'anon', 'authenticated')
ORDER BY r.rolname;

-- =====================================================
-- PASO 5: VERIFICAR FUNCIONES DE AUTENTICACIÓN
-- =====================================================

SELECT 'Funciones de autenticación:' as info;
SELECT 
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines 
WHERE routine_schema = 'auth'
ORDER BY routine_name;

-- =====================================================
-- PASO 6: VERIFICAR DATOS EN TABLAS AUTH
-- =====================================================

-- Contar registros en auth.users
SELECT 'Registros en auth.users:' as info;
SELECT COUNT(*) as total_users FROM auth.users;

-- Contar registros en auth.identities
SELECT 'Registros en auth.identities:' as info;
SELECT COUNT(*) as total_identities FROM auth.identities;

-- =====================================================
-- PASO 7: VERIFICAR CONFIGURACIÓN DE SUPABASE
-- =====================================================

-- Verificar configuración de auth
SELECT 'Configuración de auth:' as info;
SELECT 
    name,
    setting,
    category,
    short_desc
FROM pg_settings 
WHERE name LIKE '%auth%' OR name LIKE '%jwt%'
ORDER BY name;

-- =====================================================
-- PASO 8: DIAGNÓSTICO DE ERRORES ESPECÍFICOS
-- =====================================================

DO $$
BEGIN
    -- Verificar que las tablas críticas existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
        RAISE NOTICE '❌ CRÍTICO: Tabla auth.users no existe';
    ELSE
        RAISE NOTICE '✅ Tabla auth.users existe';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'identities') THEN
        RAISE NOTICE '❌ CRÍTICO: Tabla auth.identities no existe';
    ELSE
        RAISE NOTICE '✅ Tabla auth.identities existe';
    END IF;
    
    -- Verificar permisos básicos
    BEGIN
        PERFORM 1 FROM auth.users LIMIT 1;
        RAISE NOTICE '✅ Permisos de lectura en auth.users OK';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ CRÍTICO: Sin permisos de lectura en auth.users: %', SQLERRM;
    END;
    
END $$;

-- =====================================================
-- PASO 9: MOSTRAR RESUMEN DEL DIAGNÓSTICO
-- =====================================================

SELECT '📋 RESUMEN DEL DIAGNÓSTICO:' as info;

DO $$
DECLARE
    auth_schema_exists BOOLEAN;
    users_table_exists BOOLEAN;
    identities_table_exists BOOLEAN;
    user_count INTEGER;
BEGIN
    -- Verificar esquema
    SELECT EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') INTO auth_schema_exists;
    
    -- Verificar tablas
    SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') INTO users_table_exists;
    SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'identities') INTO identities_table_exists;
    
    -- Contar usuarios
    IF users_table_exists THEN
        SELECT COUNT(*) INTO user_count FROM auth.users;
    ELSE
        user_count := 0;
    END IF;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DIAGNÓSTICO COMPLETO DEL ESQUEMA AUTH';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Esquema auth existe: %', CASE WHEN auth_schema_exists THEN '✅ SÍ' ELSE '❌ NO' END;
    RAISE NOTICE 'Tabla auth.users existe: %', CASE WHEN users_table_exists THEN '✅ SÍ' ELSE '❌ NO' END;
    RAISE NOTICE 'Tabla auth.identities existe: %', CASE WHEN identities_table_exists THEN '✅ SÍ' ELSE '❌ NO' END;
    RAISE NOTICE 'Usuarios en auth.users: %', user_count;
    RAISE NOTICE '============================================';
    
    IF NOT auth_schema_exists OR NOT users_table_exists THEN
        RAISE NOTICE '🚨 PROBLEMA CRÍTICO DETECTADO';
        RAISE NOTICE 'El esquema de autenticación está incompleto o dañado';
        RAISE NOTICE 'Se requiere reparación del esquema auth';
    ELSE
        RAISE NOTICE '✅ Esquema auth parece estar completo';
        RAISE NOTICE 'El problema puede ser de permisos o configuración';
    END IF;
    
END $$;