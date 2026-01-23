import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadVerificationRequests = createAsyncThunk('verification/load', async () => {
  return JSON.parse(localStorage.getItem('verificationRequests') || '[]');
});

export const submitVerificationRequest = createAsyncThunk('verification/submit', async ({ requestData, user }, { getState }) => {
  const { requests } = getState().verification;
  const newRequest = { ...requestData, id: Date.now(), userId: user.id, status: 'pending', createdAt: new Date().toISOString() };
  const updated = [...requests, newRequest];
  localStorage.setItem('verificationRequests', JSON.stringify(updated));
  return newRequest;
});

const verificationSlice = createSlice({
  name: 'verification',
  initialState: { requests: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadVerificationRequests.fulfilled, (state, action) => { state.requests = action.payload; state.loading = false; })
      .addCase(submitVerificationRequest.fulfilled, (state, action) => { state.requests.push(action.payload); });
  }
});

export default verificationSlice.reducer;
