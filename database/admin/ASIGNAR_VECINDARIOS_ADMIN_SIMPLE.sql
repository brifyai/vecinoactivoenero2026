-- ============================================
-- SCRIPT SIMPLE: Asignar vecindarios al admin
-- ============================================
-- Copiar y pegar TODO este contenido en Supabase SQL Editor

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
    
    -- Asignar TODOS los vecindarios al admin
    FOR neighborhood_record IN 
        SELECT id, nombre FROM neighborhoods
    LOOP
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

-- Verificar resultado
SELECT COUNT(*) as total_vecindarios_asignados
FROM neighborhood_admins na
JOIN users u ON na.user_id = u.id
WHERE u.email = 'admin@vecinoactivo.cl';
