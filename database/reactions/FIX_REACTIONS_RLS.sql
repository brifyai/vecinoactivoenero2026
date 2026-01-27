-- =====================================================
-- ARREGLAR RLS DE POST_REACTIONS
-- =====================================================

-- Deshabilitar RLS temporalmente
ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas existentes
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'post_reactions') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON post_reactions';
    END LOOP;
END $$;

-- Habilitar RLS nuevamente
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Política para VER reacciones (todos pueden ver)
CREATE POLICY "Anyone can view reactions"
ON post_reactions FOR SELECT
USING (true);

-- Política para INSERTAR reacciones (usuarios autenticados)
CREATE POLICY "Authenticated users can add reactions"
ON post_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para ELIMINAR reacciones (solo sus propias reacciones)
CREATE POLICY "Users can delete their own reactions"
ON post_reactions FOR DELETE
USING (auth.uid() = user_id);

-- Verificar políticas creadas
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'post_reactions'
ORDER BY cmd, policyname;
