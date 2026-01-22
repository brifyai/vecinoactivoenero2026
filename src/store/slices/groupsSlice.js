import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async Thunks
export const loadGroups = createAsyncThunk(
  'groups/loadGroups',
  async (userId, { rejectWithValue }) => {
    try {
      const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
      const userGroups = allGroups.filter(group =>
        (group.members || []).includes(userId)
      );
      return { allGroups, userGroups };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async ({ groupData, userId }, { rejectWithValue }) => {
    try {
      const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
      
      // Generar slug único
      const baseSlug = groupData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      let slug = baseSlug;
      let counter = 1;
      while (allGroups.some(g => g.slug === slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      const newGroup = {
        id: Date.now(),
        name: groupData.name,
        slug: slug,
        description: groupData.description,
        image: groupData.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=200&fit=crop',
        createdBy: userId,
        members: [userId],
        admins: [userId],
        posts: [],
        privacy: groupData.privacy || 'public',
        createdAt: new Date().toISOString()
      };

      allGroups.push(newGroup);
      localStorage.setItem('friendbook_groups', JSON.stringify(allGroups));
      
      return newGroup;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinGroup = createAsyncThunk(
  'groups/joinGroup',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
      const groupIndex = allGroups.findIndex(g => g.id === groupId);

      if (groupIndex === -1) {
        throw new Error('Grupo no encontrado');
      }

      if (!allGroups[groupIndex].members?.includes(userId)) {
        allGroups[groupIndex].members = [...(allGroups[groupIndex].members || []), userId];
        localStorage.setItem('friendbook_groups', JSON.stringify(allGroups));
        return allGroups[groupIndex];
      }
      
      throw new Error('Ya eres miembro de este grupo');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const leaveGroup = createAsyncThunk(
  'groups/leaveGroup',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
      const groupIndex = allGroups.findIndex(g => g.id === groupId);

      if (groupIndex === -1) {
        throw new Error('Grupo no encontrado');
      }

      allGroups[groupIndex].members = (allGroups[groupIndex].members || []).filter(
        id => id !== userId
      );
      
      localStorage.setItem('friendbook_groups', JSON.stringify(allGroups));
      return { groupId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ groupId, updates, userId }, { rejectWithValue }) => {
    try {
      const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
      const groupIndex = allGroups.findIndex(g => g.id === groupId);

      if (groupIndex === -1) {
        throw new Error('Grupo no encontrado');
      }

      // Verificar que el usuario es admin
      if (!allGroups[groupIndex].admins?.includes(userId)) {
        throw new Error('No tienes permisos para editar este grupo');
      }

      allGroups[groupIndex] = {
        ...allGroups[groupIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('friendbook_groups', JSON.stringify(allGroups));
      return allGroups[groupIndex];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteGroup = createAsyncThunk(
  'groups/deleteGroup',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
      const group = allGroups.find(g => g.id === groupId);

      if (!group) {
        throw new Error('Grupo no encontrado');
      }

      if (group.createdBy !== userId) {
        throw new Error('Solo el creador puede eliminar el grupo');
      }

      const filtered = allGroups.filter(g => g.id !== groupId);
      localStorage.setItem('friendbook_groups', JSON.stringify(filtered));
      
      return { groupId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const postToGroup = createAsyncThunk(
  'groups/postToGroup',
  async ({ groupId, postData, userId }, { rejectWithValue }) => {
    try {
      const allGroups = JSON.parse(localStorage.getItem('friendbook_groups') || '[]');
      const groupIndex = allGroups.findIndex(g => g.id === groupId);

      if (groupIndex === -1) {
        throw new Error('Grupo no encontrado');
      }

      // Verificar que el usuario es miembro
      if (!allGroups[groupIndex].members?.includes(userId)) {
        throw new Error('Debes ser miembro del grupo para publicar');
      }

      const newPost = {
        id: Date.now(),
        userId: userId,
        groupId,
        content: postData.content,
        image: postData.image || null,
        reactions: [],
        comments: [],
        createdAt: new Date().toISOString()
      };

      allGroups[groupIndex].posts.unshift(newPost);
      localStorage.setItem('friendbook_groups', JSON.stringify(allGroups));
      
      return { groupId, post: newPost };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const groupsSlice = createSlice({
  name: 'groups',
  initialState: {
    allGroups: [],
    myGroups: [],
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
      // Load Groups
      .addCase(loadGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.allGroups = action.payload.allGroups;
        state.myGroups = action.payload.userGroups;
      })
      .addCase(loadGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Group
      .addCase(createGroup.fulfilled, (state, action) => {
        state.allGroups.push(action.payload);
        state.myGroups.push(action.payload);
      })
      // Join Group
      .addCase(joinGroup.fulfilled, (state, action) => {
        const groupIndex = state.allGroups.findIndex(g => g.id === action.payload.id);
        if (groupIndex !== -1) {
          state.allGroups[groupIndex] = action.payload;
        }
        state.myGroups.push(action.payload);
      })
      // Leave Group
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.myGroups = state.myGroups.filter(g => g.id !== action.payload.groupId);
        const groupIndex = state.allGroups.findIndex(g => g.id === action.payload.groupId);
        if (groupIndex !== -1) {
          const group = state.allGroups[groupIndex];
          state.allGroups[groupIndex] = {
            ...group,
            members: group.members.filter(id => id !== action.meta.arg.userId)
          };
        }
      })
      // Update Group
      .addCase(updateGroup.fulfilled, (state, action) => {
        const allGroupIndex = state.allGroups.findIndex(g => g.id === action.payload.id);
        if (allGroupIndex !== -1) {
          state.allGroups[allGroupIndex] = action.payload;
        }
        const myGroupIndex = state.myGroups.findIndex(g => g.id === action.payload.id);
        if (myGroupIndex !== -1) {
          state.myGroups[myGroupIndex] = action.payload;
        }
      })
      // Delete Group
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.allGroups = state.allGroups.filter(g => g.id !== action.payload.groupId);
        state.myGroups = state.myGroups.filter(g => g.id !== action.payload.groupId);
      })
      // Post to Group
      .addCase(postToGroup.fulfilled, (state, action) => {
        const groupIndex = state.allGroups.findIndex(g => g.id === action.payload.groupId);
        if (groupIndex !== -1) {
          state.allGroups[groupIndex].posts.unshift(action.payload.post);
        }
        const myGroupIndex = state.myGroups.findIndex(g => g.id === action.payload.groupId);
        if (myGroupIndex !== -1) {
          state.myGroups[myGroupIndex].posts.unshift(action.payload.post);
        }
      });
  }
});

export const { clearError } = groupsSlice.actions;
export default groupsSlice.reducer;
