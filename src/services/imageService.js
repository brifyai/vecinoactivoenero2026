// Servicio para manejo de imágenes con Base64
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB máximo (antes de comprimir)

// Configuración de compresión por tipo de imagen
const COMPRESSION_SETTINGS = {
  avatar: { maxWidth: 400, maxHeight: 400, quality: 0.85 },
  cover: { maxWidth: 1200, maxHeight: 600, quality: 0.85 },
  post: { maxWidth: 1200, maxHeight: 1200, quality: 0.80 },
  event: { maxWidth: 1200, maxHeight: 800, quality: 0.80 },
  business: { maxWidth: 800, maxHeight: 800, quality: 0.85 },
  resource: { maxWidth: 800, maxHeight: 800, quality: 0.85 },
  album: { maxWidth: 1920, maxHeight: 1920, quality: 0.85 },
  emergency: { maxWidth: 1920, maxHeight: 1920, quality: 0.90 }, // Mayor calidad para evidencia
  default: { maxWidth: 1200, maxHeight: 1200, quality: 0.80 }
};

const imageService = {
  // Convertir archivo a Base64
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_IMAGE_SIZE) {
        reject(new Error('La imagen es demasiado grande. Máximo 10MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Comprimir imagen con configuración adaptativa
  compressImage: (base64String, type = 'default', targetSizeKB = null) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const settings = COMPRESSION_SETTINGS[type] || COMPRESSION_SETTINGS.default;
        const canvas = document.createElement('canvas');
        
        let width = img.width;
        let height = img.height;

        // Calcular dimensiones manteniendo aspect ratio
        if (width > settings.maxWidth || height > settings.maxHeight) {
          const widthRatio = settings.maxWidth / width;
          const heightRatio = settings.maxHeight / height;
          const ratio = Math.min(widthRatio, heightRatio);
          
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        
        // Mejorar calidad de renderizado
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.drawImage(img, 0, 0, width, height);

        // Si se especifica un tamaño objetivo, comprimir iterativamente
        if (targetSizeKB) {
          imageService.compressToTargetSize(canvas, targetSizeKB).then(resolve);
        } else {
          resolve(canvas.toDataURL('image/jpeg', settings.quality));
        }
      };
      img.src = base64String;
    });
  },

  // Comprimir hasta alcanzar un tamaño objetivo
  compressToTargetSize: (canvas, targetSizeKB, minQuality = 0.5) => {
    return new Promise((resolve) => {
      let quality = 0.9;
      let result = canvas.toDataURL('image/jpeg', quality);
      let currentSizeKB = (result.length * 0.75) / 1024; // Aproximación del tamaño

      // Reducir calidad iterativamente hasta alcanzar el tamaño objetivo
      while (currentSizeKB > targetSizeKB && quality > minQuality) {
        quality -= 0.05;
        result = canvas.toDataURL('image/jpeg', quality);
        currentSizeKB = (result.length * 0.75) / 1024;
      }

      resolve(result);
    });
  },

  // Comprimir imagen agresivamente (para imágenes muy grandes)
  compressImageAggressive: (base64String, maxWidth = 800) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Reducir dimensiones más agresivamente
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Calidad más baja para mayor compresión
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = base64String;
    });
  },


  // Validar tipo de archivo
  validateImageType: (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  },

  // Obtener información de la imagen
  getImageInfo: (base64String) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: (img.width / img.height).toFixed(2),
          sizeKB: ((base64String.length * 0.75) / 1024).toFixed(2)
        });
      };
      img.src = base64String;
    });
  },

  // Procesar imagen completa (validar, comprimir, convertir)
  processImage: async (file, type = 'default', options = {}) => {
    if (!imageService.validateImageType(file)) {
      throw new Error('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP).');
    }

    const base64 = await imageService.fileToBase64(file);
    
    // Obtener info de la imagen original
    const originalInfo = await imageService.getImageInfo(base64);
    const originalSizeKB = parseFloat(originalInfo.sizeKB);

    // Determinar si necesita compresión agresiva
    const needsAggressiveCompression = originalSizeKB > 2000; // > 2MB

    let compressed;
    if (needsAggressiveCompression && !options.preserveQuality) {
      // Compresión agresiva para imágenes grandes
      compressed = await imageService.compressImageAggressive(base64, 1200);
    } else if (options.targetSizeKB) {
      // Comprimir a tamaño específico
      const img = new Image();
      await new Promise(resolve => {
        img.onload = resolve;
        img.src = base64;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      compressed = await imageService.compressToTargetSize(canvas, options.targetSizeKB);
    } else {
      // Compresión normal según tipo
      compressed = await imageService.compressImage(base64, type);
    }

    // Obtener info de la imagen comprimida
    const compressedInfo = await imageService.getImageInfo(compressed);
    
    // Log de compresión (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('📸 Compresión de imagen:', {
        original: `${originalInfo.width}x${originalInfo.height} (${originalInfo.sizeKB} KB)`,
        compressed: `${compressedInfo.width}x${compressedInfo.height} (${compressedInfo.sizeKB} KB)`,
        reduction: `${((1 - parseFloat(compressedInfo.sizeKB) / originalSizeKB) * 100).toFixed(1)}%`
      });
    }

    return compressed;
  },


  // Guardar imagen de perfil
  saveProfileImage: async (userId, file) => {
    try {
      const processedImage = await imageService.processImage(file, 'avatar', { targetSizeKB: 200 });
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].avatar = processedImage;
        localStorage.setItem('users', JSON.stringify(users));
        return processedImage;
      }
      throw new Error('Usuario no encontrado');
    } catch (error) {
      throw error;
    }
  },

  // Guardar imagen de portada
  saveCoverImage: async (userId, file) => {
    try {
      const processedImage = await imageService.processImage(file, 'cover', { targetSizeKB: 500 });
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].coverPhoto = processedImage;
        localStorage.setItem('users', JSON.stringify(users));
        return processedImage;
      }
      throw new Error('Usuario no encontrado');
    } catch (error) {
      throw error;
    }
  },

  // Guardar foto de portada (versión simplificada que acepta base64 directamente)
  saveCoverPhoto: (userId, base64Image) => {
    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].coverPhoto = base64Image;
        localStorage.setItem('users', JSON.stringify(users));
        return base64Image;
      }
      throw new Error('Usuario no encontrado');
    } catch (error) {
      throw error;
    }
  },

  // Guardar imagen de publicación
  savePostImage: async (file) => {
    try {
      const processedImage = await imageService.processImage(file, 'post', { targetSizeKB: 800 });
      return processedImage;
    } catch (error) {
      throw error;
    }
  },

  // Obtener tamaño de almacenamiento usado
  getStorageSize: () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024 / 1024).toFixed(2); // MB
  },

  // Verificar espacio disponible
  checkStorageSpace: () => {
    const used = imageService.getStorageSize();
    const limit = 10; // 10MB límite aproximado de localStorage
    return {
      used: parseFloat(used),
      limit,
      available: limit - parseFloat(used),
      percentage: (parseFloat(used) / limit * 100).toFixed(2)
    };
  }
};

export default imageService;
