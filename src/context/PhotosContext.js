import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PhotosContext = createContext();

export const usePhotos = () => {
  const context = useContext(PhotosContext);
  if (!context) {
    throw new Error('usePhotos debe usarse dentro de PhotosProvider');
  }
  return context;
};

export const PhotosProvider = ({ children }) => {
  const { user } = useAuth();
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);

  // Cargar álbumes y fotos del usuario desde localStorage
  useEffect(() => {
    if (user) {
      const savedAlbums = localStorage.getItem(`albums_${user.id}`);
      const savedPhotos = localStorage.getItem(`photos_${user.id}`);
      
      if (savedAlbums) {
        setAlbums(JSON.parse(savedAlbums));
      } else {
        // Álbumes por defecto
        const defaultAlbums = [
          { id: 1, title: 'Fotos de Portada', count: 0, image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=300&fit=crop', userId: user.id },
          { id: 2, title: 'Fotos de Perfil', count: 0, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop', userId: user.id },
        ];
        setAlbums(defaultAlbums);
        localStorage.setItem(`albums_${user.id}`, JSON.stringify(defaultAlbums));
      }

      if (savedPhotos) {
        setPhotos(JSON.parse(savedPhotos));
      }
    }
  }, [user]);

  // Guardar álbumes cuando cambien
  useEffect(() => {
    if (user && albums.length > 0) {
      localStorage.setItem(`albums_${user.id}`, JSON.stringify(albums));
    }
  }, [albums, user]);

  // Guardar fotos cuando cambien
  useEffect(() => {
    if (user && photos.length > 0) {
      localStorage.setItem(`photos_${user.id}`, JSON.stringify(photos));
    }
  }, [photos, user]);

  // Crear álbum
  const createAlbum = (albumData) => {
    const newAlbum = {
      id: Date.now(),
      title: albumData.title,
      description: albumData.description || '',
      count: 0,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    setAlbums([...albums, newAlbum]);
    return newAlbum;
  };

  // Eliminar álbum
  const deleteAlbum = (albumId) => {
    setAlbums(albums.filter(album => album.id !== albumId));
    // También eliminar fotos del álbum
    setPhotos(photos.filter(photo => photo.albumId !== albumId));
  };

  // Actualizar álbum
  const updateAlbum = (albumId, updates) => {
    setAlbums(albums.map(album => 
      album.id === albumId ? { ...album, ...updates } : album
    ));
  };

  // Agregar foto
  const addPhoto = (photoData) => {
    const newPhoto = {
      id: Date.now(),
      title: photoData.title || 'Sin título',
      description: photoData.description || '',
      image: photoData.image,
      albumId: photoData.albumId,
      userId: user.id,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };
    
    setPhotos([...photos, newPhoto]);
    
    // Actualizar contador del álbum
    if (photoData.albumId) {
      setAlbums(albums.map(album => 
        album.id === photoData.albumId 
          ? { ...album, count: album.count + 1, image: newPhoto.image }
          : album
      ));
    }
    
    return newPhoto;
  };

  // Eliminar foto
  const deletePhoto = (photoId) => {
    const photo = photos.find(p => p.id === photoId);
    setPhotos(photos.filter(p => p.id !== photoId));
    
    // Actualizar contador del álbum
    if (photo && photo.albumId) {
      setAlbums(albums.map(album => 
        album.id === photo.albumId 
          ? { ...album, count: Math.max(0, album.count - 1) }
          : album
      ));
    }
  };

  // Actualizar foto
  const updatePhoto = (photoId, updates) => {
    setPhotos(photos.map(photo => 
      photo.id === photoId ? { ...photo, ...updates } : photo
    ));
  };

  // Obtener fotos de un álbum
  const getAlbumPhotos = (albumId) => {
    return photos.filter(photo => photo.albumId === albumId);
  };

  // Obtener todas las fotos del usuario
  const getAllPhotos = () => {
    return photos;
  };

  // Like a foto
  const likePhoto = (photoId) => {
    setPhotos(photos.map(photo => 
      photo.id === photoId 
        ? { ...photo, likes: photo.likes + 1 }
        : photo
    ));
  };

  // Unlike foto
  const unlikePhoto = (photoId) => {
    setPhotos(photos.map(photo => 
      photo.id === photoId 
        ? { ...photo, likes: Math.max(0, photo.likes - 1) }
        : photo
    ));
  };

  const value = {
    albums,
    photos,
    createAlbum,
    deleteAlbum,
    updateAlbum,
    addPhoto,
    deletePhoto,
    updatePhoto,
    getAlbumPhotos,
    getAllPhotos,
    likePhoto,
    unlikePhoto
  };

  return (
    <PhotosContext.Provider value={value}>
      {children}
    </PhotosContext.Provider>
  );
};
