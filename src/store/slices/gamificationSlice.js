import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadGamificationData = createAsyncThunk('gamification/load', async (userId) => {
  const userStats = JSON.parse(localStorage.getItem(`gamification_${userId}`) || 'null');
  const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  return { userStats, leaderboard };
});

export const awardPoints = createAsyncThunk('gamification/awardPoints', async ({ userId, points, reason }, { getState }) => {
  const { userStats } = getState().gamification;
  const updated = { ...userStats, points: (userStats?.points || 0) + points };
  localStorage.setItem(`gamification_${userId}`, JSON.stringify(updated));
  return updated;
});

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState: { userStats: null, leaderboard: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadGamificationData.fulfilled, (state, action) => {
        state.userStats = action.payload.userStats;
        state.leaderboard = action.payload.leaderboard;
        state.loading = false;
      })
      .addCase(awardPoints.fulfilled, (state, action) => { state.userStats = action.payload; });
  }
});

export default gamificationSlice.reducer;
