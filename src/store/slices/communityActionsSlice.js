import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadCommunityActions = createAsyncThunk('communityActions/load', async () => {
  return JSON.parse(localStorage.getItem('communityActions') || '[]');
});

export const createCommunityAction = createAsyncThunk('communityActions/create', async ({ actionData, user }, { getState }) => {
  const { actions } = getState().communityActions;
  const newAction = { ...actionData, id: Date.now(), creatorId: user.id, createdAt: new Date().toISOString() };
  const updated = [...actions, newAction];
  localStorage.setItem('communityActions', JSON.stringify(updated));
  return newAction;
});

const communityActionsSlice = createSlice({
  name: 'communityActions',
  initialState: { actions: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCommunityActions.fulfilled, (state, action) => { state.actions = action.payload; state.loading = false; })
      .addCase(createCommunityAction.fulfilled, (state, action) => { state.actions.push(action.payload); });
  }
});

export default communityActionsSlice.reducer;
