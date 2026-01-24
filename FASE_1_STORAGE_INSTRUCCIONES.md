# 📦 Fase 1: Configuración de Storage - Instrucciones Paso a Paso

## ✅ Checklist de Implementación

- [ ] Paso 1: Ejecutar script SQL en Supabase
- [ ] Paso 2: Verificar buckets creados
- [ ] Paso 3: Verificar políticas RLS
- [ ] Paso 4: Probar upload con componente de prueba
- [ ] Paso 5: Verificar que las imágenes son públicas
- [ ] Paso 6: Probar eliminación de imágenes

---

## 📝 Paso 1: Ejecutar Script SQL

### 1.1 Acceder a Supabase Dashboard

1. Ir a: https://app.supabase.com
2. Seleccionar tu proyecto
3. En el menú lateral, ir a **SQL Editor**

### 1.2 Ejecutar el Script

1. Click en **New Query**
2. Copiar todo el contenido del archivo `storage_setup.sql`
3. Pegar en el editor
4. Click en **Run** (o presionar Ctrl/Cmd + Enter)

### 1.3 Verificar Ejecución

Deberías ver:
```
Success. No rows returned
```

Y al final, dos tablas de verificación:
- Lista de 7 buckets creados
- Lista de políticas RLS creadas

---

## 🔍 Paso 2: Verificar Buckets Creados

### 2.1 Ir a Storage

1. En el menú lateral de Supabase, ir a **Storage**
2. Deberías ver 7 buckets:
   - ✅ avatars
   - ✅ posts
   - ✅ events
   - ✅ businesses
   - ✅ projects
   - ✅ resources
   - ✅ albums

### 2.2 Verificar Configuración de Cada Bucket

Para cada bucket, verificar:
- **Public**: ✅ Debe estar marcado
- **File size limit**: Según especificación
- **Allowed MIME types**: image/jpeg, image/png, image/webp

---

## 🔒 Paso 3: Verificar Políticas RLS

### 3.1 Ir a Políticas

1. En Storage, click en cualquier bucket
2. Click en **Policies** (pestaña superior)
3. Deberías ver 4 políticas para cada bucket:
   - 📖 SELECT: "...are viewable by everyone"
   - ➕ INSERT: "...can upload..."
   - ✏️ UPDATE: "...can update their own..."
   - 🗑️ DELETE: "...can delete their own..."

### 3.2 Verificar Estado

Todas las políticas deben estar:
- ✅ Enabled (habilitadas)
- ✅ Con el icono de candado verde

---

## 🧪 Paso 4: Probar Upload con Componente de Prueba

### 4.1 Agregar Ruta de Prueba

Editar `src/App.js` y agregar una ruta temporal:

```javascript
import StorageTest from './components/StorageTest/StorageTest';

// Dentro de <Routes>
<Route path="/storage-test" element={<StorageTest />} />
```

### 4.2 Iniciar la Aplicación

```bash
npm start
```

### 4.3 Acceder al Test

1. Ir a: http://localhost:3000/storage-test
2. Asegúrate de estar **autenticado** (login primero si es necesario)

### 4.4 Probar Upload

1. Seleccionar un bucket (ej: avatars)
2. Click en "Seleccionar Imagen"
3. Elegir una imagen de tu computadora
4. Click en "📤 Subir Imagen"
5. Esperar a que aparezca "✅ Upload Exitoso!"

### 4.5 Verificar Resultado

Deberías ver:
- ✅ La imagen subida
- ✅ La URL pública de la imagen
- ✅ Botón para copiar URL
- ✅ Botón para eliminar imagen

---

## 🌐 Paso 5: Verificar que las Imágenes son Públicas

### 5.1 Copiar URL

1. En el componente de prueba, click en "📋 Copiar URL"
2. Abrir una nueva pestaña en modo incógnito
3. Pegar la URL
4. La imagen debe cargarse sin problemas

### 5.2 Verificar en Supabase Dashboard

1. Ir a Storage > [bucket usado]
2. Navegar a la carpeta donde se subió
3. Click en la imagen
4. Verificar que tiene URL pública

---

## 🗑️ Paso 6: Probar Eliminación

### 6.1 Eliminar desde el Componente

1. En el componente de prueba, click en "🗑️ Eliminar Imagen"
2. Confirmar que aparece "Imagen eliminada correctamente"
3. La URL copiada anteriormente ya no debe funcionar

### 6.2 Verificar en Dashboard

1. Ir a Storage > [bucket usado]
2. Verificar que el archivo ya no existe

---

## ✅ Verificación Final

### Checklist de Funcionalidad

