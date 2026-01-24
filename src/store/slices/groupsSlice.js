import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseGroupsService from '../../services/supabaseGroupsService';

// Async Thunks
export const loadGroups = createAsyncThunk(
  'groups/loadGroups',
  async (neighborhoodId, { rejectWithValue }) => {
    try {
      const groups = await supabaseGroupsService.getGroups(neighborhoodId);
      return groups;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, { rejectWithValue }) => {
    try {
      const newGroup = await supabaseGroupsService.createGroup(groupData);
      return newGroup;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ groupId, updates, userId }, { rejectWithValue }) => {
    try {
      const updatedGroup = await supabaseGroupsService.updateGroup(groupId, updates, userId);
      return updatedGroup;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinGroup = createAsyncThunk(
  'groups/joinGroup',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      await supabaseGroupsService.joinGroup(groupId, userId);
      return { groupId, userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const leaveGroup = createAsyncThunk(
  'groups/leaveGroup',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      await supabaseGroupsService.leaveGroup(groupId, userId);
      return { groupId, userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getGroupMembers = createAsyncThunk(
  'groups/getMembers',
  async (groupId, { rejectWithValue }) => {
    try {
      const members = await supabaseGroupsService.getGroupMembers(groupId);
      return { groupId, members };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const groupsSlice = createSlice({
  name: 'groups',
  initialState: {
    groups: [],
    myGroups: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setMyGroups: (state, action) => {
      state.myGroups = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load Groups
      .addCase(loadGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(loadGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Group
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.push(action.payload);
        state.myGroups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Group
      .addCase(updateGroup.fulfilled, (state, action) => {
        const groupIndex = state.groups.findIndex(g => g.id === action.payload.id);
        if (groupIndex !== -1) {
          state.groups[groupIndex] = action.payload;
        }
        const myGroupIndex = state.myGroups.findIndex(g => g.id === action.payload.id);
        if (myGroupIndex !== -1) {
          state.myGroups[myGroupIndex] = action.payload;
        }
      })
      // Join Group
      .addCase(joinGroup.fulfilled, (state, action) => {
        const { groupId } = action.payload;
        const group = state.groups.find(g => g.id === groupId);
        if (group) {
          group.member_count = (group.member_count || 0) + 1;
          if (!state.myGroups.find(g => g.id === groupId)) {
            state.myGroups.push(group);
          }
        }
      })
      // Leave Group
      .addCase(leaveGroup.fulfilled, (state, action) => {
        const { groupId } = action.payload;
        const group = state.groups.find(g => g.id === groupId);
        if (group) {
          group.member_count = Math.max(0, (group.member_count || 0) - 1);
        }
        state.myGroups = state.myGroups.filter(g => g.id !== groupId);
      })
      // Get Members
      .addCase(getGroupMembers.fulfilled, (state, action) => {
        const { groupId, members } = action.payload;
        const group = state.groups.find(g => g.id === groupId);
        if (group) {
          group.members = members;
        }
      });
  }
});

export const { clearError, setMyGroups } = groupsSlice.actions;
export default groupsSlice.reducer;
