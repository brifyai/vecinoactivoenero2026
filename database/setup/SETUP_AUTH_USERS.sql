-- =====================================================
-- CONFIGURACIÓN DE USUARIOS PARA AUTENTICACIÓN
-- Vecino Activo - Sistema de Login
-- =====================================================

-- Limpiar usuarios existentes (opcional - comentar si no quieres borrar)
-- DELETE FROM public.users WHERE email IN ('admin@vecinoactivo.cl', 'vecino@vecinoactivo.cl', 'usuario@vecinoactivo.cl');

-- =====================================================
-- CREAR USUARIOS DE PRUEBA
-- =====================================================

-- 1. Usuario Administrador (Unidad Vecinal)
INSERT INTO public.users (
    id,
    email,
    password,
    password_hash,
    name,
    username,
    role,
    avatar,
    verified,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@vecinoactivo.cl',
    'admin123',  -- Contraseña en texto plano (cambiar en producción)
    'admin123',  -- En producción usar: crypt('admin123', gen_salt('bf'))
    'Administrador Principal',
    'admin',
    'admin',
    'https://ui-avatars.com/api/?name=Admin&background=667eea&color=fff',
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
    password = 'admin123',
    password_hash = 'admin123',
    role = 'admin',
    verified = true,
    email_verified = true,
    updated_at = NOW();

-- 2. Usuario Vecino 1
INSERT INTO public.users (
    id,
    email,
    password,
    password_hash,
    name,
    username,
    role,
    avatar,
    bio,
    verified,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'vecino@vecinoactivo.cl',
    'vecino123',
    'vecino123',
    'Juan Pérez',
    'juanperez',
    'user',
    'https://ui-avatars.com/api/?name=Juan+Perez&background=10b981&color=fff',
    'Vecino activo de la comunidad',
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
    password = 'vecino123',
    password_hash = 'vecino123',
    role = 'user',
    verified = true,
    email_verified = true,
    updated_at = NOW();

-- 3. Usuario Vecino 2
INSERT INTO public.users (
    id,
    email,
    password,
    password_hash,
    name,
    username,
    role,
    avatar,
    bio,
    verified,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'maria@vecinoactivo.cl',
    'maria123',
    'maria123',
    'María González',
    'mariagonzalez',
    'user',
    'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=f59e0b&color=fff',
    'Me encanta participar en actividades comunitarias',
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
    password = 'maria123',
    password_hash = 'maria123',
    role = 'user',
    verified = true,
    email_verified = true,
    updated_at = NOW();

-- 4. Usuario Vecino 3
INSERT INTO public.users (
    id,
    email,
    password,
    password_hash,
    name,
    username,
    role,
    avatar,
    bio,
    verified,
    email_verified,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'carlos@vecinoactivo.cl',
    'carlos123',
    'carlos123',
    'Carlos Rodríguez',
    'carlosrodriguez',
    'user',
    'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=3b82f6&color=fff',
    'Organizador de eventos vecinales',
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
    password = 'carlos123',
    password_hash = 'carlos123',
    role = 'user',
    verified = true,
    email_verified = true,
    updated_at = NOW();

-- =====================================================
-- VERIFICAR USUARIOS CREADOS
-- =====================================================

SELECT 
    '✅ USUARIOS CREADOS EXITOSAMENTE' as status;

SELECT 
    id,
    email,
    name,
    username,
    role,
    verified,
    email_verified,
    created_at
FROM public.users
WHERE email IN (
    'admin@vecinoactivo.cl',
    'vecino@vecinoactivo.cl',
    'maria@vecinoactivo.cl',
    'carlos@vecinoactivo.cl'
)
ORDER BY role DESC, name;

-- =====================================================
-- CREDENCIALES PARA LOGIN
-- =====================================================

SELECT '🔐 CREDENCIALES DISPONIBLES:' as info;

SELECT 
    CASE 
        WHEN role = 'admin' THEN '👑 ADMINISTRADOR (Unidad Vecinal)'
        ELSE '👤 VECINO'
    END as tipo,
    email,
    password as contraseña,
    name as nombre
FROM public.users
WHERE email IN (
    'admin@vecinoactivo.cl',
    'vecino@vecinoactivo.cl',
    'maria@vecinoactivo.cl',
    'carlos@vecinoactivo.cl'
)
ORDER BY role DESC, name;

-- =====================================================
-- INSTRUCCIONES
-- =====================================================

SELECT '📋 INSTRUCCIONES DE USO:' as info;
SELECT 
    '1. Ve a http://localhost:3000/iniciar-sesion' as paso_1,
    '2. Selecciona "Unidad Vecinal" o "Vecinos"' as paso_2,
    '3. Usa las credenciales de arriba' as paso_3,
    '4. ¡Listo para usar!' as paso_4;
