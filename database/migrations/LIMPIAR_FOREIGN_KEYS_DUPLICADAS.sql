-- =====================================================
-- LIMPIAR FOREIGN KEYS DUPLICADAS
-- =====================================================
-- Problema: Hay 3 foreign keys entre posts y users
-- Solución: Eliminar las duplicadas y dejar solo posts_author_id_fkey

-- 1. Ver todas las foreign keys actuales
SELECT 
    '1. Foreign keys actuales en posts' as seccion,
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
  AND tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'users';

-- 2. Eliminar TODAS las foreign keys entre posts y users
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_new_author_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_author;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_user;

-- 3. Verificar columnas en posts
SELECT 
    '2. Columnas en posts relacionadas con users' as seccion,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'posts' 
  AND (column_name LIKE '%author%' OR column_name LIKE '%user%')
ORDER BY column_name;

-- 4. Eliminar columnas duplicadas si existen (solo si no son necesarias)
-- NOTA: Comenta estas líneas si necesitas estas columnas
ALTER TABLE posts DROP COLUMN IF EXISTS new_author_id;
ALTER TABLE posts DROP COLUMN IF EXISTS user_id CASCADE;

-- 5. Crear UNA SOLA foreign key correcta
ALTER TABLE posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 6. Hacer lo mismo para comments
SELECT 
    '3. Foreign keys actuales en comments' as seccion,
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
  AND ccu.table_name = 'users';

-- 7. Limpiar foreign keys de comments
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_author;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_user;

-- 8. Crear UNA SOLA foreign key en comments (author)
ALTER TABLE comments 
ADD CONSTRAINT comments_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- 8b. Eliminar foreign keys entre comments y posts (si existen)
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_post;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_posts_fkey;

-- 8c. CORREGIR TIPO DE DATO de comments.post_id (debe ser INTEGER como posts.id)
-- Verificar y cambiar si es necesario
DO $$
BEGIN
    -- Cambiar tipo de dato si no es integer
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' 
        AND column_name = 'post_id' 
        AND data_type != 'integer'
    ) THEN
        ALTER TABLE comments 
        ALTER COLUMN post_id TYPE INTEGER USING post_id::text::integer;
    END IF;
END $$;

-- 8d. Crear foreign key entre comments y posts
ALTER TABLE comments 
ADD CONSTRAINT comments_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES posts(id) 
ON DELETE CASCADE;

-- 9. Verificación final
SELECT 
    '4. ✅ Foreign keys finales' as seccion,
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
ORDER BY tc.table_name, tc.constraint_name;

-- 10. Resultado esperado
SELECT 
    '5. ✅ Resultado esperado' as mensaje,
    '3 foreign keys: posts_author_id_fkey, comments_author_id_fkey, comments_post_id_fkey' as detalle;
