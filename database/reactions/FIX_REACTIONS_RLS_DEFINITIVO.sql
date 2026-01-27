-- =====================================================
-- ARREGLAR RLS DE POST_REACTIONS - SOLUCIÓN DEFINITIVA
-- =====================================================
-- Este script soluciona el problema de que las reacciones
-- no se pueden insertar ni visualizar debido a políticas RLS incorrectas

-- 1. Deshabilitar RLS temporalmente
ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar TODAS las políticas existentes de forma segura
DROP POLICY IF EXISTS "Anyone can view reactions" ON post_reactions;
DROP POLICY IF EXISTS "Authenticated users can add reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON post_reactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON post_reactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON post_reactions;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON post_reactions;

-- 3. Habilitar RLS nuevamente
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas nuevas y correctas

-- Política SELECT: Todos pueden ver las reacciones (incluso usuarios no autenticados)
CREATE POLICY "post_reactions_select_policy"
ON post_reactions
FOR SELECT
USING (true);

-- Política INSERT: Usuarios autenticados pueden insertar reacciones
-- La clave es que user_id debe coincidir con el usuario autenticado
CREATE POLICY "post_reactions_insert_policy"
ON post_reactions
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- Política DELETE: Usuarios pueden eliminar solo sus propias reacciones
CREATE POLICY "post_reactions_delete_policy"
ON post_reactions
FOR DELETE
USING (auth.uid()::text = user_id::text);

-- 5. Verificar que las políticas se crearon correctamente
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'post_reactions'
ORDER BY cmd, policyname;

-- 6. Verificar que RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'post_reactions';

-- 7. Probar que podemos ver las reacciones existentes
SELECT COUNT(*) as total_reacciones FROM post_reactions;

-- 8. Ver algunas reacciones de ejemplo
SELECT 
    pr.id,
    pr.post_id,
    pr.user_id,
    pr.emoji,
    pr.created_at
FROM post_reactions pr
LIMIT 5;
