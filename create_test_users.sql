-- =====================================================
-- CREAR USUARIOS DE PRUEBA PARA TESTING REAL-TIME
-- =====================================================

-- 1. Crear usuarios de prueba (solo si no existen)
INSERT INTO users (
    email, 
    password, 
    name, 
    username, 
    neighborhood_id, 
    neighborhood_name,
    verified,
    email_verified
) VALUES 
(
    'test1@vecinoactivo.cl',
    '$2b$10$example.hash.for.testing.purposes.only',
    'Usuario Test 1',
    'test_user_1',
    '1',
    'Las Condes',
    true,
    true
),
(
    'test2@vecinoactivo.cl',
    '$2b$10$example.hash.for.testing.purposes.only',
    'Usuario Test 2', 
    'test_user_2',
    '1',
    'Las Condes',
    true,
    true
),
(
    'test3@vecinoactivo.cl',
    '$2b$10$example.hash.for.testing.purposes.only',
    'Usuario Test 3',
    'test_user_3', 
    '2',
    'Providencia',
    true,
    true
)
ON CONFLICT (email) DO NOTHING;

-- 2. Verificar que se crearon los usuarios
SELECT 
    'Usuarios de prueba creados' as status,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE email LIKE '%test%@vecinoactivo.cl') as test_users
FROM users;

-- 3. Mostrar los usuarios de prueba creados
SELECT 
    id,
    email,
    name,
    username,
    neighborhood_name,
    created_at
FROM users 
WHERE email LIKE '%test%@vecinoactivo.cl'
ORDER BY created_at;

-- 4. Crear algunas amistades de prueba
WITH test_users AS (
    SELECT id, email FROM users WHERE email LIKE '%test%@vecinoactivo.cl' ORDER BY email
)
INSERT INTO friendships (user_id, friend_id, status, accepted_at)
SELECT 
    u1.id,
    u2.id,
    'accepted',
    NOW()
FROM test_users u1
CROSS JOIN test_users u2
WHERE u1.id != u2.id
ON CONFLICT (user_id, friend_id) DO NOTHING;

-- 5. Verificar amistades creadas
SELECT 
    'Amistades de prueba creadas' as status,
    COUNT(*) as total_friendships
FROM friendships f
JOIN users u1 ON f.user_id = u1.id
JOIN users u2 ON f.friend_id = u2.id
WHERE u1.email LIKE '%test%@vecinoactivo.cl' 
   OR u2.email LIKE '%test%@vecinoactivo.cl';

-- 6. Crear algunos posts de prueba
INSERT INTO posts (
    user_id,
    content,
    type,
    neighborhood_id
)
SELECT 
    u.id,
    'Post de prueba desde ' || u.name || ' - ' || NOW(),
    'text',
    u.neighborhood_id::INTEGER
FROM users u
WHERE u.email LIKE '%test%@vecinoactivo.cl'
ON CONFLICT DO NOTHING;

-- 7. Verificar posts creados
SELECT 
    'Posts de prueba creados' as status,
    COUNT(*) as total_posts
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE u.email LIKE '%test%@vecinoactivo.cl';

-- 8. Resumen final
SELECT 
    'RESUMEN DE DATOS DE PRUEBA' as section,
    '' as separator;

SELECT 
    'Usuarios totales' as metric,
    COUNT(*) as value
FROM users
UNION ALL
SELECT 
    'Usuarios de prueba' as metric,
    COUNT(*) as value
FROM users WHERE email LIKE '%test%@vecinoactivo.cl'
UNION ALL
SELECT 
    'Amistades totales' as metric,
    COUNT(*) as value
FROM friendships
UNION ALL
SELECT 
    'Posts totales' as metric,
    COUNT(*) as value
FROM posts;