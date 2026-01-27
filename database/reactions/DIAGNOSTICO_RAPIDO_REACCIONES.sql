-- =====================================================
-- DIAGNÓSTICO RÁPIDO: ¿Por qué no se guardan las reacciones?
-- =====================================================

-- 1. ¿Existe la tabla?
SELECT 
    '1. Tabla post_reactions' as verificacion,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'post_reactions'
    ) THEN '✅ EXISTE' ELSE '❌ NO EXISTE' END as resultado;

-- 2. ¿RLS está habilitado?
SELECT 
    '2. RLS habilitado' as verificacion,
    CASE WHEN rowsecurity THEN '✅ SÍ' ELSE '❌ NO' END as resultado
FROM pg_tables
WHERE tablename = 'post_reactions';

-- 3. ¿Cuántas políticas hay?
SELECT 
    '3. Políticas RLS' as verificacion,
    COUNT(*)::text || ' políticas activas' as resultado
FROM pg_policies
WHERE tablename = 'post_reactions';

-- 4. Detalles de las políticas
SELECT 
    '4. Detalle de políticas' as seccion,
    policyname as nombre_politica,
    cmd as operacion,
    CASE 
        WHEN cmd = 'SELECT' THEN '✅ Lectura'
        WHEN cmd = 'INSERT' THEN '✅ Inserción'
        WHEN cmd = 'DELETE' THEN '✅ Eliminación'
        ELSE '⚠️ Otra'
    END as tipo
FROM pg_policies
WHERE tablename = 'post_reactions'
ORDER BY cmd;

-- 5. ¿Existe la columna emoji?
SELECT 
    '5. Columna emoji' as verificacion,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'post_reactions' AND column_name = 'emoji'
    ) THEN '✅ EXISTE' ELSE '❌ NO EXISTE (problema!)' END as resultado;

-- 6. ¿Cuántas reacciones hay?
SELECT 
    '6. Reacciones totales' as verificacion,
    COUNT(*)::text || ' reacciones en la BD' as resultado
FROM post_reactions;

-- 7. ¿Estás autenticado? (ejecutar cuando estés logueado)
SELECT 
    '7. Autenticación' as verificacion,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ AUTENTICADO (UUID: ' || auth.uid()::text || ')'
        ELSE '❌ NO AUTENTICADO'
    END as resultado;

-- 8. Estructura de la tabla
SELECT 
    '8. Estructura tabla' as seccion,
    column_name as columna,
    data_type as tipo,
    is_nullable as permite_null
FROM information_schema.columns
WHERE table_name = 'post_reactions'
ORDER BY ordinal_position;

-- =====================================================
-- INTERPRETACIÓN DE RESULTADOS
-- =====================================================

-- ✅ TODO BIEN si ves:
-- 1. Tabla EXISTE
-- 2. RLS SÍ
-- 3. 3 políticas activas
-- 4. Políticas: SELECT, INSERT, DELETE
-- 5. Columna emoji EXISTE
-- 6. Algunas reacciones en la BD
-- 7. AUTENTICADO con tu UUID
-- 8. Columnas: id, post_id, user_id, emoji, created_at

-- ❌ PROBLEMA si ves:
-- - Tabla NO EXISTE → Ejecutar script de creación
-- - RLS NO → Ejecutar FIX_REACTIONS_RLS_DEFINITIVO.sql
-- - Menos de 3 políticas → Ejecutar FIX_REACTIONS_RLS_DEFINITIVO.sql
-- - Columna emoji NO EXISTE → Problema grave, contactar soporte
-- - NO AUTENTICADO → Iniciar sesión en la aplicación

-- =====================================================
-- PRUEBA MANUAL DE INSERCIÓN
-- =====================================================

-- Si todo lo anterior está bien, intenta insertar manualmente:
-- (Reemplaza los UUIDs con valores reales)

-- Primero, obtén un post_id válido:
SELECT id, LEFT(content, 50) as content_preview 
FROM posts 
LIMIT 5;

-- Luego, obtén tu user_id:
SELECT auth.uid() as mi_user_id;

-- Finalmente, intenta insertar (reemplaza los valores):
-- INSERT INTO post_reactions (post_id, user_id, emoji)
-- VALUES (
--     'PEGA_AQUI_UN_POST_ID',
--     'PEGA_AQUI_TU_USER_ID',
--     '🤝'
-- );

-- Si la inserción manual funciona → El problema está en el código frontend
-- Si la inserción manual falla → El problema está en las políticas RLS
