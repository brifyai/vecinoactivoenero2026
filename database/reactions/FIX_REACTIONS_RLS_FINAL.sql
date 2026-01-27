-- =====================================================
-- ARREGLAR RLS DE POST_REACTIONS - VERSIÓN FINAL
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

-- Política para VER reacciones (todos pueden ver, incluso anónimos)
CREATE POLICY "Enable read access for all users"
ON post_reactions FOR SELECT
TO public
USING (true);

-- Política para INSERTAR reacciones (usuarios autenticados)
CREATE POLICY "Enable insert for authenticated users only"
ON post_reactions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para ELIMINAR reacciones (usuarios autenticados, solo sus propias)
CREATE POLICY "Enable delete for users based on user_id"
ON post_reactions FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id::text);

-- Verificar políticas creadas
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'post_reactions'
ORDER BY cmd, policyname;
