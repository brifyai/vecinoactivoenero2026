import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast, showErrorToast } from '../utils/sweetalert';
import supabasePhotosService from '../services/supabasePhotosService';
import imageService from '../services/imageService';
import {
  setPhotos,
  setAlbums,
  addPhoto,
  addAlbum,
  updatePhoto as updatePhotoAction,
  updateAlbum as updateAlbumAction,
  removePhoto,
  removeAlbum,
  setLoading,
  setError
} from '../store/slices/photosSlice';

export const useReduxPhotos = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { photos, albums, loading, error } = useSelector(state => state.photos);

  // Cargar fotos del usuario
  const loadUserPhotos = useCallback(async () => {
    if (!user) return;
    
    dispatch(setLoading(true));
    try {
      const [photosData, albumsData] = await Promise.all([
        supabasePhotosService.getPhotos(null, user.id),
        supabasePhotosService.getAlbums(user.id)
      ]);
      
      dispatch(setPhotos(photosData || []));
      dispatch(setAlbums(albumsData || []));
    } catch (err) {
      console.error('Error loading photos:', err);
      dispatch(setError(err.message));
      showErrorToast('Error al cargar las fotos');
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch]);

  // Crear álbum
  const createAlbum = useCallback(async (albumData) => {
    if (!user) {
      showErrorToast('Debes iniciar sesión');
      return { success: false };
    }

    dispatch(setLoading(true));
    try {
      const newAlbum = await supabasePhotosService.createAlbum({
        ...albumData,
        userId: user.id
      });
      
      dispatch(addAlbum(newAlbum));
      showSuccessToast('Álbum creado exitosamente');
      return { success: true, album: newAlbum };
    } catch (err) {
      console.error('Error creating album:', err);
      dispatch(setError(err.message));
      showErrorToast('Error al crear el álbum');
      return { success: false, error: err.message };
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch]);

  // Actualizar álbum
  const updateAlbum = useCallback(async (albumId, updates) => {
    if (!user) {
      showErrorToast('Debes iniciar sesión');
      return { success: false };
    }

    dispatch(setLoading(true));
    try {
      const updatedAlbum = await supabasePhotosService.updateAlbum(albumId, updates, user.id);
      dispatch(updateAlbumAction({ id: albumId, changes: updatedAlbum }));
      showSuccessToast('Álbum actualizado');
      return { success: true };
    } catch (err) {
      console.error('Error updating album:', err);
      showErrorToast('Error al actualizar el álbum');
      return { success: false, error: err.message };
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch]);

  // Eliminar álbum
  const deleteAlbum = useCallback(async (albumId) => {
    if (!user) {
      showErrorToast('Debes iniciar sesión');
      return { success: false };
    }

    dispatch(setLoading(true));
    try {
      await supabasePhotosService.deleteAlbum(albumId, user.id);
      dispatch(removeAlbum(albumId));
      showSuccessToast('Álbum eliminado');
      return { success: true };
    } catch (err) {
      console.error('Error deleting album:', err);
      showErrorToast('Error al eliminar el álbum');
      return { success: false, error: err.message };
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch]);

  // Subir foto
  const uploadPhoto = useCallback(async (file, photoData = {}) => {
    if (!user) {
      showErrorToast('Debes iniciar sesión');
      return { success: false };
    }

    dispatch(setLoading(true));
    try {
      // Comprimir imagen antes de subir
      const compressedFile = await imageService.compressImage(file, {
        maxSizeMB: 2,
        targetSizeKB: 800,
        maxWidthOrHeight: 1920
      });

      // Subir archivo a Supabase Storage
      const url = await supabasePhotosService.uploadFile(compressedFile, user.id);

      // Crear registro en la base de datos
      const newPhoto = await supabasePhotosService.uploadPhoto({
        url,
        userId: user.id,
        caption: photoData.caption || null,
        albumId: photoData.albumId || null,
        tags: photoData.tags || []
      });

      dispatch(addPhoto(newPhoto));
      showSuccessToast('Foto subida exitosamente');
      return { success: true, photo: newPhoto };
    } catch (err) {
      console.error('Error uploading photo:', err);
      dispatch(setError(err.message));
      showErrorToast('Error al subir la foto');
      return { success: false, error: err.message };
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch]);

  // Actualizar foto
  const updatePhoto = useCallback(async (photoId, updates) => {
    if (!user) {
      showErrorToast('Debes iniciar sesión');
      return { success: false };
    }

    dispatch(setLoading(true));
    try {
      const updatedPhoto = await supabasePhotosService.updatePhoto(photoId, updates, user.id);
      dispatch(updatePhotoAction({ id: photoId, changes: updatedPhoto }));
      showSuccessToast('Foto actualizada');
      return { success: true };
    } catch (err) {
      console.error('Error updating photo:', err);
      showErrorToast('Error al actualizar la foto');
      return { success: false, error: err.message };
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch]);

  // Eliminar foto
  const deletePhoto = useCallback(async (photoId) => {
    if (!user) {
      showErrorToast('Debes iniciar sesión');
      return { success: false };
    }

    dispatch(setLoading(true));
    try {
      await supabasePhotosService.deletePhoto(photoId, user.id);
      dispatch(removePhoto(photoId));
      showSuccessToast('Foto eliminada');
      return { success: true };
    } catch (err) {
      console.error('Error deleting photo:', err);
      showErrorToast('Error al eliminar la foto');
      return { success: false, error: err.message };
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch]);

  // Cargar fotos al montar
  useEffect(() => {
    if (user) {
      loadUserPhotos();
    }
  }, [user, loadUserPhotos]);

  // Helper functions
  const getAlbumPhotos = useCallback((albumId) => {
    return photos.filter(photo => photo.album_id === albumId);
  }, [photos]);

  const getAllPhotos = useCallback(() => {
    return photos;
  }, [photos]);

  const getUserAlbums = useCallback(() => {
    return albums;
  }, [albums]);

  return {
    photos,
    albums,
    loading,
    error,
    photosCount: photos.length,
    albumsCount: albums.length,
    loadPhotos: loadUserPhotos,
    createAlbum,
    deleteAlbum,
    updateAlbum,
    uploadPhoto,
    deletePhoto,
    updatePhoto,
    // Helper functions
    getAlbumPhotos,
    getAllPhotos,
    getUserAlbums
  };
};