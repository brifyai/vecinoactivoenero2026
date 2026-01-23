import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadSecurityReports = createAsyncThunk('security/loadReports', async () => {
  return JSON.parse(localStorage.getItem('securityReports') || '[]');
});

export const createSecurityReport = createAsyncThunk('security/createReport', async ({ reportData, user }, { getState }) => {
  const { reports } = getState().security;
  const newReport = { ...reportData, id: Date.now(), reporterId: user.id, createdAt: new Date().toISOString() };
  const updated = [...reports, newReport];
  localStorage.setItem('securityReports', JSON.stringify(updated));
  return newReport;
});

const securitySlice = createSlice({
  name: 'security',
  initialState: { reports: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadSecurityReports.fulfilled, (state, action) => { state.reports = action.payload; state.loading = false; })
      .addCase(createSecurityReport.fulfilled, (state, action) => { state.reports.push(action.payload); });
  }
});

export default securitySlice.reducer;
