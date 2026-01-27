-- =====================================================
-- VERIFICAR TIPOS DE DATOS REALES
-- =====================================================

-- 1. Ver tipo de posts.id
SELECT 
    'posts.id' as columna,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'posts' AND column_name = 'id';

-- 2. Ver tipo de post_reactions.post_id
SELECT 
    'post_reactions.post_id' as columna,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'post_reactions' AND column_name = 'post_id';

-- 3. Ver algunos posts reales
SELECT 
    id,
    pg_typeof(id) as tipo_id,
    LEFT(content, 30) as preview
FROM posts
LIMIT 3;

-- 4. Ver constraint actual
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'post_reactions'
    AND kcu.column_name = 'post_id';
