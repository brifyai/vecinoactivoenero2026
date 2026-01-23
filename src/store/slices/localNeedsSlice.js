import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadLocalNeeds = createAsyncThunk('localNeeds/load', async () => {
  return JSON.parse(localStorage.getItem('localNeeds') || '[]');
});

export const createLocalNeed = createAsyncThunk('localNeeds/create', async ({ needData, user }, { getState }) => {
  const { needs } = getState().localNeeds;
  const newNeed = { ...needData, id: Date.now(), creatorId: user.id, createdAt: new Date().toISOString() };
  const updated = [...needs, newNeed];
  localStorage.setItem('localNeeds', JSON.stringify(updated));
  return newNeed;
});

const localNeedsSlice = createSlice({
  name: 'localNeeds',
  initialState: { needs: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadLocalNeeds.fulfilled, (state, action) => { state.needs = action.payload; state.loading = false; })
      .addCase(createLocalNeed.fulfilled, (state, action) => { state.needs.push(action.payload); });
  }
});

export default localNeedsSlice.reducer;
