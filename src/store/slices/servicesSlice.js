import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadServices = createAsyncThunk('services/load', async () => {
  return JSON.parse(localStorage.getItem('services') || '[]');
});

const servicesSlice = createSlice({
  name: 'services',
  initialState: { services: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadServices.fulfilled, (state, action) => { state.services = action.payload; state.loading = false; });
  }
});

export default servicesSlice.reducer;
