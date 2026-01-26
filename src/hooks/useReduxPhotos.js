import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast } from '../utils/sweetalert';

export const useReduxPhotos = () => {
  const user = useSelector(selectUser);

  // Funciones simuladas para compatibilidad (usando localStorage directamente)
  const loadUserPhotos = () => {
    // Función vacía para compatibilidad
  };

  const createNewAlbum = async (albumData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const albums = JSON.parse(localStorage.getItem(`albums_${user.id}`) || '[]');
      const newAlbum = {
        id: Date.now(),
        ...albumData,
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      albums.push(newAlbum);
      localStorage.setItem(`albums_${user.id}`, JSON.stringify(albums));
      showSuccessToast('Álbum creado exitosamente');
      return { success: true, album: newAlbum };
    } catch (error) {
      return { success: false, error };
    }
  };

  const removeAlbum = async (albumId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const albums = JSON.parse(localStorage.getItem(`albums_${user.id}`) || '[]');
      const updatedAlbums = albums.filter(album => album.id !== albumId);
      localStorage.setItem(`albums_${user.id}`, JSON.stringify(updatedAlbums));
      showSuccessToast('Álbum eliminado exitosamente');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const editAlbum = async (albumId, updates) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const albums = JSON.parse(localStorage.getItem(`albums_${user.id}`) || '[]');
      const updatedAlbums = albums.map(album => 
        album.id === albumId ? { ...album, ...updates } : album
      );
      localStorage.setItem(`albums_${user.id}`, JSON.stringify(updatedAlbums));
      showSuccessToast('Álbum actualizado exitosamente');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const uploadPhoto = async (photoData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const photos = JSON.parse(localStorage.getItem(`photos_${user.id}`) || '[]');
      const newPhoto = {
        id: Date.now(),
        ...photoData,
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      photos.push(newPhoto);
      localStorage.setItem(`photos_${user.id}`, JSON.stringify(photos));
      showSuccessToast('Foto agregada exitosamente');
      return { success: true, photo: newPhoto };
    } catch (error) {
      return { success: false, error };
    }
  };

  const removePhoto = async (photoId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const photos = JSON.parse(localStorage.getItem(`photos_${user.id}`) || '[]');
      const updatedPhotos = photos.filter(photo => photo.id !== photoId);
      localStorage.setItem(`photos_${user.id}`, JSON.stringify(updatedPhotos));
      showSuccessToast('Foto eliminada exitosamente');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const editPhoto = async (photoId, updates) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const photos = JSON.parse(localStorage.getItem(`photos_${user.id}`) || '[]');
      const updatedPhotos = photos.map(photo => 
        photo.id === photoId ? { ...photo, ...updates } : photo
      );
      localStorage.setItem(`photos_${user.id}`, JSON.stringify(updatedPhotos));
      showSuccessToast('Foto actualizada exitosamente');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const toggleLikePhoto = async (photoId, isLiked) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const photos = JSON.parse(localStorage.getItem(`photos_${user.id}`) || '[]');
      const updatedPhotos = photos.map(photo => {
        if (photo.id === photoId) {
          const likes = photo.likes || 0;
          return { ...photo, likes: isLiked ? likes - 1 : likes + 1 };
        }
        return photo;
      });
      localStorage.setItem(`photos_${user.id}`, JSON.stringify(updatedPhotos));
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Helper functions - usando useMemo para optimización
  const getAlbumPhotos = useMemo(() => {
    return (albumId) => {
      if (!user) return [];
      const photos = JSON.parse(localStorage.getItem(`photos_${user.id}`) || '[]');
      return photos.filter(photo => photo.albumId === albumId);
    };
  }, [user]);

  const getAllPhotos = useMemo(() => {
    return () => {
      if (!user) return [];
      return JSON.parse(localStorage.getItem(`photos_${user.id}`) || '[]');
    };
  }, [user]);

  const getUserAlbums = useMemo(() => {
    return (userId) => {
      return JSON.parse(localStorage.getItem(`albums_${userId}`) || '[]');
    };
  }, []);

  return {
    photos: user ? JSON.parse(localStorage.getItem(`photos_${user.id}`) || '[]') : [],
    albums: user ? JSON.parse(localStorage.getItem(`albums_${user.id}`) || '[]') : [],
    loading: false,
    error: null,
    photosCount: user ? JSON.parse(localStorage.getItem(`photos_${user.id}`) || '[]').length : 0,
    albumsCount: user ? JSON.parse(localStorage.getItem(`albums_${user.id}`) || '[]').length : 0,
    loadPhotos: loadUserPhotos,
    createAlbum: createNewAlbum,
    deleteAlbum: removeAlbum,
    updateAlbum: editAlbum,
    addPhoto: uploadPhoto,
    deletePhoto: removePhoto,
    updatePhoto: editPhoto,
    likePhoto: toggleLikePhoto,
    // Helper functions
    getAlbumPhotos,
    getAllPhotos,
    getUserAlbums
  };
};