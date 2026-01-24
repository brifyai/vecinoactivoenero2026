-- SOLUCIÓN FINAL CORREGIDA: Usuario Administrador
-- Ejecutar en Supabase SQL Editor

-- PASO 1: Agregar columna username
ALTER TABLE public.users ADD COLUMN username VARCHAR(50);

-- PASO 2: Generar usernames para usuarios existentes
UPDATE public.users SET username = LOWER(REPLACE(name, ' ', '-')) WHERE username IS NULL;

-- PASO 3: Crear usuario administrador (CON PASSWORD)
INSERT INTO public.users (
    id,
    email,
    password,
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
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Administrador',
    'administrador',
    'https://i.pravatar.cc/150?img=1',
    'Administrador del sistema Vecino Activo',
    TRUE,
    TRUE,
    'Administración Central',
    'ADM-001',
    NOW(),
    NOW()
);

-- PASO 4: Crear algunos usuarios de demostración
INSERT INTO public.users (
    id, email, password, name, username, avatar, bio, verified, email_verified,
    neighborhood_name, neighborhood_code, created_at, updated_at
) VALUES 
(
    gen_random_uuid(), 'maria@vecinoactivo.cl', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'María González', 'maria-gonzalez', 'https://i.pravatar.cc/150?img=5',
    'Vecina activa de Las Condes', FALSE, TRUE, 'Las Condes Centro', 'LC-001', NOW(), NOW()
),
(
    gen_random_uuid(), 'carlos@vecinoactivo.cl', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Carlos Rodríguez', 'carlos-rodriguez', 'https://i.pravatar.cc/150?img=8',
    'Ingeniero y padre de familia', FALSE, TRUE, 'Providencia Norte', 'PR-002', NOW(), NOW()
),
(
    gen_random_uuid(), 'ana@vecinoactivo.cl', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Ana Martínez', 'ana-martinez', 'https://i.pravatar.cc/150?img=9',
    'Profesora y activista comunitaria', TRUE, TRUE, 'Ñuñoa Centro', 'NU-003', NOW(), NOW()
);

-- PASO 5: Hacer columna username única
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- PASO 6: Crear índice
CREATE INDEX idx_users_username ON public.users(username);

-- PASO 7: Verificación final
SELECT 
    name as "Nombre",
    username as "Username",
    email as "Email",
    CASE WHEN verified THEN '✅ Verificado' ELSE '❌ No verificado' END as "Estado"
FROM public.users
WHERE username IN ('administrador', 'maria-gonzalez', 'carlos-rodriguez', 'ana-martinez')
ORDER BY name;

-- PASO 8: Confirmar que todo está correcto
SELECT 
    'RESULTADO:' as titulo,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.users WHERE username = 'administrador')
        THEN '🎉 ÉXITO - Usuario administrador creado. Disponible en /administrador'
        ELSE '❌ ERROR - Usuario administrador no se creó'
    END as mensaje;