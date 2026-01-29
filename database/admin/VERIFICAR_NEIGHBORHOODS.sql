-- ============================================
-- VERIFICAR TABLA NEIGHBORHOODS
-- ============================================

-- 1. Ver estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'neighborhoods'
ORDER BY ordinal_position;

-- 2. Contar vecindarios disponibles
SELECT COUNT(*) as total_neighborhoods FROM neighborhoods;

-- 3. Ver primeros 5 vecindarios
SELECT id, codigo, nombre, comuna, region 
FROM neighborhoods 
LIMIT 5;

-- 4. Verificar usuario admin
SELECT id, email, name FROM users WHERE email = 'admin@vecinoactivo.cl';

-- 5. Ver asignaciones actuales del admin
SELECT 
    u.email,
    COUNT(na.id) as vecindarios_asignados
FROM users u
LEFT JOIN neighborhood_admins na ON u.id = na.user_id
WHERE u.email = 'admin@vecinoactivo.cl'
GROUP BY u.email;
