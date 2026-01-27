# 📸 Límites de Tamaño de Imágenes en Vecino Activo

## 📊 Resumen Ejecutivo

**SÍ, la app tiene límites de peso para las imágenes** que los usuarios suben.

---

## 🎯 Límites por Tipo de Contenido

### 1. Imágenes Generales (Posts, Perfil, Portada)
- **Límite**: 5 MB
- **Ubicación**: `src/services/imageService.js`
- **Constante**: `MAX_IMAGE_SIZE = 5 * 1024 * 1024`
- **Mensaje de error**: "La imagen es demasiado grande. Máximo 5MB."

### 2. Imágenes de Verificación
- **Límite**: 5 MB
- **Ubicación**: `src/components/VerificationModal/VerificationModal.js`
- **Validación**: `file.size > 5 * 1024 * 1024`
- **Mensaje de error**: "La imagen no debe superar 5MB"

### 3. Emergencias (Fotos/Videos)
- **Límite**: 10 MB
- **Ubicación**: `src/components/EmergencyButton/MediaCapture.js`
- **Validación**: `file.size <= 10 * 1024 * 1024`
- **Nota**: Límite más alto por la naturaleza crítica del contenido

### 4. Storage por Bucket (Supabase)

Según `src/components/StorageTest/StorageTest.js`:

| Bucket | Uso | Límite |
|--------|-----|--------|
| **avatars** | Fotos de perfil | 2 MB |
| **posts** | Imágenes de publicaciones | 5 MB |
| **events** | Imágenes de eventos | 5 MB |
| **businesses** | Imágenes de negocios | 3 MB |
| **projects** | Imágenes de proyectos | 5 MB |
| **resources** | Recursos compartidos | 3 MB |
| **albums** | Álbumes de fotos | 10 MB |

---

## 🔧 Procesamiento de Imágenes

### Compresión Automática

Todas las imágenes pasan por un proceso de optimización:

```javascript
// src/services/imageService.js
compressImage: (base64String, maxWidth = 800) => {
  // Redimensiona a máximo 800px de ancho
  // Comprime con calidad 0.8 (80%)
  // Convierte a JPEG
}
```

**Beneficios**:
- ✅ Reduce el tamaño del archivo
- ✅ Mantiene calidad visual aceptable
- ✅ Mejora velocidad de carga
- ✅ Ahorra espacio de almacenamiento

### Tipos de Archivo Permitidos

```javascript
const validTypes = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];
```

**Nota**: Videos solo permitidos en emergencias y álbumes de fotos.

---

## 📱 Experiencia del Usuario

### Validaciones Implementadas

1. **Validación de Tipo**
   ```javascript
   if (!imageService.validateImageType(file)) {
     showErrorToast('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP).');
   }
   ```

2. **Validación de Tamaño**
   ```javascript
   if (file.size > MAX_IMAGE_SIZE) {
     reject(new Error('La imagen es demasiado grande. Máximo 5MB.'));
   }
   ```

3. **Validación de Espacio de Almacenamiento**
   ```javascript
   const storage = imageService.checkStorageSpace();
   if (storage.percentage > 90) {
     showErrorToast(`Espacio de almacenamiento casi lleno (${storage.percentage}%). Elimina algunas imágenes.`);
   }
   ```

### Mensajes de Error

Los usuarios reciben mensajes claros cuando:
- ❌ El archivo es muy grande
- ❌ El tipo de archivo no es válido
- ❌ El almacenamiento está casi lleno
- ❌ Hay un error al procesar la imagen

---

## 💾 Almacenamiento

### LocalStorage (Desarrollo/Demo)

- **Límite aproximado**: 10 MB
- **Monitoreo**: La app verifica el espacio usado
- **Alerta**: Cuando se usa más del 90%

```javascript
getStorageSize: () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return (total / 1024 / 1024).toFixed(2); // MB
}
```

### Supabase Storage (Producción)

- **Límites**: Definidos por bucket (ver tabla arriba)
- **Escalable**: Se puede aumentar según plan
- **Seguro**: Validación en cliente y servidor

---

## 🎨 Componentes que Suben Imágenes

### 1. ImageUploader (Componente Reutilizable)
- **Ubicación**: `src/components/ImageUploader/ImageUploader.js`
- **Características**:
  - ✅ Drag & drop
  - ✅ Vista previa
  - ✅ Validación automática
  - ✅ Compresión automática
  - ✅ Indicador de progreso

### 2. CreatePostModal
- **Ubicación**: `src/components/CreatePostModal/CreatePostModal.js`
- **Usa**: ImageUploader
- **Límite**: 5 MB

### 3. ProfileHeader
- **Ubicación**: `src/components/ProfileHeader/ProfileHeader.js`
- **Para**: Foto de portada
- **Límite**: 5 MB

### 4. VerificationModal
- **Ubicación**: `src/components/VerificationModal/VerificationModal.js`
- **Para**: Documentos de verificación
- **Límite**: 5 MB

