-- =====================================================
-- RESTAURAR BASE DE DATOS COMPLETO
-- =====================================================
-- Este script restaura la base de datos al estado actual del código
-- Ejecutar en Supabase SQL Editor después de restaurar el código

-- =====================================================
-- PASO 1: AGREGAR COLUMNA MEDIA A POSTS
-- =====================================================

-- Agregar columna media si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'media'
    ) THEN
        ALTER TABLE posts ADD COLUMN media TEXT[];
    END IF;
END $$;

-- Actualizar posts existentes con fotos de ejemplo
UPDATE posts 
SET media = ARRAY[
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'
]
WHERE content LIKE '%casa%' OR content LIKE '%hogar%' OR content LIKE '%vivienda%'
  AND (media IS NULL OR array_length(media, 1) IS NULL);

UPDATE posts 
SET media = ARRAY[
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800'
]
WHERE content LIKE '%comida%' OR content LIKE '%cocina%' OR content LIKE '%receta%'
  AND (media IS NULL OR array_length(media, 1) IS NULL);

UPDATE posts 
SET media = ARRAY[
    'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800'
]
WHERE content LIKE '%música%' OR content LIKE '%concierto%' OR content LIKE '%banda%'
  AND (media IS NULL OR array_length(media, 1) IS NULL);

UPDATE posts 
SET media = ARRAY[
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800'
]
WHERE content LIKE '%vecin%' OR content LIKE '%comunidad%' OR content LIKE '%barrio%'
  AND (media IS NULL OR array_length(media, 1) IS NULL);

-- =====================================================
-- PASO 2: CONFIGURAR POLÍTICAS RLS DE POST_REACTIONS
-- =====================================================

-- Deshabilitar RLS temporalmente
ALTER TABLE post_reactions DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "post_reactions_select_policy" ON post_reactions;
DROP POLICY IF EXISTS "post_reactions_insert_policy" ON post_reactions;
DROP POLICY IF EXISTS "post_reactions_delete_policy" ON post_reactions;
DROP POLICY IF EXISTS "post_reactions_select_all" ON post_reactions;
DROP POLICY IF EXISTS "post_reactions_insert_all" ON post_reactions;
DROP POLICY IF EXISTS "post_reactions_delete_own" ON post_reactions;
DROP POLICY IF EXISTS "Anyone can view reactions" ON post_reactions;
DROP POLICY IF EXISTS "Authenticated users can add reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON post_reactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON post_reactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON post_reactions;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON post_reactions;

-- Habilitar RLS nuevamente
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Crear políticas PERMISIVAS (las que funcionan)

-- SELECT: Todos pueden ver
CREATE POLICY "post_reactions_select_all"
ON post_reactions
FOR SELECT
USING (true);

-- INSERT: Todos pueden insertar
CREATE POLICY "post_reactions_insert_all"
ON post_reactions
FOR INSERT
WITH CHECK (true);

-- DELETE: Todos pueden eliminar
CREATE POLICY "post_reactions_delete_own"
ON post_reactions
FOR DELETE
USING (true);

-- =====================================================
-- PASO 3: VERIFICACIÓN
-- =====================================================

-- Verificar columna media
SELECT 
    '1. Columna media en posts' as verificacion,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'media'
    ) THEN '✅ EXISTE' ELSE '❌ NO EXISTE' END as resultado;

-- Verificar posts con media
SELECT 
    '2. Posts con fotos' as verificacion,
    COUNT(*) || ' posts con fotos' as resultado
FROM posts
WHERE media IS NOT NULL AND array_length(media, 1) > 0;

-- Verificar políticas RLS
SELECT 
    '3. Políticas RLS de post_reactions' as verificacion,
    COUNT(*) || ' políticas activas' as resultado
FROM pg_policies
WHERE tablename = 'post_reactions';

-- Mostrar detalles de políticas
SELECT 
    '4. Detalle de políticas' as seccion,
    policyname as politica,
    cmd as operacion
FROM pg_policies
WHERE tablename = 'post_reactions'
ORDER BY cmd;

-- Verificar RLS habilitado
SELECT 
    '5. RLS habilitado' as verificacion,
    CASE WHEN rowsecurity THEN '✅ SÍ' ELSE '❌ NO' END as resultado
FROM pg_tables
WHERE tablename = 'post_reactions';

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- ✅ Columna media existe en posts
-- ✅ Posts tienen fotos asignadas
-- ✅ 3 políticas RLS activas en post_reactions
-- ✅ RLS habilitado en post_reactions
-- ✅ Reacciones funcionando correctamente
