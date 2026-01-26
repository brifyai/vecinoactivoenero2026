import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectPhotosState = (state) => state.photos;

// Basic selectors
export const selectAllPhotos = createSelector(
  [selectPhotosState],
  (photos) => photos.photos
);

export const selectPhotosLoading = createSelector(
  [selectPhotosState],
  (photos) => photos.loading
);

export const selectPhotosError = createSelector(
  [selectPhotosState],
  (photos) => photos.error
);

export const selectCurrentPhoto = createSelector(
  [selectPhotosState],
  (photos) => photos.currentPhoto
);

export const selectPhotoAlbums = createSelector(
  [selectPhotosState],
  (photos) => photos.albums
);

export const selectUploadProgress = createSelector(
  [selectPhotosState],
  (photos) => photos.uploadProgress
);

// Computed selectors
export const selectPhotoById = createSelector(
  [selectAllPhotos, (state, id) => id],
  (photos, id) => photos.find(photo => photo.id === id)
);

export const selectPhotosByAlbum = createSelector(
  [selectAllPhotos, (state, albumId) => albumId],
  (photos, albumId) => photos.filter(photo => photo.albumId === albumId)
);

export const selectRecentPhotos = createSelector(
  [selectAllPhotos],
  (photos) => photos
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20)
);

export const selectPhotosCount = createSelector(
  [selectAllPhotos],
  (photos) => photos.length
);

export const selectFavoritePhotos = createSelector(
  [selectAllPhotos],
  (photos) => photos.filter(photo => photo.isFavorite)
);