import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loadConnections = createAsyncThunk('connections/load', async () => {
  return JSON.parse(localStorage.getItem('connections') || '[]');
});

export const sendConnectionRequest = createAsyncThunk('connections/sendRequest', async ({ fromUserId, toUserId }, { getState }) => {
  const { connections } = getState().connections;
  const newConnection = { id: Date.now(), fromUserId, toUserId, status: 'pending', createdAt: new Date().toISOString() };
  const updated = [...connections, newConnection];
  localStorage.setItem('connections', JSON.stringify(updated));
  return newConnection;
});

const connectionsSlice = createSlice({
  name: 'connections',
  initialState: { connections: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadConnections.fulfilled, (state, action) => { state.connections = action.payload; state.loading = false; })
      .addCase(sendConnectionRequest.fulfilled, (state, action) => { state.connections.push(action.payload); });
  }
});

export default connectionsSlice.reducer;
