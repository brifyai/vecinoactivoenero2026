-- =====================================================
-- TESTING COMPLETO REAL-TIME FUNCTIONALITY
-- =====================================================

-- 1. TESTING REAL-TIME POSTS
-- =====================================================

-- Verificar que la tabla posts existe y tiene RLS habilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'posts';

-- Verificar políticas RLS para posts
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'posts';

-- Test: Insertar un post y verificar que se puede leer
INSERT INTO posts (
    user_id, 
    content, 
    type, 
    neighborhood_id,
    created_at
) VALUES (
    (SELECT id FROM users LIMIT 1),
    'Test post para real-time functionality',
    'text',
    1,
    NOW()
) RETURNING id, content, created_at;

-- Verificar que el post se insertó correctamente
SELECT 
    p.id,
    p.content,
    p.type,
    p.neighborhood_id,
    p.created_at,
    u.username
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.content LIKE '%Test post para real-time%'
ORDER BY p.created_at DESC
LIMIT 1;

-- 2. TESTING REAL-TIME NOTIFICATIONS
-- =====================================================

-- Verificar que la tabla notifications existe
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename = 'notifications';

-- Test: Crear una notificación
INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    created_at
) VALUES (
    (SELECT id FROM users LIMIT 1),
    'post_like',
    'Nuevo like en tu post',
    'A alguien le gustó tu publicación',
    '{"post_id": 1, "liker_username": "test_user"}',
    NOW()
) RETURNING id, type, title, created_at;

-- Verificar que la notificación se creó
SELECT 
    n.id,
    n.type,
    n.title,
    n.message,
    n.read,
    n.created_at,
    u.username
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.title = 'Nuevo like en tu post'
ORDER BY n.created_at DESC
LIMIT 1;

-- 3. TESTING REAL-TIME MESSAGES
-- =====================================================

-- Verificar que las tablas de mensajes existen
SELECT 
    schemaname, 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE tablename IN ('conversations', 'messages');

-- Test: Crear una conversación
INSERT INTO conversations (
    participant1_id,
    participant2_id,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users ORDER BY id LIMIT 1),
    (SELECT id FROM users ORDER BY id LIMIT 1 OFFSET 1),
    NOW(),
    NOW()
) RETURNING id, created_at;

-- Test: Enviar un mensaje
INSERT INTO messages (
    conversation_id,
    sender_id,
    content,
    created_at
) VALUES (
    (SELECT id FROM conversations ORDER BY created_at DESC LIMIT 1),
    (SELECT id FROM users ORDER BY id LIMIT 1),
    'Test message para real-time functionality',
    NOW()
) RETURNING id, content, created_at;

-- Verificar que el mensaje se creó correctamente
SELECT 
    m.id,
    m.content,
    m.created_at,
    u.username as sender,
    c.id as conversation_id
FROM messages m
JOIN users u ON m.sender_id = u.id
JOIN conversations c ON m.conversation_id = c.id
WHERE m.content LIKE '%Test message para real-time%'
ORDER BY m.created_at DESC
LIMIT 1;

-- 4. TESTING TRIGGERS Y FUNCIONES
-- =====================================================

-- Verificar que existen las funciones de notificación
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_name LIKE '%notify%'
   OR routine_name LIKE '%realtime%'
ORDER BY routine_name;

-- Verificar que existen los triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('posts', 'notifications', 'messages')
ORDER BY event_object_table, trigger_name;

-- 5. TESTING PUBLICACIONES REAL-TIME
-- =====================================================

-- Verificar configuración de publicaciones
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables
WHERE tablename IN ('posts', 'notifications', 'messages', 'conversations');

-- 6. TESTING PERFORMANCE
-- =====================================================

-- Verificar índices importantes para real-time
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('posts', 'notifications', 'messages', 'conversations')
  AND indexname LIKE '%created_at%'
ORDER BY tablename, indexname;

-- Test de performance: Consulta de posts recientes
EXPLAIN ANALYZE
SELECT 
    p.id,
    p.content,
    p.created_at,
    u.username,
    p.neighborhood_id
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.created_at >= NOW() - INTERVAL '1 hour'
ORDER BY p.created_at DESC
LIMIT 20;

-- Test de performance: Consulta de notificaciones no leídas
EXPLAIN ANALYZE
SELECT 
    n.id,
    n.type,
    n.title,
    n.message,
    n.created_at
FROM notifications n
WHERE n.user_id = (SELECT id FROM users LIMIT 1)
  AND n.read = false
ORDER BY n.created_at DESC
LIMIT 10;

-- 7. CLEANUP DE TESTS
-- =====================================================

-- Limpiar datos de prueba (opcional)
-- DELETE FROM messages WHERE content LIKE '%Test message para real-time%';
-- DELETE FROM notifications WHERE title = 'Nuevo like en tu post';
-- DELETE FROM posts WHERE content LIKE '%Test post para real-time%';

-- 8. RESUMEN DE RESULTADOS
-- =====================================================

SELECT 'TESTING REAL-TIME COMPLETADO' as status,
       NOW() as timestamp,
       'Verificar logs anteriores para resultados detallados' as note;