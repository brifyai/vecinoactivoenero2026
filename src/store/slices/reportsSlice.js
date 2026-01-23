import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadReports = createAsyncThunk('reports/load', async () => {
  return JSON.parse(localStorage.getItem('reports') || '[]');
});

export const createReport = createAsyncThunk('reports/create', async ({ reportData, user }, { getState }) => {
  const { reports } = getState().reports;
  const newReport = { ...reportData, id: Date.now(), reporterId: user.id, createdAt: new Date().toISOString(), status: 'pending' };
  const updated = [...reports, newReport];
  localStorage.setItem('reports', JSON.stringify(updated));
  return newReport;
});

const reportsSlice = createSlice({
  name: 'reports',
  initialState: { reports: [], blockedUsers: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadReports.fulfilled, (state, action) => { state.reports = action.payload; state.loading = false; })
      .addCase(createReport.fulfilled, (state, action) => { state.reports.push(action.payload); });
  }
});

export default reportsSlice.reducer;
