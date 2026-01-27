-- =====================================================
-- ARREGLAR FOREIGN KEYS DE POSTS
-- =====================================================
-- Este script recrea las foreign keys que se perdieron

-- 1. Verificar si existe la foreign key
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
WHERE tc.table_name = 'posts' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- 2. Eliminar foreign key si existe (para recrearla)
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_author;

-- 3. Crear foreign key de posts.author_id -> users.id
ALTER TABLE posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 4. Hacer lo mismo para comments
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_author;

ALTER TABLE comments 
ADD CONSTRAINT comments_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 5. Verificar que se crearon correctamente
SELECT 
    '✅ Foreign keys creadas' as resultado,
    COUNT(*) as total_fks
FROM information_schema.table_constraints
WHERE table_name IN ('posts', 'comments') 
  AND constraint_type = 'FOREIGN KEY'
  AND constraint_name LIKE '%author_id_fkey';

-- 6. Mostrar detalles
SELECT 
    tc.table_name as tabla,
    tc.constraint_name as foreign_key,
    kcu.column_name as columna,
    ccu.table_name AS referencia_tabla,
    ccu.column_name AS referencia_columna
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('posts', 'comments')
  AND tc.constraint_type = 'FOREIGN KEY'
  AND tc.constraint_name LIKE '%author_id_fkey'
ORDER BY tc.table_name;
