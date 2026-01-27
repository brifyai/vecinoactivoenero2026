-- ============================================
-- CONFIGURACIÓN DE STORAGE PARA FOTOS
-- ============================================
-- Este script configura el bucket de storage y las políticas
-- para el sistema de fotos de Vecino Activo

-- ============================================
-- 1. CREAR BUCKET DE FOTOS
-- ============================================
-- Nota: Si el bucket ya existe, este comando fallará pero no es problema

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,  -- Público para lectura
  10485760,  -- 10 MB límite por archivo
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. POLÍTICAS DE ACCESO
-- ============================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;

-- Política 1: Lectura pública
-- Permite que cualquiera pueda ver las fotos
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Política 2: Subida autenticada
-- Solo usuarios autenticados pueden subir fotos
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos' 
  AND auth.role() = 'authenticated'
  -- Las fotos deben estar en la carpeta del usuario
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política 3: Actualización (solo dueño)
-- Los usuarios solo pueden actualizar sus propias fotos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política 4: Eliminación (solo dueño)
-- Los usuarios solo pueden eliminar sus propias fotos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 3. VERIFICACIÓN
-- ============================================

-- Verificar que el bucket se creó correctamente
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'photos';

-- Verificar las políticas
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
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND policyname LIKE '%photos%'
ORDER BY policyname;

-- ============================================
-- 4. ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índice para búsquedas por usuario en photos
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC);

-- Índice para búsquedas por usuario en photo_albums
CREATE INDEX IF NOT EXISTS idx_photo_albums_user_id ON photo_albums(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_albums_created_at ON photo_albums(created_at DESC);

-- ============================================
-- 5. FUNCIONES AUXILIARES
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

-- Función para obtener el total de álbumes de un usuario
CREATE OR REPLACE FUNCTION get_user_album_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM photo_albums
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 6. TRIGGERS
-- ============================================

-- Trigger para actualizar la foto de portada del álbum automáticamente
CREATE OR REPLACE FUNCTION update_album_cover_photo()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se inserta una foto en un álbum que no tiene cover_photo
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
  -- Si se elimina una foto que era la portada del álbum
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
-- 7. PERMISOS RLS EN TABLAS
-- ============================================

-- Habilitar RLS en las tablas si no está habilitado
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;

-- Políticas para photo_albums
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

-- Políticas para photos
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
-- 8. VERIFICACIÓN FINAL
-- ============================================

-- Mostrar resumen de la configuración
SELECT 
  'Storage Bucket' as tipo,
  name as nombre,
  CASE WHEN public THEN 'Público' ELSE 'Privado' END as acceso,
  file_size_limit / 1024 / 1024 || ' MB' as limite_tamaño
FROM storage.buckets
WHERE id = 'photos'

UNION ALL

SELECT 
  'Políticas Storage' as tipo,
  COUNT(*)::text as nombre,
  'Configuradas' as acceso,
  '' as limite_tamaño
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'

UNION ALL

SELECT 
  'Políticas photo_albums' as tipo,
  COUNT(*)::text as nombre,
  'Configuradas' as acceso,
  '' as limite_tamaño
FROM pg_policies
WHERE tablename = 'photo_albums'

UNION ALL

SELECT 
  'Políticas photos' as tipo,
  COUNT(*)::text as nombre,
  'Configuradas' as acceso,
  '' as limite_tamaño
FROM pg_policies
WHERE tablename = 'photos';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
/*
1. Este script debe ejecutarse en el SQL Editor de Supabase
2. Requiere permisos de administrador
3. Las políticas RLS protegen los datos a nivel de base de datos
4. Las políticas de Storage protegen los archivos
5. Los triggers mantienen la integridad de los datos automáticamente
6. Los índices mejoran el rendimiento de las consultas

ESTRUCTURA DE CARPETAS EN STORAGE:
photos/
  └── {user_id}/
      ├── {timestamp1}.jpg
      ├── {timestamp2}.png
      └── ...

EJEMPLO DE USO:
- Subir foto: POST /storage/v1/object/photos/{user_id}/{timestamp}.jpg
- Ver foto: GET /storage/v1/object/public/photos/{user_id}/{timestamp}.jpg
- Eliminar foto: DELETE /storage/v1/object/photos/{user_id}/{timestamp}.jpg
*/
