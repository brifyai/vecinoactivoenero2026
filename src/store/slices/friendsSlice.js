import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../../services/storageService';

// Async Thunks
export const loadFriends = createAsyncThunk(
  'friends/loadFriends',
  async (userId, { rejectWithValue }) => {
    try {
      const friendIds = storageService.getFriends(userId);
      const allUsers = storageService.getUsers();
      const friendsList = friendIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean);
      return friendsList;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadFriendRequests = createAsyncThunk(
  'friends/loadFriendRequests',
  async (userId, { rejectWithValue }) => {
    try {
      const requests = storageService.getFriendRequests(userId);
      return requests;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  'friends/sendFriendRequest',
  async ({ fromUserId, toUserId }, { rejectWithValue }) => {
    try {
      storageService.sendFriendRequest(fromUserId, toUserId);
      return { fromUserId, toUserId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  'friends/acceptFriendRequest',
  async ({ userId, fromUserId }, { rejectWithValue }) => {
    try {
      const success = storageService.acceptFriendRequest(userId, fromUserId);
      if (success) {
        // Recargar amigos y solicitudes
        const friendIds = storageService.getFriends(userId);
        const allUsers = storageService.getUsers();
        const friendsList = friendIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean);
        const requests = storageService.getFriendRequests(userId);
        return { friends: friendsList, requests };
      }
      throw new Error('Error al aceptar solicitud');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectFriendRequest = createAsyncThunk(
  'friends/rejectFriendRequest',
  async ({ userId, fromUserId }, { rejectWithValue }) => {
    try {
      storageService.rejectFriendRequest(userId, fromUserId);
      const requests = storageService.getFriendRequests(userId);
      return requests;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFriend = createAsyncThunk(
  'friends/removeFriend',
  async ({ userId, friendId }, { rejectWithValue }) => {
    try {
      storageService.removeFriend(userId, friendId);
      const friendIds = storageService.getFriends(userId);
      const allUsers = storageService.getUsers();
      const friendsList = friendIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean);
      return friendsList;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const friendsSlice = createSlice({
  name: 'friends',
  initialState: {
    friends: [],
    friendRequests: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load Friends
      .addCase(loadFriends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload;
      })
      .addCase(loadFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Load Friend Requests
      .addCase(loadFriendRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadFriendRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.friendRequests = action.payload;
      })
      .addCase(loadFriendRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Friend Request
      .addCase(sendFriendRequest.fulfilled, (state) => {
        // No need to update state, just success
      })
      // Accept Friend Request
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.friends = action.payload.friends;
        state.friendRequests = action.payload.requests;
      })
      // Reject Friend Request
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.friendRequests = action.payload;
      })
      // Remove Friend
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.friends = action.payload;
      });
  }
});

export const { clearError } = friendsSlice.actions;
export default friendsSlice.reducer;
