-- ============================================
-- CREAR TABLAS DE FOTOS Y ÁLBUMES
-- ============================================
-- Ejecuta este script PRIMERO antes del setup de storage

-- ============================================
-- 1. CREAR TABLA photo_albums
-- ============================================
CREATE TABLE IF NOT EXISTS photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREAR TABLA photos
-- ============================================
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  album_id UUID REFERENCES photo_albums(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  caption TEXT,
  tags TEXT[],
  likes INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CREAR ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_albums_user_id ON photo_albums(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_created_at ON photo_albums(created_at DESC);

-- ============================================
-- 4. HABILITAR RLS (Row Level Security)
-- ============================================
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. POLÍTICAS RLS PARA photo_albums
-- ============================================
DROP POLICY IF EXISTS "Users can view own albums" ON photo_albums;
DROP POLICY IF EXISTS "Users can create own albums" ON photo_albums;
DROP POLICY IF EXISTS "Users can update own albums" ON photo_albums;
DROP POLICY IF EXISTS "Users can delete own albums" ON photo_albums;

CREATE POLICY "Users can view own albums"
ON photo_albums FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own albums"
ON photo_albums FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own albums"
ON photo_albums FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own albums"
ON photo_albums FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 6. POLÍTICAS RLS PARA photos
-- ============================================
DROP POLICY IF EXISTS "Users can view own photos" ON photos;
DROP POLICY IF EXISTS "Users can create own photos" ON photos;
DROP POLICY IF EXISTS "Users can update own photos" ON photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON photos;

CREATE POLICY "Users can view own photos"
ON photos FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own photos"
ON photos FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own photos"
ON photos FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own photos"
ON photos FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 7. FUNCIONES AUXILIARES
-- ============================================

-- Función para obtener el conteo de fotos por álbum
CREATE OR REPLACE FUNCTION get_album_photo_count(album_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM photos
    WHERE album_id = album_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para obtener el total de fotos de un usuario
CREATE OR REPLACE FUNCTION get_user_photo_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM photos
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 8. TRIGGERS
-- ============================================

-- Trigger para actualizar la foto de portada del álbum automáticamente
CREATE OR REPLACE FUNCTION update_album_cover_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.album_id IS NOT NULL THEN
    UPDATE photo_albums
    SET cover_photo = NEW.url
    WHERE id = NEW.album_id
      AND cover_photo IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_album_cover ON photos;
CREATE TRIGGER trigger_update_album_cover
  AFTER INSERT ON photos
  FOR EACH ROW
  EXECUTE FUNCTION update_album_cover_photo();

-- Trigger para limpiar la foto de portada si se elimina
CREATE OR REPLACE FUNCTION cleanup_album_cover_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.album_id IS NOT NULL THEN
    UPDATE photo_albums
    SET cover_photo = (
      SELECT url
      FROM photos
      WHERE album_id = OLD.album_id
        AND id != OLD.id
      ORDER BY uploaded_at DESC
      LIMIT 1
    )
    WHERE id = OLD.album_id
      AND cover_photo = OLD.url;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_album_cover ON photos;
CREATE TRIGGER trigger_cleanup_album_cover
  BEFORE DELETE ON photos
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_album_cover_photo();

-- ============================================
-- 9. VERIFICACIÓN
-- ============================================
SELECT 
  'Tabla photo_albums' as tabla,
  COUNT(*) as registros
FROM photo_albums

UNION ALL

SELECT 
  'Tabla photos' as tabla,
  COUNT(*) as registros
FROM photos;

-- Mostrar políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename IN ('photos', 'photo_albums')
ORDER BY tablename, policyname;
