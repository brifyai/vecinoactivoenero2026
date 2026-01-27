import { createSlice } from '@reduxjs/toolkit';

const photosSlice = createSlice({
  name: 'photos',
  initialState: {
    photos: [],
    albums: [],
    loading: false,
    error: null
  },
  reducers: {
    setPhotos: (state, action) => {
      state.photos = action.payload;
    },
    setAlbums: (state, action) => {
      state.albums = action.payload;
    },
    addPhoto: (state, action) => {
      state.photos.unshift(action.payload);
    },
    addAlbum: (state, action) => {
      state.albums.unshift(action.payload);
    },
    updatePhoto: (state, action) => {
      const { id, changes } = action.payload;
      const index = state.photos.findIndex(p => p.id === id);
      if (index !== -1) {
        state.photos[index] = { ...state.photos[index], ...changes };
      }
    },
    updateAlbum: (state, action) => {
      const { id, changes } = action.payload;
      const index = state.albums.findIndex(a => a.id === id);
      if (index !== -1) {
        state.albums[index] = { ...state.albums[index], ...changes };
      }
    },
    removePhoto: (state, action) => {
      state.photos = state.photos.filter(p => p.id !== action.payload);
    },
    removeAlbum: (state, action) => {
      state.albums = state.albums.filter(a => a.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setPhotos,
  setAlbums,
  addPhoto,
  addAlbum,
  updatePhoto,
  updateAlbum,
  removePhoto,
  removeAlbum,
  setLoading,
  setError,
  clearError
} = photosSlice.actions;

export default photosSlice.reducer;
