-- =====================================================
-- FIX POST_REACTIONS - LIMPIAR Y RECREAR
-- =====================================================
-- Solución: Eliminar reacciones existentes y recrear tabla con tipo correcto

-- 1. Ver estado actual
SELECT 
    'ANTES - Tipo de datos' as info,
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('posts', 'post_reactions')
  AND column_name IN ('id', 'post_id')
ORDER BY table_name, column_name;

-- 2. Ver tipo de posts.id
SELECT 
    'Tipo de posts.id' as info,
    pg_typeof(id) as tipo,
    id
FROM posts
LIMIT 3;

-- 3. ELIMINAR TODAS LAS REACCIONES EXISTENTES
-- (Son datos de prueba, podemos recrearlos)
TRUNCATE TABLE post_reactions CASCADE;

-- 4. Eliminar constraint de foreign key
ALTER TABLE post_reactions 
DROP CONSTRAINT IF EXISTS post_reactions_post_id_fkey;

-- 5. Cambiar tipo de columna post_id a INTEGER
ALTER TABLE post_reactions 
ALTER COLUMN post_id TYPE INTEGER;

-- 6. Recrear foreign key con el tipo correcto
ALTER TABLE post_reactions
ADD CONSTRAINT post_reactions_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES posts(id) 
ON DELETE CASCADE;

-- 7. Verificar que funcionó
SELECT 
    'DESPUÉS - Tipo de datos' as info,
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('posts', 'post_reactions')
  AND column_name IN ('id', 'post_id')
ORDER BY table_name, column_name;

-- 8. Verificar que ambos tipos coinciden
SELECT 
    CASE 
        WHEN posts_type = reactions_type THEN '✅ TIPOS COINCIDEN'
        ELSE '❌ TIPOS NO COINCIDEN'
    END as resultado,
    posts_type,
    reactions_type
FROM (
    SELECT 
        (SELECT data_type FROM information_schema.columns 
         WHERE table_name = 'posts' AND column_name = 'id') as posts_type,
        (SELECT data_type FROM information_schema.columns 
         WHERE table_name = 'post_reactions' AND column_name = 'post_id') as reactions_type
) t;

-- ✅ Resultado esperado: "✅ TIPOS COINCIDEN" con ambos siendo "integer"
