-- =====================================================
-- DIAGNÓSTICO COMPLETO DE FOREIGN KEYS Y RELACIONES
-- =====================================================

-- 1. Verificar estructura de tabla posts
SELECT 
    '1. Columnas de tabla posts' as seccion,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;

-- 2. Verificar estructura de tabla users
SELECT 
    '2. Columnas de tabla users' as seccion,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 3. Verificar foreign keys existentes en posts
SELECT 
    '3. Foreign keys en posts' as seccion,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'posts' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- 4. Verificar foreign keys existentes en comments
SELECT 
    '4. Foreign keys en comments' as seccion,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'comments' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- 5. Verificar si hay datos huérfanos en posts
SELECT 
    '5. Posts sin autor válido' as seccion,
    COUNT(*) as total_posts_huerfanos
FROM posts p
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = p.author_id
);

-- 6. Verificar si hay datos huérfanos en comments
SELECT 
    '6. Comments sin autor válido' as seccion,
    COUNT(*) as total_comments_huerfanos
FROM comments c
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = c.author_id
);

-- 7. Mostrar posts huérfanos (si existen)
SELECT 
    '7. Detalle de posts huérfanos' as seccion,
    p.id,
    p.author_id,
    p.content,
    p.created_at
FROM posts p
WHERE NOT EXISTS (
    SELECT 1 FROM users u WHERE u.id = p.author_id
)
LIMIT 5;

-- 8. Verificar tipos de datos de las columnas clave
SELECT 
    '8. Tipos de datos' as seccion,
    'posts.author_id' as columna,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name = 'author_id'
UNION ALL
SELECT 
    '8. Tipos de datos' as seccion,
    'users.id' as columna,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'id'
UNION ALL
SELECT 
    '8. Tipos de datos' as seccion,
    'comments.author_id' as columna,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'comments' AND column_name = 'author_id';

-- 9. Verificar si las tablas existen
SELECT 
    '9. Tablas existentes' as seccion,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('posts', 'users', 'comments', 'post_reactions')
ORDER BY table_name;

-- 10. Verificar políticas RLS que puedan estar bloqueando
SELECT 
    '10. Políticas RLS en posts' as seccion,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'posts';
