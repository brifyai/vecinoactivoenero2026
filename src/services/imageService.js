// Servicio para manejo de imágenes con Base64
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB máximo

const imageService = {
  // Convertir archivo a Base64
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_IMAGE_SIZE) {
        reject(new Error('La imagen es demasiado grande. Máximo 5MB.'));
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

  // Comprimir imagen antes de guardar
  compressImage: (base64String, maxWidth = 800) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = base64String;
    });
  },

  // Validar tipo de archivo
  validateImageType: (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  },

  // Procesar imagen completa (validar, comprimir, convertir)
  processImage: async (file) => {
    if (!imageService.validateImageType(file)) {
      throw new Error('Tipo de archivo no válido. Solo se permiten imágenes (JPG, PNG, GIF, WEBP).');
    }

    const base64 = await imageService.fileToBase64(file);
    const compressed = await imageService.compressImage(base64);
    return compressed;
  },

  // Guardar imagen de perfil
  saveProfileImage: async (userId, file) => {
    try {
      const processedImage = await imageService.processImage(file);
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
      const processedImage = await imageService.processImage(file);
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
      const processedImage = await imageService.processImage(file);
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
