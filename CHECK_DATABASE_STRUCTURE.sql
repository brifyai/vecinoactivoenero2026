-- =====================================================
-- VERIFICAR ESTRUCTURA DE BASE DE DATOS
-- Ejecutar PRIMERO para ver qué columnas existen
-- =====================================================

-- 1. Verificar estructura de tabla users
SELECT 'TABLA USERS:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Verificar estructura de tabla posts
SELECT 'TABLA POSTS:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'posts' 
ORDER BY ordinal_position;

-- 3. Verificar estructura de tabla messages
SELECT 'TABLA MESSAGES:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' 
ORDER BY ordinal_position;

-- 4. Verificar estructura de tabla notifications
SELECT 'TABLA NOTIFICATIONS:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- 5. Verificar si existe tabla conversations
SELECT 'TABLA CONVERSATIONS:' as info;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations') 
        THEN 'EXISTE' 
        ELSE 'NO EXISTE' 
    END as status;

-- 6. Si conversations existe, mostrar su estructura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'conversations' 
ORDER BY ordinal_position;

-- 7. Verificar qué tablas existen en total
SELECT 'TODAS LAS TABLAS:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 8. Verificar usuarios existentes
SELECT 'USUARIOS EXISTENTES:' as info;
SELECT COUNT(*) as total_users FROM users;

-- 9. Verificar posts existentes
SELECT 'POSTS EXISTENTES:' as info;
SELECT COUNT(*) as total_posts FROM posts;

-- 10. Verificar real-time habilitado
SELECT 'REAL-TIME HABILITADO:' as info;
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;