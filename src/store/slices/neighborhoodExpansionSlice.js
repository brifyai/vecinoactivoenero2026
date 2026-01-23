import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadExpansionData = createAsyncThunk('neighborhoodExpansion/load', async () => {
  const neighborhoods = JSON.parse(localStorage.getItem('neighborhoods') || '[]');
  const stats = JSON.parse(localStorage.getItem('neighborhoodStats') || '{}');
  return { neighborhoods, stats };
});

const neighborhoodExpansionSlice = createSlice({
  name: 'neighborhoodExpansion',
  initialState: { neighborhoods: [], stats: {}, recommendations: {}, loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadExpansionData.fulfilled, (state, action) => {
      state.neighborhoods = action.payload.neighborhoods;
      state.stats = action.payload.stats;
      state.loading = false;
    });
  }
});

export default neighborhoodExpansionSlice.reducer;
