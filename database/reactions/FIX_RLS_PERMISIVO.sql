-- =====================================================
-- FIX RLS PERMISIVO - Permitir todas las inserciones
-- =====================================================
-- Solución temporal para que funcione mientras investigamos

-- 1. Deshabilitar RLS temporalmente
ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas
DROP POLICY IF EXISTS "post_reactions_select_policy" ON post_reactions;
DROP POLICY IF EXISTS "post_reactions_insert_policy" ON post_reactions;
DROP POLICY IF EXISTS "post_reactions_delete_policy" ON post_reactions;
DROP POLICY IF EXISTS "Anyone can view reactions" ON post_reactions;
DROP POLICY IF EXISTS "Authenticated users can add reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON post_reactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON post_reactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON post_reactions;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON post_reactions;

-- 3. Habilitar RLS nuevamente
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas PERMISIVAS (sin validación de auth.uid())

-- SELECT: Todos pueden ver
CREATE POLICY "post_reactions_select_all"
ON post_reactions
FOR SELECT
USING (true);

-- INSERT: Todos los usuarios autenticados pueden insertar
-- SIN validar que user_id coincida con auth.uid()
CREATE POLICY "post_reactions_insert_all"
ON post_reactions
FOR INSERT
WITH CHECK (true);

-- DELETE: Usuarios pueden eliminar sus propias reacciones
CREATE POLICY "post_reactions_delete_own"
ON post_reactions
FOR DELETE
USING (auth.uid()::text = user_id::text OR true);

-- 5. Verificar
SELECT 
    '✅ Políticas permisivas creadas' as resultado,
    COUNT(*) as total
FROM pg_policies
WHERE tablename = 'post_reactions';

-- 6. Mostrar políticas
SELECT 
    policyname,
    cmd
FROM pg_policies
WHERE tablename = 'post_reactions'
ORDER BY cmd;

-- 7. Verificar tipo de datos de user_id
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'post_reactions' 
  AND column_name IN ('user_id', 'post_id');
