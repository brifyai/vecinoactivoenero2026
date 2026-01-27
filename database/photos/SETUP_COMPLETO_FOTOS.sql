-- ============================================
-- SETUP COMPLETO DEL SISTEMA DE FOTOS
-- ============================================
-- Ejecuta este script COMPLETO en el SQL Editor de Supabase
-- Este script crea las tablas, índices, políticas y storage

-- ============================================
-- PASO 1: CREAR TABLAS
-- ============================================

-- Tabla de álbumes
CREATE TABLE IF NOT EXISTS photo_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de fotos
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
-- PASO 2: CREAR ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_albums_user_id ON photo_albums(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_created_at ON photo_albums(created_at DESC);

-- ============================================
-- PASO 3: HABILITAR RLS
-- ============================================

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASO 4: POLÍTICAS RLS PARA photo_albums
-- ============================================

DROP POLICY IF EXISTS "Users can view own albums" ON photo_albums;
DROP POLICY IF EXISTS "Users can create own albums" ON photo_albums;
DROP POLICY IF EXISTS "Users can update own albums" ON photo_albums;
DROP POLICY IF EXISTS "Users can delete own albums" ON photo_albums;

CREATE POLICY "Users can view own albums"
ON photo_albums FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own albums"
ON photo_albums FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own albums"
ON photo_albums FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own albums"
ON photo_albums FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- PASO 5: POLÍTICAS RLS PARA photos
-- ============================================

DROP POLICY IF EXISTS "Users can view own photos" ON photos;
DROP POLICY IF EXISTS "Users can create own photos" ON photos;
DROP POLICY IF EXISTS "Users can update own photos" ON photos;
DROP POLICY IF EXISTS "Users can delete own photos" ON photos;

CREATE POLICY "Users can view own photos"
ON photos FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own photos"
ON photos FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own photos"
ON photos FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own photos"
ON photos FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- PASO 6: CREAR BUCKET DE STORAGE
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PASO 7: POLÍTICAS DE STORAGE
-- ============================================

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- PASO 8: FUNCIONES AUXILIARES
-- ============================================

CREATE OR REPLACE FUNCTION get_album_photo_count(album_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM photos WHERE album_id = album_uuid);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_user_photo_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM photos WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- PASO 9: TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_album_cover_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.album_id IS NOT NULL THEN
    UPDATE photo_albums
    SET cover_photo = NEW.url
    WHERE id = NEW.album_id AND cover_photo IS NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_album_cover ON photos;
CREATE TRIGGER trigger_update_album_cover
  AFTER INSERT ON photos
  FOR EACH ROW
  EXECUTE FUNCTION update_album_cover_photo();

CREATE OR REPLACE FUNCTION cleanup_album_cover_photo()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.album_id IS NOT NULL THEN
    UPDATE photo_albums
    SET cover_photo = (
      SELECT url FROM photos
      WHERE album_id = OLD.album_id AND id != OLD.id
      ORDER BY uploaded_at DESC LIMIT 1
    )
    WHERE id = OLD.album_id AND cover_photo = OLD.url;
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
-- PASO 10: VERIFICACIÓN
-- ============================================

-- Verificar tablas creadas
SELECT 
  'Tabla: ' || table_name as resultado,
  'Creada ✅' as estado
FROM information_schema.tables 
WHERE table_name IN ('photos', 'photo_albums')
  AND table_schema = 'public'

UNION ALL

-- Verificar bucket
SELECT 
  'Bucket: ' || name as resultado,
  'Creado ✅' as estado
FROM storage.buckets 
WHERE id = 'photos'

UNION ALL

-- Verificar políticas de tablas
SELECT 
  'Políticas RLS: ' || tablename as resultado,
  COUNT(*)::text || ' políticas ✅' as estado
FROM pg_policies 
WHERE tablename IN ('photos', 'photo_albums')
GROUP BY tablename

UNION ALL

-- Verificar políticas de storage
SELECT 
  'Políticas Storage' as resultado,
  COUNT(*)::text || ' políticas ✅' as estado
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================
-- ¡LISTO! 🎉
-- ============================================
-- Si ves resultados con ✅, todo está configurado correctamente
-- Ahora puedes usar el sistema de fotos en tu aplicación
