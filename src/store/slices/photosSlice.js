import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { showSuccessToast } from '../../utils/sweetalert';

export const loadPhotos = createAsyncThunk('photos/load', async (userId) => {
  const albums = JSON.parse(localStorage.getItem(`albums_${userId}`) || '[]');
  const photos = JSON.parse(localStorage.getItem(`photos_${userId}`) || '[]');
  return { albums, photos };
});

export const uploadPhoto = createAsyncThunk('photos/upload', async ({ userId, photoData }, { getState }) => {
  const { photos } = getState().photos;
  const newPhoto = { ...photoData, id: Date.now(), uploadedAt: new Date().toISOString() };
  const updated = [...photos, newPhoto];
  localStorage.setItem(`photos_${userId}`, JSON.stringify(updated));
  showSuccessToast('Foto subida exitosamente');
  return newPhoto;
});

const photosSlice = createSlice({
  name: 'photos',
  initialState: { albums: [], photos: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPhotos.fulfilled, (state, action) => {
        state.albums = action.payload.albums;
        state.photos = action.payload.photos;
        state.loading = false;
      })
      .addCase(uploadPhoto.fulfilled, (state, action) => { state.photos.push(action.payload); });
  }
});

export default photosSlice.reducer;
