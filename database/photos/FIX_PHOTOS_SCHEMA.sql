-- ============================================
-- FIX: Esquema de Fotos - Solución de Errores FK
-- ============================================
-- Este script corrige el error: "Could not find a relationship between 'photos' and 'photo_albums'"
-- Ejecuta este script en el SQL Editor de Supabase

-- ============================================
-- PASO 1: Verificar si las tablas existen
-- ============================================
DO $$ 
BEGIN
  -- Verificar photo_albums
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'photo_albums') THEN
    RAISE NOTICE 'Creando tabla photo_albums...';
    
    CREATE TABLE photo_albums (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      cover_photo TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Índices
    CREATE INDEX idx_photo_albums_user_id ON photo_albums(user_id);
    CREATE INDEX idx_photo_albums_created_at ON photo_albums(created_at DESC);
    
    -- RLS
    ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
    
    -- Políticas
    CREATE POLICY "Users can view own albums" ON photo_albums FOR SELECT TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "Users can create own albums" ON photo_albums FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "Users can update own albums" ON photo_albums FOR UPDATE TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "Users can delete own albums" ON photo_albums FOR DELETE TO authenticated USING (user_id = auth.uid());
    
    RAISE NOTICE 'Tabla photo_albums creada exitosamente';
  ELSE
    RAISE NOTICE 'Tabla photo_albums ya existe';
  END IF;

  -- Verificar photos
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'photos') THEN
    RAISE NOTICE 'Creando tabla photos...';
    
    CREATE TABLE photos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      album_id UUID REFERENCES photo_albums(id) ON DELETE SET NULL,
      url TEXT NOT NULL,
      caption TEXT,
      tags TEXT[],
      likes INTEGER DEFAULT 0,
      uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Índices
    CREATE INDEX idx_photos_user_id ON photos(user_id);
    CREATE INDEX idx_photos_album_id ON photos(album_id);
    CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at DESC);
    
    -- RLS
    ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
    
    -- Políticas
    CREATE POLICY "Users can view own photos" ON photos FOR SELECT TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "Users can create own photos" ON photos FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
    CREATE POLICY "Users can update own photos" ON photos FOR UPDATE TO authenticated USING (user_id = auth.uid());
    CREATE POLICY "Users can delete own photos" ON photos FOR DELETE TO authenticated USING (user_id = auth.uid());
    
    RAISE NOTICE 'Tabla photos creada exitosamente';
  ELSE
    RAISE NOTICE 'Tabla photos ya existe';
  END IF;
END $$;

-- ============================================
-- PASO 2: Verificar Foreign Keys
-- ============================================
DO $$ 
BEGIN
  -- Verificar si existe la FK de photos a photo_albums
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
      AND table_name = 'photos' 
      AND constraint_name LIKE '%album_id%'
  ) THEN
    RAISE NOTICE 'Agregando foreign key photos.album_id -> photo_albums.id';
    ALTER TABLE photos 
      ADD CONSTRAINT photos_album_id_fkey 
      FOREIGN KEY (album_id) 
      REFERENCES photo_albums(id) 
      ON DELETE SET NULL;
  ELSE
    RAISE NOTICE 'Foreign key photos.album_id ya existe';
  END IF;
END $$;

-- ============================================
-- PASO 3: Refrescar el Schema Cache de Supabase
-- ============================================
-- Esto es importante para que Supabase reconozca las relaciones
NOTIFY pgrst, 'reload schema';

-- ============================================
-- PASO 4: Verificación Final
-- ============================================
SELECT 
  'Tablas creadas' as status,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'photo_albums') as photo_albums,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'photos') as photos;

SELECT 
  'Foreign Keys' as status,
  constraint_name,
  table_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name IN ('photos', 'photo_albums')
  AND constraint_type = 'FOREIGN KEY';

SELECT 
  'Políticas RLS' as status,
  tablename,
  policyname
FROM pg_policies
WHERE tablename IN ('photos', 'photo_albums')
ORDER BY tablename, policyname;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- ✅ Tabla photo_albums creada o ya existe
-- ✅ Tabla photos creada o ya existe
-- ✅ Foreign key photos.album_id -> photo_albums.id existe
-- ✅ Schema cache refrescado
-- ✅ Políticas RLS configuradas
