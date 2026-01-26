-- ============================================
-- CONFIGURACIÓN DE STORAGE BUCKETS Y POLÍTICAS
-- Vecino Activo - Supabase Storage Setup
-- ============================================

-- NOTA: Este script debe ejecutarse en el SQL Editor de Supabase
-- Dashboard > SQL Editor > New Query

-- ============================================
-- 1. CREAR BUCKETS
-- ============================================

-- Bucket: avatars (Fotos de perfil)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: posts (Imágenes de publicaciones)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: events (Imágenes de eventos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'events',
  'events',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: businesses (Logos e imágenes de negocios)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'businesses',
  'businesses',
  true,
  3145728, -- 3MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: projects (Imágenes de proyectos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'projects',
  'projects',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: resources (Imágenes de recursos compartidos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  true,
  3145728, -- 3MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket: albums (Fotos de álbumes comunitarios)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'albums',
  'albums',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. POLÍTICAS RLS PARA AVATARS
-- ============================================

-- Lectura pública
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Upload solo al dueño
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Actualización solo al dueño
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Eliminación solo al dueño
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 3. POLÍTICAS RLS PARA POSTS
-- ============================================

-- Lectura pública
CREATE POLICY "Post images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- Upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' 
  AND auth.role() = 'authenticated'
);

-- Actualización al dueño
CREATE POLICY "Users can update their own post images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Eliminación al dueño
CREATE POLICY "Users can delete their own post images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 4. POLÍTICAS RLS PARA EVENTS
-- ============================================

-- Lectura pública
CREATE POLICY "Event images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'events');

-- Upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'events' 
  AND auth.role() = 'authenticated'
);

-- Actualización al dueño
CREATE POLICY "Users can update their own event images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'events' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Eliminación al dueño
CREATE POLICY "Users can delete their own event images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'events' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 5. POLÍTICAS RLS PARA BUSINESSES
-- ============================================

-- Lectura pública
CREATE POLICY "Business images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'businesses');

-- Upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload business images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'businesses' 
  AND auth.role() = 'authenticated'
);

-- Actualización al dueño
CREATE POLICY "Users can update their own business images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'businesses' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Eliminación al dueño
CREATE POLICY "Users can delete their own business images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'businesses' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 6. POLÍTICAS RLS PARA PROJECTS
-- ============================================

-- Lectura pública
CREATE POLICY "Project images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'projects');

-- Upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'projects' 
  AND auth.role() = 'authenticated'
);

-- Actualización al dueño
CREATE POLICY "Users can update their own project images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'projects' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Eliminación al dueño
CREATE POLICY "Users can delete their own project images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'projects' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 7. POLÍTICAS RLS PARA RESOURCES
-- ============================================

-- Lectura pública
CREATE POLICY "Resource images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

-- Upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload resource images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resources' 
  AND auth.role() = 'authenticated'
);

-- Actualización al dueño
CREATE POLICY "Users can update their own resource images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resources' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Eliminación al dueño
CREATE POLICY "Users can delete their own resource images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resources' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- 8. POLÍTICAS RLS PARA ALBUMS
-- ============================================

-- Lectura pública
CREATE POLICY "Album photos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'albums');

-- Upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload album photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'albums' 
  AND auth.role() = 'authenticated'
);

-- Actualización al dueño
CREATE POLICY "Users can update their own album photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'albums' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Eliminación al dueño
CREATE POLICY "Users can delete their own album photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'albums' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que los buckets se crearon correctamente
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('avatars', 'posts', 'events', 'businesses', 'projects', 'resources', 'albums')
ORDER BY id;

-- Verificar políticas creadas
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. Este script crea 7 buckets públicos con límites de tamaño apropiados
2. Cada bucket tiene 4 políticas RLS:
   - SELECT: Lectura pública
   - INSERT: Solo usuarios autenticados
   - UPDATE: Solo el dueño del archivo
   - DELETE: Solo el dueño del archivo

3. Estructura de carpetas recomendada:
   - avatars: {user_id}/{filename}
   - posts: {user_id}/{post_id}/{filename}
   - events: {event_id}/{filename}
   - businesses: {business_id}/{type}/{filename}
   - projects: {project_id}/{filename}
   - resources: {resource_id}/{filename}
   - albums: {album_id}/{filename}

4. Para probar el upload, usa el servicio supabaseStorageService
   que ya está implementado en src/services/supabaseStorageService.js

5. Límites de tamaño:
   - avatars: 2MB
   - posts: 5MB
   - events: 5MB
   - businesses: 3MB
   - projects: 5MB
   - resources: 3MB
   - albums: 10MB

6. Tipos MIME permitidos:
   - Todos: image/jpeg, image/png, image/webp
   - Posts también: image/gif

7. Si necesitas modificar límites o tipos MIME, usa:
   UPDATE storage.buckets 
   SET file_size_limit = 10485760 
   WHERE id = 'bucket_name';
*/
