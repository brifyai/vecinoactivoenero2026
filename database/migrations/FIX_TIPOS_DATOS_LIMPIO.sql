-- =====================================================
-- SOLUCIÓN LIMPIA - ELIMINAR COMMENTS Y CORREGIR TIPOS
-- =====================================================
-- Problema: comments tiene UUIDs que no se pueden convertir a INTEGER
-- Solución: Eliminar comments existentes y corregir el esquema

-- 1. VER DATOS ACTUALES
SELECT 
    '1. Comments actuales' as seccion,
    COUNT(*) as total_comments
FROM comments;

SELECT 
    '2. Tipos de datos actuales' as seccion,
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE (table_name = 'posts' AND column_name = 'id')
   OR (table_name = 'comments' AND column_name IN ('id', 'post_id'))
ORDER BY table_name, column_name;

-- 2. ELIMINAR TODOS LOS COMMENTS EXISTENTES
-- (Son datos de prueba, se pueden recrear)
TRUNCATE TABLE comments CASCADE;

-- 3. ELIMINAR FOREIGN KEYS
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS fk_comments_post;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_posts_fkey;

-- 4. CAMBIAR TIPO DE DATO de post_id a INTEGER
ALTER TABLE comments 
ALTER COLUMN post_id TYPE INTEGER USING NULL;

-- 5. CAMBIAR TIPO DE DATO de id a INTEGER (si es UUID)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'comments' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) THEN
        -- Eliminar la columna id y recrearla como SERIAL
        ALTER TABLE comments DROP COLUMN id CASCADE;
        ALTER TABLE comments ADD COLUMN id SERIAL PRIMARY KEY;
    END IF;
END $$;

-- 6. CREAR FOREIGN KEY entre comments y posts
ALTER TABLE comments 
ADD CONSTRAINT comments_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES posts(id) 
ON DELETE CASCADE;

-- 7. VERIFICACIÓN FINAL
SELECT 
    '3. ✅ Tipos de datos corregidos' as seccion,
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE (table_name = 'posts' AND column_name = 'id')
   OR (table_name = 'comments' AND column_name IN ('id', 'post_id'))
ORDER BY table_name, column_name;

-- 8. Verificar foreign key
SELECT 
    '4. ✅ Foreign key creada' as seccion,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'comments' 
  AND tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'posts';

SELECT '5. ✅ Listo - Comments vacío y tipos corregidos' as resultado;
