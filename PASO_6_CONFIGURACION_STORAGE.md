# Paso 6.1: Configuración de Supabase Storage

## Objetivo

Configurar los buckets de Storage en Supabase para almacenar imágenes de usuarios, posts, eventos, negocios, etc.

---

## 📦 Buckets a Crear

### 1. Bucket: `avatars`
**Propósito:** Fotos de perfil de usuarios

**Configuración:**
- Public: ✅ Sí
- File size limit: 2MB
- Allowed MIME types: image/jpeg, image/png, image/webp
- Path structure: `{user_id}/{filename}`

**Políticas RLS:**
```sql
-- Permitir lectura pública
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Permitir upload solo al dueño
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir actualización solo al dueño
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir eliminación solo al dueño
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### 2. Bucket: `posts`
**Propósito:** Imágenes de publicaciones

**Configuración:**
- Public: ✅ Sí
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
- Path structure: `{user_id}/{post_id}/{filename}`

**Políticas RLS:**
```sql
-- Permitir lectura pública
CREATE POLICY "Post images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- Permitir upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' 
  AND auth.role() = 'authenticated'
);

-- Permitir actualización al dueño
CREATE POLICY "Users can update their own post images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir eliminación al dueño
CREATE POLICY "Users can delete their own post images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### 3. Bucket: `events`
**Propósito:** Imágenes de eventos

**Configuración:**
- Public: ✅ Sí
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp
- Path structure: `{event_id}/{filename}`

**Políticas RLS:**
```sql
-- Permitir lectura pública
CREATE POLICY "Event images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'events');

-- Permitir upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'events' 
  AND auth.role() = 'authenticated'
);
```

---

### 4. Bucket: `businesses`
**Propósito:** Logos e imágenes de negocios

**Configuración:**
- Public: ✅ Sí
- File size limit: 3MB
- Allowed MIME types: image/jpeg, image/png, image/webp
- Path structure: `{business_id}/{type}/{filename}`
  - type: `logo`, `gallery`, `offers`

**Políticas RLS:**
```sql
-- Permitir lectura pública
CREATE POLICY "Business images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'businesses');

-- Permitir upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload business images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'businesses' 
  AND auth.role() = 'authenticated'
);
```

---

### 5. Bucket: `projects`
**Propósito:** Imágenes de proyectos comunitarios

**Configuración:**
- Public: ✅ Sí
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp
- Path structure: `{project_id}/{filename}`

**Políticas RLS:**
```sql
-- Permitir lectura pública
CREATE POLICY "Project images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'projects');

-- Permitir upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'projects' 
  AND auth.role() = 'authenticated'
);
```

---

### 6. Bucket: `resources`
**Propósito:** Imágenes de recursos compartidos

**Configuración:**
- Public: ✅ Sí
- File size limit: 3MB
- Allowed MIME types: image/jpeg, image/png, image/webp
- Path structure: `{resource_id}/{filename}`

**Políticas RLS:**
```sql
-- Permitir lectura pública
CREATE POLICY "Resource images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'resources');

-- Permitir upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload resource images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resources' 
  AND auth.role() = 'authenticated'
);
```

---

### 7. Bucket: `albums`
**Propósito:** Fotos de álbumes comunitarios

**Configuración:**
- Public: ✅ Sí
- File size limit: 10MB
- Allowed MIME types: image/jpeg, image/png, image/webp
- Path structure: `{album_id}/{filename}`

**Políticas RLS:**
```sql
-- Permitir lectura pública
CREATE POLICY "Album photos are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'albums');

-- Permitir upload a usuarios autenticados
CREATE POLICY "Authenticated users can upload album photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'albums' 
  AND auth.role() = 'authenticated'
);
```

---

## 🚀 Pasos de Configuración

### 1. Crear Buckets en Supabase Dashboard

1. Ir a: https://app.supabase.com/project/YOUR_PROJECT/storage/buckets
2. Click en "New bucket"
3. Para cada bucket:
   - Name: `avatars`, `posts`, `events`, etc.
   - Public bucket: ✅ Marcar
   - File size limit: Según especificación
   - Allowed MIME types: Según especificación
   - Click "Create bucket"

### 2. Configurar Políticas RLS

1. Ir a: https://app.supabase.com/project/YOUR_PROJECT/storage/policies
2. Para cada bucket, ejecutar las políticas SQL correspondientes
3. Verificar que las políticas estén activas

### 3. Configurar CORS (si es necesario)

Si la app está en un dominio diferente:

```sql
-- Configurar CORS para Storage
ALTER TABLE storage.buckets 
SET (cors_allowed_origins = '["https://tu-dominio.com", "http://localhost:3000"]');
```

---

## 📝 Uso en la Aplicación

