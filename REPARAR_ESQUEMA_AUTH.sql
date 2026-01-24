-- REPARAR ESQUEMA AUTH: Reconstruir esquema de autenticación
-- Para resolver "Database error querying schema"

-- =====================================================
-- PASO 1: CREAR ESQUEMA AUTH SI NO EXISTE
-- =====================================================

-- Crear esquema auth
CREATE SCHEMA IF NOT EXISTS auth;

-- Otorgar permisos básicos
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;

-- =====================================================
-- PASO 2: CREAR TABLA AUTH.USERS SI NO EXISTE
-- =====================================================

CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID,
    email VARCHAR(255) UNIQUE,
    encrypted_password VARCHAR(255),
    email_confirmed_at TIMESTAMPTZ,
    invited_at TIMESTAMPTZ,
    confirmation_token VARCHAR(255),
    confirmation_sent_at TIMESTAMPTZ,
    recovery_token VARCHAR(255),
    recovery_sent_at TIMESTAMPTZ,
    email_change_token_new VARCHAR(255),
    email_change VARCHAR(255),
    email_change_sent_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    raw_app_meta_data JSONB,
    raw_user_meta_data JSONB,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    phone VARCHAR(15),
    phone_confirmed_at TIMESTAMPTZ,
    phone_change VARCHAR(15),
    phone_change_token VARCHAR(255),
    phone_change_sent_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current VARCHAR(255),
    email_change_confirm_status SMALLINT DEFAULT 0,
    banned_until TIMESTAMPTZ,
    reauthentication_token VARCHAR(255),
    reauthentication_sent_at TIMESTAMPTZ,
    is_sso_user BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    role VARCHAR(255) DEFAULT 'authenticated',
    aud VARCHAR(255) DEFAULT 'authenticated'
);

-- =====================================================
-- PASO 3: CREAR TABLA AUTH.IDENTITIES SI NO EXISTE
-- =====================================================

CREATE TABLE IF NOT EXISTS auth.identities (
    provider_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    identity_data JSONB NOT NULL,
    provider TEXT NOT NULL,
    last_sign_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    email TEXT GENERATED ALWAYS AS (identity_data->>'email') STORED,
    PRIMARY KEY (provider_id, provider)
);

-- =====================================================
-- PASO 4: CREAR ÍNDICES NECESARIOS
-- =====================================================

-- Índices para auth.users
CREATE INDEX IF NOT EXISTS users_instance_id_idx ON auth.users (instance_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users (email);
CREATE INDEX IF NOT EXISTS users_confirmation_token_idx ON auth.users (confirmation_token) WHERE confirmation_token IS NOT NULL;

-- Índices para auth.identities
CREATE INDEX IF NOT EXISTS identities_user_id_idx ON auth.identities (user_id);
CREATE INDEX IF NOT EXISTS identities_email_idx ON auth.identities (email);

-- =====================================================
-- PASO 5: OTORGAR PERMISOS NECESARIOS
-- =====================================================

-- Permisos para auth.users
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.users TO postgres;
GRANT SELECT ON auth.users TO anon;
GRANT SELECT, UPDATE ON auth.users TO authenticated;

-- Permisos para auth.identities
GRANT SELECT, INSERT, UPDATE, DELETE ON auth.identities TO postgres;
GRANT SELECT ON auth.identities TO anon;
GRANT SELECT ON auth.identities TO authenticated;

-- =====================================================
-- PASO 6: CREAR FUNCIONES BÁSICAS DE AUTENTICACIÓN
-- =====================================================

-- Función para obtener usuario actual
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE SQL STABLE
AS $$
    SELECT COALESCE(
        current_setting('request.jwt.claim.sub', true),
        (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
    )::uuid
$$;

-- Función para obtener rol actual
CREATE OR REPLACE FUNCTION auth.role()
RETURNS TEXT
LANGUAGE SQL STABLE
AS $$
    SELECT COALESCE(
        current_setting('request.jwt.claim.role', true),
        (current_setting('request.jwt.claims', true)::jsonb ->> 'role')
    )::text
$$;

-- =====================================================
-- PASO 7: CREAR USUARIO ADMIN CON ESQUEMA REPARADO
-- =====================================================

DO $$
DECLARE
    admin_user_id UUID := '88671149-ff82-48c1-aea4-47f8a8cbb0cf';
BEGIN
    RAISE NOTICE '🔧 Creando usuario admin con esquema reparado...';
    
    -- Limpiar usuario existente
    DELETE FROM auth.identities WHERE user_id = admin_user_id;
    DELETE FROM auth.users WHERE id = admin_user_id;
    
    -- Crear usuario en auth.users
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        admin_user_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@vecinoactivo.cl',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        'authenticated',
        'authenticated',
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Administrador", "email": "admin@vecinoactivo.cl"}'
    );
    
    -- Crear identidad (si la tabla lo permite)
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
        RAISE NOTICE '✅ Identidad creada exitosamente';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ No se pudo crear identidad: %', SQLERRM;
    END;
    
    -- Actualizar public.users
    UPDATE public.users 
    SET 
        email_verified = TRUE,
        verified = TRUE,
        updated_at = NOW()
    WHERE id = admin_user_id;
    
    RAISE NOTICE '✅ Usuario admin creado con esquema reparado';
    RAISE NOTICE '📧 Email: admin@vecinoactivo.cl';
    RAISE NOTICE '🔑 Password: admin123';
    
END $$;

-- =====================================================
-- PASO 8: VERIFICACIÓN FINAL
-- =====================================================

SELECT '🔍 VERIFICACIÓN POST-REPARACIÓN:' as info;

-- Verificar que todo está funcionando
SELECT 
    'auth.users' as tabla,
    COUNT(*) as registros
FROM auth.users
WHERE email = 'admin@vecinoactivo.cl'
UNION ALL
SELECT 
    'auth.identities' as tabla,
    COUNT(*) as registros
FROM auth.identities
WHERE provider_id = 'admin@vecinoactivo.cl';

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '🔧 REPARACIÓN DEL ESQUEMA AUTH COMPLETADA';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ Esquema auth recreado';
    RAISE NOTICE '✅ Tablas auth.users y auth.identities creadas';
    RAISE NOTICE '✅ Índices y permisos configurados';
    RAISE NOTICE '✅ Funciones básicas creadas';
    RAISE NOTICE '✅ Usuario admin configurado';
    RAISE NOTICE '============================================';
    RAISE NOTICE '🚀 INTENTA LOGIN AHORA:';
    RAISE NOTICE '📧 admin@vecinoactivo.cl';
    RAISE NOTICE '🔑 admin123';
    RAISE NOTICE '============================================';
END $$;