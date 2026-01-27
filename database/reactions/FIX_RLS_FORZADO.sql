-- =====================================================
-- FIX FORZADO: Eliminar y recrear políticas RLS
-- =====================================================
-- Usar cuando las políticas ya existen

-- 1. Deshabilitar RLS temporalmente
ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar TODAS las políticas (sin IF EXISTS para forzar)
DROP POLICY "post_reactions_select_policy" ON post_reactions;
DROP POLICY "post_reactions_insert_policy" ON post_reactions;
DROP POLICY "post_reactions_delete_policy" ON post_reactions;

-- También eliminar las antiguas por si acaso
DROP POLICY IF EXISTS "Anyone can view reactions" ON post_reactions;
DROP POLICY IF EXISTS "Authenticated users can add reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON post_reactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON post_reactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON post_reactions;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON post_reactions;

-- 3. Habilitar RLS nuevamente
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas nuevas

-- SELECT: Todos pueden ver
CREATE POLICY "post_reactions_select_policy"
ON post_reactions
FOR SELECT
USING (true);

-- INSERT: Solo usuarios autenticados
CREATE POLICY "post_reactions_insert_policy"
ON post_reactions
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- DELETE: Solo propias reacciones
CREATE POLICY "post_reactions_delete_policy"
ON post_reactions
FOR DELETE
USING (auth.uid()::text = user_id::text);

-- 5. Verificar
SELECT 
    '✅ Políticas creadas correctamente' as resultado,
    COUNT(*) as total_politicas
FROM pg_policies
WHERE tablename = 'post_reactions';

-- 6. Mostrar detalles
SELECT 
    policyname as politica,
    cmd as operacion
FROM pg_policies
WHERE tablename = 'post_reactions'
ORDER BY cmd;
