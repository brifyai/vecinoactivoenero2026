-- =====================================================
-- DIAGNÓSTICO DE TIPOS DE DATOS
-- =====================================================
-- Verificar tipos de datos en tablas críticas

-- 1. Verificar tipo de post_id en posts
SELECT 
    'posts.id' as tabla_columna,
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'posts' 
  AND column_name = 'id';

-- 2. Verificar tipo de post_id en post_reactions
SELECT 
    'post_reactions.post_id' as tabla_columna,
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'post_reactions' 
  AND column_name = 'post_id';

-- 3. Verificar si existe avatar_url en users
SELECT 
    'users columns' as info,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('avatar', 'avatar_url', 'name', 'full_name')
ORDER BY column_name;

-- 4. Ver algunos posts de ejemplo
SELECT 
    id,
    pg_typeof(id) as id_type,
    LEFT(content, 30) as content_preview,
    author_id
FROM posts
LIMIT 3;

-- 5. Ver estructura de post_reactions
SELECT 
    id,
    post_id,
    pg_typeof(post_id) as post_id_type,
    user_id,
    emoji
FROM post_reactions
LIMIT 3;
