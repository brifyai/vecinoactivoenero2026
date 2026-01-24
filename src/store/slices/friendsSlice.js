import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseFriendsService from '../../services/supabaseFriendsService';

// Async Thunks
export const loadFriends = createAsyncThunk(
  'friends/loadFriends',
  async (userId, { rejectWithValue }) => {
    try {
      const friends = await supabaseFriendsService.getFriends(userId);
      return friends;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadFriendRequests = createAsyncThunk(
  'friends/loadRequests',
  async (userId, { rejectWithValue }) => {
    try {
      const requests = await supabaseFriendsService.getFriendRequests(userId);
      return requests;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  'friends/sendRequest',
  async ({ fromUserId, toUserId }, { rejectWithValue }) => {
    try {
      const request = await supabaseFriendsService.sendFriendRequest(fromUserId, toUserId);
      return request;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptFriendRequest = createAsyncThunk(
  'friends/acceptRequest',
  async ({ requestId, userId }, { rejectWithValue }) => {
    try {
      await supabaseFriendsService.acceptFriendRequest(requestId, userId);
      return requestId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectFriendRequest = createAsyncThunk(
  'friends/rejectRequest',
  async ({ requestId, userId }, { rejectWithValue }) => {
    try {
      await supabaseFriendsService.rejectFriendRequest(requestId, userId);
      return requestId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFriend = createAsyncThunk(
  'friends/removeFriend',
  async ({ userId, friendId }, { rejectWithValue }) => {
    try {
      await supabaseFriendsService.removeFriend(userId, friendId);
      return friendId;
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
    requests: [],
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
      // Load Requests
      .addCase(loadFriendRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      // Send Request
      .addCase(sendFriendRequest.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.loading = false;
        // Request sent successfully
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Accept Request
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(r => r.id !== action.payload);
      })
      // Reject Request
      .addCase(rejectFriendRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(r => r.id !== action.payload);
      })
      // Remove Friend
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.friends = state.friends.filter(f => f.id !== action.payload);
      });
  }
});

export const { clearError } = friendsSlice.actions;
export default friendsSlice.reducer;
