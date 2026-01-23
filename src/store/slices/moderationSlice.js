import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadModerationData = createAsyncThunk('moderation/load', async () => {
  const reports = JSON.parse(localStorage.getItem('moderationReports') || '[]');
  const moderators = JSON.parse(localStorage.getItem('moderators') || '[]');
  return { reports, moderators };
});

const moderationSlice = createSlice({
  name: 'moderation',
  initialState: { reports: [], moderators: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadModerationData.fulfilled, (state, action) => {
      state.reports = action.payload.reports;
      state.moderators = action.payload.moderators;
      state.loading = false;
    });
  }
});

export default moderationSlice.reducer;