### Ejemplo: Upload de Avatar

```javascript
import { supabaseStorageService } from '../services';

async function uploadAvatar(file, userId) {
  try {
    // Upload imagen
    const { path, url } = await supabaseStorageService.uploadImage(
      file,
      'avatars',
      userId
    );

    // Actualizar perfil con nueva URL
    await supabaseAuthService.updateProfile(userId, {
      avatar: url
    });

    return url;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}
```

### Ejemplo: Upload de Imágenes de Post

```javascript
async function createPostWithImages(content, imageFiles, userId, neighborhoodId) {
  try {
    // Upload imágenes
    const uploadPromises = imageFiles.map(file =>
      supabaseStorageService.uploadImage(file, 'posts', `${userId}/${Date.now()}`)
    );
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map(r => r.url);

    // Crear post con URLs
    const post = await supabasePostsService.createPost({
      content,
      authorId: userId,
      neighborhoodId,
      images: imageUrls
    });

    return post;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}
```

---

## 🔧 Optimizaciones

### 1. Compresión de Imágenes

Antes de subir, comprimir imágenes en el cliente:

```javascript
import imageCompression from 'browser-image-compression';

async function compressAndUpload(file, bucket, folder) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return await supabaseStorageService.uploadImage(
      compressedFile,
      bucket,
      folder
    );
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}
```

### 2. Thumbnails

Generar thumbnails para optimizar carga:

```javascript
async function uploadWithThumbnail(file, bucket, folder) {
  // Upload original
  const original = await supabaseStorageService.uploadImage(file, bucket, folder);

  // Generar thumbnail
  const thumbnail = await generateThumbnail(file, 300, 300);
  const thumbResult = await supabaseStorageService.uploadImage(
    thumbnail,
    bucket,
    `${folder}/thumb`
  );

  return {
    original: original.url,
    thumbnail: thumbResult.url
  };
}
```

### 3. Lazy Loading

Usar lazy loading para imágenes:

```javascript
<img 
  src={thumbnailUrl} 
  data-src={fullImageUrl}
  loading="lazy"
  alt="Description"
/>
```

---

## ✅ Checklist de Configuración

- [ ] Crear bucket `avatars`
- [ ] Crear bucket `posts`
- [ ] Crear bucket `events`
- [ ] Crear bucket `businesses`
- [ ] Crear bucket `projects`
- [ ] Crear bucket `resources`
- [ ] Crear bucket `albums`
- [ ] Configurar políticas RLS para cada bucket
- [ ] Verificar permisos de lectura pública
- [ ] Verificar permisos de escritura autenticada
- [ ] Configurar CORS (si necesario)
- [ ] Probar upload de imágenes
- [ ] Probar eliminación de imágenes
- [ ] Implementar compresión de imágenes
- [ ] Implementar lazy loading

---

## 🧪 Testing

### Test Manual

1. **Upload de Avatar:**
   - Login como usuario
   - Subir foto de perfil
   - Verificar que se muestra correctamente
   - Verificar URL pública

2. **Upload de Post:**
   - Crear post con imágenes
   - Verificar que se suben correctamente
   - Verificar que se muestran en el feed

3. **Permisos:**
   - Intentar eliminar imagen de otro usuario (debe fallar)
   - Intentar subir sin autenticación (debe fallar)
   - Verificar que solo el dueño puede eliminar

### Test Automatizado

```javascript
describe('Storage Service', () => {
  it('should upload avatar', async () => {
    const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });
    const result = await supabaseStorageService.uploadImage(file, 'avatars', 'user123');
    expect(result.url).toBeDefined();
  });

  it('should delete image', async () => {
    const path = 'user123/avatar.jpg';
    await supabaseStorageService.deleteImage(path, 'avatars');
    // Verificar que no existe
  });
});
```

---

## 📊 Monitoreo

### Métricas a Monitorear

1. **Storage Usage:**
   - Total de archivos
   - Tamaño total usado
   - Crecimiento diario

2. **Performance:**
   - Tiempo de upload
   - Tiempo de carga de imágenes
   - Tasa de errores

3. **Costos:**
   - Storage usado vs límite
   - Bandwidth usado
   - Requests por día

### Dashboard de Supabase

Revisar regularmente:
- Storage > Usage
- Storage > Logs
- Storage > Policies

---

## 🚨 Troubleshooting

### Error: "Policy violation"
**Solución:** Verificar que las políticas RLS estén configuradas correctamente

### Error: "File too large"
**Solución:** Implementar compresión antes de upload

### Error: "CORS error"
**Solución:** Configurar CORS en el bucket

### Imágenes no cargan
**Solución:** Verificar que el bucket sea público

---

**Siguiente:** Paso 6.2 - Implementación de Real-time Subscriptions
