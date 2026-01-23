import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadNeighborhoodsList = createAsyncThunk('neighborhoods/loadList', async () => {
  const saved = localStorage.getItem('neighborhoods');
  return saved ? JSON.parse(saved) : [];
});

export const addNeighborhood = createAsyncThunk('neighborhoods/add', async (neighborhood, { getState }) => {
  const { neighborhoods } = getState().neighborhoods;
  const updated = [...neighborhoods, { ...neighborhood, id: Date.now(), createdAt: new Date().toISOString() }];
  localStorage.setItem('neighborhoods', JSON.stringify(updated));
  return updated;
});

const neighborhoodsSlice = createSlice({
  name: 'neighborhoods',
  initialState: { neighborhoods: [], loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(loadNeighborhoodsList.fulfilled, (state, action) => { state.neighborhoods = action.payload; state.loading = false; })
      .addCase(addNeighborhood.fulfilled, (state, action) => { state.neighborhoods = action.payload; });
  }
});

export const { clearError } = neighborhoodsSlice.actions;
export default neighborhoodsSlice.reducer;