### 5. EmergencyButton
- **Ubicación**: `src/components/EmergencyButton/MediaCapture.js`
- **Para**: Fotos/videos de emergencia
- **Límite**: 10 MB

### 6. Photos Page
- **Ubicación**: `src/pages/Photos.js`
- **Para**: Álbumes de fotos
- **Límite**: Según bucket (10 MB para albums)
- **Múltiples**: Sí, permite subir varias a la vez

---

## 🔒 Seguridad

### Validaciones en Cliente

```javascript
// 1. Tipo de archivo
validateImageType(file)

// 2. Tamaño de archivo
file.size > MAX_IMAGE_SIZE

// 3. Espacio disponible
checkStorageSpace()
```

### Validaciones en Servidor (Supabase)

- ✅ Límites por bucket configurados
- ✅ Políticas RLS (Row Level Security)
- ✅ Validación de tipos MIME
- ✅ Escaneo de malware (según plan)

---

## 📈 Recomendaciones

### Para Usuarios

1. **Optimiza tus fotos antes de subirlas**
   - Usa herramientas como TinyPNG
   - Reduce resolución si es muy alta
   - Convierte a JPEG para menor tamaño

2. **Límites recomendados**
   - Fotos de perfil: < 500 KB
   - Fotos de posts: < 2 MB
   - Fotos de eventos: < 3 MB

### Para Administradores

1. **Monitorear uso de storage**
   ```javascript
   // Ver estadísticas en StorageTest component
   ```

2. **Ajustar límites si es necesario**
   ```javascript
   // Editar en src/services/imageService.js
   const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // Cambiar aquí
   ```

3. **Configurar límites en Supabase**
   - Dashboard > Storage > Bucket Settings
   - Ajustar según plan y necesidades

---

## 🚀 Mejoras Futuras Sugeridas

### 1. Compresión Más Agresiva
```javascript
// Opción de calidad ajustable
canvas.toDataURL('image/jpeg', 0.6); // 60% calidad
```

### 2. Formatos Modernos
```javascript
// Soporte para WebP y AVIF
canvas.toDataURL('image/webp', 0.8);
```

### 3. Redimensionamiento Inteligente
```javascript
// Diferentes tamaños según uso
- Thumbnail: 150x150
- Medium: 800x800
- Large: 1920x1920
```

### 4. Carga Progresiva
```javascript
// Mostrar versión baja calidad primero
// Cargar alta calidad en background
```

### 5. CDN para Imágenes
- Usar Cloudflare Images o similar
- Optimización automática
- Entrega más rápida

---

## 🧪 Testing

### Probar Límites

```javascript
// 1. Crear archivo de prueba grande
const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg');

// 2. Intentar subir
imageService.processImage(largeFile)
  .catch(error => {
    console.log(error.message); // "La imagen es demasiado grande. Máximo 5MB."
  });
```

### Verificar Compresión

```javascript
// Antes
console.log('Original:', file.size / 1024, 'KB');

// Después
const compressed = await imageService.processImage(file);
console.log('Comprimido:', compressed.length / 1024, 'KB');
```

---

## 📞 Soporte

Si un usuario reporta problemas con imágenes:

1. **Verificar tamaño del archivo**
   - ¿Es mayor a 5 MB?
   - ¿Es mayor al límite del bucket?

2. **Verificar tipo de archivo**
   - ¿Es JPG, PNG, GIF o WebP?
   - ¿No es un archivo corrupto?

3. **Verificar espacio de almacenamiento**
   - ¿El usuario tiene espacio disponible?
   - ¿El bucket está lleno?

4. **Revisar consola del navegador**
   - F12 > Console
   - Buscar errores relacionados con imágenes

---

## 📝 Código de Referencia

### Validación Completa

```javascript
// src/services/imageService.js
processImage: async (file) => {
  // 1. Validar tipo
  if (!imageService.validateImageType(file)) {
    throw new Error('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP).');
  }

  // 2. Validar tamaño
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('La imagen es demasiado grande. Máximo 5MB.');
  }

  // 3. Convertir a base64
  const base64 = await imageService.fileToBase64(file);
  
  // 4. Comprimir
  const compressed = await imageService.compressImage(base64);
  
  return compressed;
}
```

---

## ✅ Checklist de Implementación

- [x] Límites de tamaño configurados
- [x] Validación de tipo de archivo
- [x] Compresión automática
- [x] Mensajes de error claros
- [x] Monitoreo de espacio
- [x] Drag & drop funcional
- [x] Vista previa de imágenes
- [x] Indicadores de progreso
- [ ] Compresión WebP/AVIF (futuro)
- [ ] CDN para imágenes (futuro)
- [ ] Múltiples tamaños (futuro)

---

**Última actualización**: 27 de enero de 2026  
**Versión**: 1.0  
**Mantenedor**: Equipo Vecino Activo
