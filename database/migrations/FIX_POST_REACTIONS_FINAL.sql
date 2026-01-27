-- =====================================================
-- FIX POST_REACTIONS - SOLUCIÓN DEFINITIVA
-- =====================================================
-- Paso a paso para cambiar tipo de post_id

-- PASO 1: Eliminar todas las reacciones existentes
-- (Necesario porque los UUIDs no se pueden convertir a integers)
TRUNCATE TABLE post_reactions CASCADE;

-- PASO 2: Eliminar constraint de foreign key
ALTER TABLE post_reactions 
DROP CONSTRAINT IF EXISTS post_reactions_post_id_fkey;

-- PASO 3: Cambiar tipo de columna con USING
-- Como la tabla está vacía, esto funcionará sin problemas
ALTER TABLE post_reactions 
ALTER COLUMN post_id TYPE INTEGER USING NULL;

-- PASO 4: Recrear foreign key con el tipo correcto
ALTER TABLE post_reactions
ADD CONSTRAINT post_reactions_post_id_fkey 
FOREIGN KEY (post_id) 
REFERENCES posts(id) 
ON DELETE CASCADE;

-- PASO 5: Verificar que funcionó
SELECT 
    '✅ VERIFICACIÓN' as titulo,
    CASE 
        WHEN posts_type = reactions_type THEN '✅ TIPOS COINCIDEN'
        ELSE '❌ TIPOS NO COINCIDEN'
    END as resultado,
    posts_type as "posts.id",
    reactions_type as "post_reactions.post_id"
FROM (
    SELECT 
        (SELECT data_type FROM information_schema.columns 
         WHERE table_name = 'posts' AND column_name = 'id') as posts_type,
        (SELECT data_type FROM information_schema.columns 
         WHERE table_name = 'post_reactions' AND column_name = 'post_id') as reactions_type
) t;

-- ✅ Resultado esperado: 
-- "✅ TIPOS COINCIDEN" con posts.id = "integer" y post_reactions.post_id = "integer"
