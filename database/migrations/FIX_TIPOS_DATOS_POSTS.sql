-- =====================================================
-- CORREGIR TIPOS DE DATOS INCOMPATIBLES
-- =====================================================
-- Problema: comments.post_id es UUID pero posts.id es INTEGER
-- Solución: Cambiar comments.post_id a INTEGER

-- 1. DIAGNÓSTICO - Ver tipos de datos actuales
SELECT 
    '1. Tipos de datos actuales' as seccion,
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE (table_name = 'posts' AND column_name = 'id')
   OR (table_name = 'comments' AND column_name = 'post_id')
   OR (table_name = 'comments' AND column_name = 'id')
ORDER BY table_name, column_name;

-- 2. Ver si hay datos en comments
SELECT 
    '2. Cantidad de comments' as seccion,
    COUNT(*) as total_comments
FROM comments;

-- 3. SOLUCIÓN - Cambiar tipo de comments.post_id a INTEGER
-- Primero eliminar la columna y recrearla (más seguro que ALTER TYPE)

-- Guardar datos temporalmente si existen
CREATE TEMP TABLE comments_backup AS 
SELECT * FROM comments;

-- Eliminar foreign keys que dependen de post_id
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_post;

-- Cambiar el tipo de dato
ALTER TABLE comments 
ALTER COLUMN post_id TYPE INTEGER USING post_id::text::integer;

-- Recrear foreign key
ALTER TABLE comments 
ADD CONSTRAINT comments_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES posts(id) 
ON DELETE CASCADE;

-- 4. VERIFICACIÓN FINAL
SELECT 
    '3. ✅ Tipos de datos corregidos' as seccion,
    table_name,
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE (table_name = 'posts' AND column_name = 'id')
   OR (table_name = 'comments' AND column_name = 'post_id')
ORDER BY table_name, column_name;

-- 5. Verificar foreign key creada
SELECT 
    '4. ✅ Foreign key creada' as seccion,
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

-- Limpiar tabla temporal
DROP TABLE IF EXISTS comments_backup;
