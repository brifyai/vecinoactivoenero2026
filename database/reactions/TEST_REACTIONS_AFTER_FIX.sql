-- =====================================================
-- PROBAR QUE LAS REACCIONES FUNCIONAN DESPUÉS DEL FIX
-- =====================================================

-- 1. Verificar que RLS está habilitado
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'post_reactions';
-- Resultado esperado: rls_enabled = true

-- 2. Verificar las políticas creadas
SELECT 
    policyname,
    cmd as operation,
    CASE 
        WHEN cmd = 'SELECT' THEN 'Todos pueden ver reacciones'
        WHEN cmd = 'INSERT' THEN 'Usuarios autenticados pueden insertar'
        WHEN cmd = 'DELETE' THEN 'Usuarios pueden eliminar sus reacciones'
    END as description
FROM pg_policies
WHERE tablename = 'post_reactions'
ORDER BY cmd;
-- Resultado esperado: 3 políticas (SELECT, INSERT, DELETE)

-- 3. Contar reacciones totales
SELECT COUNT(*) as total_reacciones FROM post_reactions;
-- Debe mostrar el número de reacciones existentes

-- 4. Ver posts con más reacciones
SELECT 
    p.id,
    LEFT(p.content, 50) as content_preview,
    COUNT(pr.id) as num_reacciones,
    STRING_AGG(DISTINCT pr.emoji, ' ') as emojis_unicos
FROM posts p
LEFT JOIN post_reactions pr ON p.id = pr.post_id
GROUP BY p.id, p.content
HAVING COUNT(pr.id) > 0
ORDER BY num_reacciones DESC
LIMIT 10;
-- Debe mostrar posts con sus reacciones

-- 5. Ver distribución de emojis
SELECT 
    emoji,
    COUNT(*) as cantidad,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM post_reactions), 2) as porcentaje
FROM post_reactions
GROUP BY emoji
ORDER BY cantidad DESC;
-- Debe mostrar qué emojis son más populares

-- 6. Verificar que auth.uid() funciona (ejecutar cuando estés autenticado)
SELECT 
    auth.uid() as mi_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ No estás autenticado'
        ELSE '✅ Autenticado correctamente'
    END as estado;
-- Si estás autenticado, debe mostrar tu UUID

-- 7. Ver tus propias reacciones (reemplaza 'TU_USER_ID' con tu UUID)
-- SELECT 
--     pr.emoji,
--     p.content,
--     pr.created_at
-- FROM post_reactions pr
-- JOIN posts p ON pr.post_id = p.id
-- WHERE pr.user_id = 'TU_USER_ID'
-- ORDER BY pr.created_at DESC
-- LIMIT 10;

-- 8. Verificar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'post_reactions'
ORDER BY ordinal_position;
-- Debe mostrar: id, post_id, user_id, emoji, created_at

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- ✅ RLS habilitado
-- ✅ 3 políticas activas (SELECT, INSERT, DELETE)
-- ✅ Reacciones existentes visibles
-- ✅ auth.uid() devuelve tu UUID cuando estás autenticado
-- ✅ Estructura de tabla correcta con columna 'emoji'
