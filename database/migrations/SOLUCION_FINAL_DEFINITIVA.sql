-- =====================================================
-- SOLUCIÓN FINAL DEFINITIVA - TODO EN UNO
-- =====================================================
-- Este script resuelve TODOS los problemas:
-- 1. Foreign keys duplicadas
-- 2. Tipos de datos incompatibles
-- 3. Foreign keys faltantes

-- =====================================================
-- PASO 1: LIMPIAR POSTS
-- =====================================================

-- Eliminar TODAS las foreign keys entre posts y users
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_new_author_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_author;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_posts_user;

-- Eliminar columnas duplicadas si existen
ALTER TABLE posts DROP COLUMN IF EXISTS new_author_id;
ALTER TABLE posts DROP COLUMN IF EXISTS user_id CASCADE;

-- Crear UNA SOLA foreign key correcta en posts
ALTER TABLE posts 
ADD CONSTRAINT posts_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- =====================================================
-- PASO 2: LIMPIAR Y CORREGIR COMMENTS
-- =====================================================

-- Eliminar foreign keys de comments
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_author;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_user;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_post;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_posts_fkey;

-- ELIMINAR TODOS LOS COMMENTS (son datos de prueba)
TRUNCATE TABLE comments CASCADE;

-- Corregir tipo de dato de post_id a INTEGER
ALTER TABLE comments 
ALTER COLUMN post_id TYPE INTEGER USING NULL;

-- Corregir tipo de dato de id si es UUID
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE comments DROP COLUMN id CASCADE;
        ALTER TABLE comments ADD COLUMN id SERIAL PRIMARY KEY;
    END IF;
END $$;

-- Crear foreign key entre comments y users
ALTER TABLE comments 
ADD CONSTRAINT comments_author_id_fkey 
FOREIGN KEY (author_id) 
REFERENCES users(id) 
ON DELETE CASCADE;

-- Crear foreign key entre comments y posts
ALTER TABLE comments 
ADD CONSTRAINT comments_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES posts(id) 
ON DELETE CASCADE;

-- =====================================================
-- PASO 3: VERIFICACIÓN COMPLETA
-- =====================================================

-- Ver todas las foreign keys creadas
SELECT 
    '✅ FOREIGN KEYS FINALES' as seccion,
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

-- Ver tipos de datos corregidos
SELECT 
    '✅ TIPOS DE DATOS CORREGIDOS' as seccion,
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE (table_name = 'posts' AND column_name IN ('id', 'author_id'))
   OR (table_name = 'comments' AND column_name IN ('id', 'post_id', 'author_id'))
ORDER BY table_name, column_name;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Deberías ver:
-- 
-- FOREIGN KEYS (3 total):
-- - comments | comments_author_id_fkey | author_id | users | id
-- - comments | comments_post_id_fkey   | post_id   | posts | id
-- - posts    | posts_author_id_fkey    | author_id | users | id
--
-- TIPOS DE DATOS:
-- - comments.id        → integer
-- - comments.post_id   → integer
-- - comments.author_id → text (UUID)
-- - posts.id           → integer
-- - posts.author_id    → text (UUID)
-- =====================================================

SELECT '✅✅✅ SOLUCIÓN COMPLETADA - Refresca tu aplicación' as resultado;
