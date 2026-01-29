-- ============================================
-- CREAR SISTEMA ADMIN COMPLETO
-- ============================================
-- Este script crea las tablas necesarias y asigna el rol de admin

-- PASO 1: Crear tabla admin_roles si no existe
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    neighborhood_id VARCHAR(100) REFERENCES neighborhoods(id) ON DELETE CASCADE,
    role_type VARCHAR(50) NOT NULL CHECK (role_type IN ('super_admin', 'uv_admin', 'delegate', 'moderator')),
    permissions JSONB DEFAULT '{}',
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, neighborhood_id, role_type)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_neighborhood_id ON admin_roles(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_role_type ON admin_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_admin_roles_active ON admin_roles(is_active) WHERE is_active = true;

-- PASO 2: Asignar TODOS los vecindarios al admin
DO $$
DECLARE
    admin_user_id UUID;
    neighborhood_record RECORD;
    inserted_count INTEGER := 0;
BEGIN
    -- Obtener ID del admin
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@vecinoactivo.cl';
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario admin@vecinoactivo.cl no encontrado';
    END IF;
    
    RAISE NOTICE 'Admin user ID: %', admin_user_id;
    
    -- Asignar TODOS los vecindarios al admin con rol super_admin
    FOR neighborhood_record IN 
        SELECT id, nombre FROM neighborhoods
    LOOP
        INSERT INTO admin_roles (
            user_id, 
            neighborhood_id, 
            role_type, 
            permissions,
            is_active
        )
        VALUES (
            admin_user_id,
            neighborhood_record.id,
            'super_admin',
            '{"manage_users": true, "manage_tickets": true, "manage_campaigns": true, "manage_settings": true, "view_analytics": true}'::jsonb,
            true
        )
        ON CONFLICT (user_id, neighborhood_id, role_type) 
        DO UPDATE SET 
            permissions = '{"manage_users": true, "manage_tickets": true, "manage_campaigns": true, "manage_settings": true, "view_analytics": true}'::jsonb,
            is_active = true,
            updated_at = NOW();
        
        inserted_count := inserted_count + 1;
        RAISE NOTICE 'Asignado vecindario: % (ID: %)', neighborhood_record.nombre, neighborhood_record.id;
    END LOOP;
    
    RAISE NOTICE 'Total vecindarios asignados: %', inserted_count;
END $$;

-- PASO 3: Verificar resultado
SELECT 
    u.email,
    u.name,
    COUNT(ar.id) as total_vecindarios_asignados,
    array_agg(DISTINCT ar.role_type) as roles
FROM users u
LEFT JOIN admin_roles ar ON u.id = ar.user_id AND ar.is_active = true
WHERE u.email = 'admin@vecinoactivo.cl'
GROUP BY u.email, u.name;

-- PASO 4: Ver detalle de asignaciones
SELECT 
    ar.id,
    ar.role_type,
    ar.permissions,
    n.nombre as neighborhood_name,
    n.codigo as neighborhood_code,
    ar.is_active,
    ar.created_at
FROM admin_roles ar
JOIN neighborhoods n ON ar.neighborhood_id = n.id
JOIN users u ON ar.user_id = u.id
WHERE u.email = 'admin@vecinoactivo.cl'
ORDER BY n.nombre
LIMIT 10;

SELECT 'Admin setup completado exitosamente!' as status;