- [ ] ✅ 7 buckets creados
- [ ] ✅ Todos los buckets son públicos
- [ ] ✅ Políticas RLS configuradas (4 por bucket = 28 total)
- [ ] ✅ Upload funciona correctamente
- [ ] ✅ Imágenes son accesibles públicamente
- [ ] ✅ Solo el dueño puede eliminar sus imágenes
- [ ] ✅ Límites de tamaño funcionan
- [ ] ✅ Tipos MIME son validados

---

## 🧪 Tests Adicionales

### Test 1: Upload en Diferentes Buckets

Probar upload en cada bucket:
- [ ] avatars (2MB max)
- [ ] posts (5MB max)
- [ ] events (5MB max)
- [ ] businesses (3MB max)
- [ ] projects (5MB max)
- [ ] resources (3MB max)
- [ ] albums (10MB max)

### Test 2: Validación de Tamaño

1. Intentar subir una imagen > límite del bucket
2. Debe mostrar error: "El archivo es muy grande"

### Test 3: Validación de Tipo

1. Intentar subir un archivo no-imagen (PDF, TXT, etc.)
2. Debe mostrar error: "Por favor selecciona una imagen"

### Test 4: Permisos

1. Subir imagen como Usuario A
2. Intentar eliminar como Usuario B
3. Debe fallar (solo el dueño puede eliminar)

---

## 🚨 Troubleshooting

### Error: "Policy violation"

**Causa:** Las políticas RLS no están configuradas correctamente

**Solución:**
1. Ir a Storage > [bucket] > Policies
2. Verificar que las 4 políticas estén habilitadas
3. Re-ejecutar el script SQL si es necesario

### Error: "File too large"

**Causa:** El archivo excede el límite del bucket

**Solución:**
1. Verificar límites en `storage.buckets`
2. Comprimir la imagen antes de subir
3. O aumentar el límite:
```sql
UPDATE storage.buckets 
SET file_size_limit = 10485760 
WHERE id = 'bucket_name';
```

### Error: "Invalid MIME type"

**Causa:** El tipo de archivo no está permitido

**Solución:**
1. Verificar `allowed_mime_types` en el bucket
2. Agregar tipo si es necesario:
```sql
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'bucket_name';
```

### Imágenes no cargan

**Causa:** El bucket no es público

**Solución:**
```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'bucket_name';
```

### Error: "User not authenticated"

**Causa:** No hay sesión activa

**Solución:**
1. Hacer login en la aplicación
2. Verificar que `auth.user` existe en Redux
3. Verificar token en localStorage

---

## 📊 Monitoreo

### Verificar Uso de Storage

1. Ir a Settings > Usage
2. Revisar:
   - Total storage used
   - Number of files
   - Bandwidth used

### Logs

1. Ir a Storage > Logs
2. Revisar operaciones recientes:
   - Uploads exitosos
   - Errores
   - Deletes

---

## 🎯 Próximos Pasos

Una vez completada la Fase 1:

1. ✅ Storage configurado y funcionando
2. ➡️ **Fase 2:** Implementar Real-time (2-3 días)
3. ➡️ **Fase 3:** Testing (3-5 días)
4. ➡️ **Fase 4:** Despliegue (1-2 días)

---

## 📝 Notas Importantes

### Estructura de Carpetas

Usar esta estructura para organizar archivos:

```
avatars/
  {user_id}/
    avatar.jpg

posts/
  {user_id}/
    {post_id}/
      image1.jpg
      image2.jpg

events/
  {event_id}/
    cover.jpg
    photo1.jpg

businesses/
  {business_id}/
    logo/
      logo.png
    gallery/
      photo1.jpg
      photo2.jpg
    offers/
      promo.jpg

projects/
  {project_id}/
    image1.jpg
    update1.jpg

resources/
  {resource_id}/
    photo1.jpg
    photo2.jpg

albums/
  {album_id}/
    photo1.jpg
    photo2.jpg
```

### Optimizaciones Recomendadas

1. **Compresión:** Comprimir imágenes antes de subir
2. **Thumbnails:** Generar versiones pequeñas para previews
3. **Lazy Loading:** Cargar imágenes bajo demanda
4. **CDN:** Supabase ya incluye CDN global
5. **Cache:** Configurar headers de cache apropiados

### Límites de Supabase (Plan Free)

- Storage: 1GB
- Bandwidth: 2GB/mes
- Requests: 50,000/mes

Si necesitas más, considera upgrade a plan Pro.

---

## ✅ Completado

Una vez que todos los tests pasen:

- [x] Storage configurado
- [x] Buckets creados
- [x] Políticas RLS funcionando
- [x] Upload probado
- [x] Eliminación probada
- [x] URLs públicas verificadas

**¡Fase 1 completada! 🎉**

Puedes proceder a la Fase 2: Implementación de Real-time.

---

**Tiempo estimado:** 1-2 horas  
**Dificultad:** Baja  
**Prerequisitos:** Proyecto de Supabase creado, variables de entorno configuradas
