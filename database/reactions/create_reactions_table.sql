-- ============================================
-- CREAR TABLA DE REACCIONES A POSTS
-- ============================================

-- Tabla para almacenar las reacciones de los usuarios a los posts
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(10) NOT NULL, -- Emoji de la reacción: '🤝', '❤️', '👏', '💡', '🙌'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un usuario solo puede tener una reacción por post
  UNIQUE(post_id, user_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_created_at ON post_reactions(created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Todos pueden ver las reacciones
DROP POLICY IF EXISTS "Anyone can view reactions" ON post_reactions;
CREATE POLICY "Anyone can view reactions"
ON post_reactions FOR SELECT
TO authenticated
USING (true);

-- Políticas RLS: Los usuarios pueden crear sus propias reacciones
DROP POLICY IF EXISTS "Users can create own reactions" ON post_reactions;
CREATE POLICY "Users can create own reactions"
ON post_reactions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Políticas RLS: Los usuarios pueden actualizar sus propias reacciones
DROP POLICY IF EXISTS "Users can update own reactions" ON post_reactions;
CREATE POLICY "Users can update own reactions"
ON post_reactions FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Políticas RLS: Los usuarios pueden eliminar sus propias reacciones
DROP POLICY IF EXISTS "Users can delete own reactions" ON post_reactions;
CREATE POLICY "Users can delete own reactions"
ON post_reactions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_post_reactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_post_reactions_updated_at ON post_reactions;
CREATE TRIGGER trigger_update_post_reactions_updated_at
  BEFORE UPDATE ON post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_reactions_updated_at();

-- Función para obtener el conteo de reacciones por post
CREATE OR REPLACE FUNCTION get_post_reactions_count(post_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM post_reactions
    WHERE post_id = post_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para obtener las reacciones únicas de un post (máximo 3)
CREATE OR REPLACE FUNCTION get_post_unique_reactions(post_uuid UUID)
RETURNS TEXT[] AS $$
BEGIN
  RETURN (
    SELECT ARRAY_AGG(DISTINCT reaction_type ORDER BY reaction_type)
    FROM (
      SELECT reaction_type
      FROM post_reactions
      WHERE post_id = post_uuid
      LIMIT 3
    ) AS unique_reactions
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Verificación
SELECT 
  'Tabla post_reactions' as tabla,
  COUNT(*) as registros
FROM post_reactions;

-- Mostrar políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename = 'post_reactions'
ORDER BY policyname;
