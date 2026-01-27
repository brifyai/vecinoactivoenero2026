-- =====================================================
-- VERIFICAR POLÍTICAS RLS DE POST_REACTIONS
-- =====================================================

-- Ver todas las políticas actuales
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'post_reactions';

-- Ver si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'post_reactions';
