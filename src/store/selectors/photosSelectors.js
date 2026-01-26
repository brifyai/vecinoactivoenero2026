import { createSelector } from '@reduxjs/toolkit';

const selectPhotosState = (state) => state.photos;

export const selectAllPhotos = createSelector(
  [selectPhotosState],
  (photos) => photos.photos
);

export const selectAllAlbums = createSelector(
  [selectPhotosState],
  (photos) => photos.albums
);

export const selectPhotosLoading = createSelector(
  [selectPhotosState],
  (photos) => photos.loading
);

export const selectPhotosError = createSelector(
  [selectPhotosState],
  (photos) => photos.error
);

export const selectPhotosCount = createSelector(
  [selectAllPhotos],
  (photos) => photos.length
);

export const selectAlbumsCount = createSelector(
  [selectAllAlbums],
  (albums) => albums.length
);

export const selectPhotoById = createSelector(
  [selectAllPhotos, (state, photoId) => photoId],
  (photos, photoId) => photos.find(photo => photo.id === photoId)
);

export const selectAlbumById = createSelector(
  [selectAllAlbums, (state, albumId) => albumId],
  (albums, albumId) => albums.find(album => album.id === albumId)
);

export const selectPhotosByAlbum = createSelector(
  [selectAllPhotos, (state, albumId) => albumId],
  (photos, albumId) => photos.filter(photo => photo.albumId === albumId)
);

export const selectUserPhotos = createSelector(
  [selectAllPhotos, (state, userId) => userId],
  (photos, userId) => photos.filter(photo => photo.userId === userId)
);

export const selectUserAlbums = createSelector(
  [selectAllAlbums, (state, userId) => userId],
  (albums, userId) => albums.filter(album => album.userId === userId)
);

export const selectRecentPhotos = createSelector(
  [selectAllPhotos],
  (photos) => {
    return [...photos]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
  }
);

export const selectPopularPhotos = createSelector(
  [selectAllPhotos],
  (photos) => {
    return [...photos]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 20);
  }
);