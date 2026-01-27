-- =====================================================
-- FIX POST_REACTIONS - MANTENER UUID
-- =====================================================
-- La tabla posts usa UUID, así que post_reactions también debe usar UUID
-- El problema es que el código está enviando integers (1, 2, 3)

-- 1. Verificar tipos actuales
SELECT 
    'ESTADO ACTUAL' as info,
    (SELECT data_type FROM information_schema.columns 
     WHERE table_name = 'posts' AND column_name = 'id') as posts_id_type,
    (SELECT data_type FROM information_schema.columns 
     WHERE table_name = 'post_reactions' AND column_name = 'post_id') as reactions_post_id_type;

-- 2. Verificar que la foreign key existe y es correcta
SELECT
    constraint_name,
    table_name,
    column_name
FROM information_schema.key_column_usage
WHERE constraint_name = 'post_reactions_post_id_fkey';

-- 3. Si no existe la foreign key, crearla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'post_reactions_post_id_fkey'
    ) THEN
        ALTER TABLE post_reactions
        ADD CONSTRAINT post_reactions_post_id_fkey 
        FOREIGN KEY (post_id) 
        REFERENCES posts(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Verificar resultado
SELECT 
    '✅ VERIFICACIÓN FINAL' as titulo,
    CASE 
        WHEN posts_type = reactions_type AND posts_type = 'uuid' THEN '✅ AMBOS SON UUID - CORRECTO'
        WHEN posts_type = reactions_type AND posts_type = 'integer' THEN '⚠️ AMBOS SON INTEGER - REVISAR CÓDIGO'
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

-- ✅ Resultado esperado: "✅ AMBOS SON UUID - CORRECTO"
-- Si ves esto, el problema está en el CÓDIGO que envía integers en lugar de UUIDs
