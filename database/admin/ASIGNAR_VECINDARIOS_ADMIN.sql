-- ============================================
-- ASIGNAR VECINDARIOS AL USUARIO ADMIN
-- ============================================
-- Este script asigna vecindarios al usuario admin@vecinoactivo.cl
-- para que pueda acceder al dashboard administrativo

-- 1. Verificar que el usuario admin existe
SELECT id, email, name FROM users WHERE email = 'admin@vecinoactivo.cl';

-- 2. Obtener el ID del usuario admin
DO $$
DECLARE
    admin_user_id UUID;
    neighborhood_record RECORD;
BEGIN
    -- Obtener ID del admin
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@vecinoactivo.cl';
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario admin@vecinoactivo.cl no encontrado';
    END IF;
    
    RAISE NOTICE 'Admin user ID: %', admin_user_id;
    
    -- Asignar TODOS los vecindarios al admin con rol 'admin'
    FOR neighborhood_record IN 
        SELECT id, nombre FROM neighborhoods
    LOOP
        -- Insertar o actualizar la asignación
        INSERT INTO neighborhood_admins (neighborhood_id, user_id, role, permissions)
        VALUES (
            neighborhood_record.id,
            admin_user_id,
            'admin',
            ARRAY['manage_users', 'manage_tickets', 'manage_campaigns', 'manage_settings', 'view_analytics']
        )
        ON CONFLICT (neighborhood_id, user_id) 
        DO UPDATE SET 
            role = 'admin',
            permissions = ARRAY['manage_users', 'manage_tickets', 'manage_campaigns', 'manage_settings', 'view_analytics'],
            updated_at = NOW();
        
        RAISE NOTICE 'Asignado vecindario: % (ID: %)', neighborhood_record.nombre, neighborhood_record.id;
    END LOOP;
    
    RAISE NOTICE 'Vecindarios asignados exitosamente';
END $$;

-- 3. Verificar las asignaciones
SELECT 
    na.id,
    na.role,
    na.permissions,
    n.nombre as neighborhood_name,
    n.id as neighborhood_id,
    u.email as admin_email
FROM neighborhood_admins na
JOIN neighborhoods n ON na.neighborhood_id = n.id
JOIN users u ON na.user_id = u.id
WHERE u.email = 'admin@vecinoactivo.cl'
ORDER BY n.nombre;

-- 4. Contar vecindarios asignados
SELECT COUNT(*) as total_vecindarios_asignados
FROM neighborhood_admins na
JOIN users u ON na.user_id = u.id
WHERE u.email = 'admin@vecinoactivo.cl';
