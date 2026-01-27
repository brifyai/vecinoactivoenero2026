-- =====================================================
-- AGREGAR FOREIGN KEY ENTRE COMMENTS Y POSTS
-- =====================================================
-- Problema: No existe relación entre comments.post_id y posts.id
-- Error: "Could not find a relationship between 'posts' and 'comments'"

-- 1. Verificar foreign keys actuales en comments
SELECT 
    '1. Foreign keys actuales en comments' as seccion,
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

-- 2. Verificar columnas en comments
SELECT 
    '2. Columnas en comments' as seccion,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'comments'
ORDER BY ordinal_position;

-- 3. Eliminar foreign keys existentes entre comments y posts (si existen)
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_post;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_posts_fkey;

-- 4. Crear foreign key entre comments.post_id y posts.id
ALTER TABLE comments 
ADD CONSTRAINT comments_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES posts(id) 
ON DELETE CASCADE;

-- 5. Verificar que se creó correctamente
SELECT 
    '3. ✅ Foreign key creada' as seccion,
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
  AND tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'posts';

-- 6. Verificar TODAS las foreign keys de comments
SELECT 
    '4. ✅ Todas las foreign keys de comments' as seccion,
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
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.constraint_name;

-- 7. Resultado esperado
SELECT 
    '5. ✅ Resultado esperado' as mensaje,
    'comments debe tener 2 FKs: comments_post_id_fkey (a posts) y comments_author_id_fkey (a users)' as detalle;
