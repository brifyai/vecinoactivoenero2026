import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabasePostsService from '../../services/supabasePostsService';

// Thunks asíncronos
export const loadPosts = createAsyncThunk(
  'posts/load',
  async ({ neighborhoodId, limit = 50, offset = 0 }, { rejectWithValue }) => {
    try {
      const posts = await supabasePostsService.getPosts(neighborhoodId, limit, offset);
      return posts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (postData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const user = auth.user;
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }
      
      const newPost = await supabasePostsService.createPost({
        content: postData.content,
        authorId: user.id,
        neighborhoodId: user.neighborhoodId,
        images: postData.images || [],
        feeling: postData.feeling || null,
        location: postData.location || null,
        privacy: postData.privacy || 'public',
        category: postData.category || 'general',
        hashtags: postData.hashtags || []
      });
      
      return newPost;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/update',
  async ({ postId, updates }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const updatedPost = await supabasePostsService.updatePost(postId, updates, auth.user.id);
      return updatedPost;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (postId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await supabasePostsService.deletePost(postId, auth.user.id);
      return postId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addReaction = createAsyncThunk(
  'posts/addReaction',
  async ({ postId, emoji }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const result = await supabasePostsService.likePost(postId, auth.user.id);
      return { postId, ...result };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const user = auth.user;
      
      if (!user) throw new Error('Usuario no autenticado');
      
      const comment = await supabasePostsService.addComment(postId, {
        content,
        authorId: user.id
      });
      
      return { postId, comment };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sharePost = createAsyncThunk(
  'posts/share',
  async (postId, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      await supabasePostsService.sharePost(postId, auth.user.id);
      return postId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    loading: false,
    error: null,
    hasMore: true,
    subscription: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addPost: (state, action) => {
      // Para real-time: agregar nuevo post
      const exists = state.items.find(p => p.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
      }
    },
    addNewPost: (state, action) => {
      // Para real-time updates
      state.items.unshift(action.payload);
    },
    updatePostAction: (state, action) => {
      // Para real-time: actualizar post existente
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    removePost: (state, action) => {
      // Para real-time: eliminar post
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    setSubscription: (state, action) => {
      state.subscription = action.payload;
    },
    // Acciones específicas para real-time polling
    addPostFromRealtime: (state, action) => {
      const exists = state.items.find(p => p.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
      }
    },
    updatePostFromRealtime: (state, action) => {
      const index = state.items.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    removePostFromRealtime: (state, action) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Load posts
      .addCase(loadPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPosts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.hasMore = action.payload.length >= 50;
        state.loading = false;
      })
      .addCase(loadPosts.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Create post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Update post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Add reaction
      .addCase(addReaction.fulfilled, (state, action) => {
        const { postId } = action.payload;
        const post = state.items.find(p => p.id === postId);
        if (post) {
          // Increment or decrement likes count
          post.likes = (post.likes || 0) + (action.payload.added ? 1 : -1);
        }
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const post = state.items.find(p => p.id === postId);
        if (post) {
          post.comments = (post.comments || 0) + 1;
        }
      })
      // Share post
      .addCase(sharePost.fulfilled, (state, action) => {
        const post = state.items.find(p => p.id === action.payload);
        if (post) {
          post.shares = (post.shares || 0) + 1;
        }
      });
  }
});

export const { 
  clearError, 
  addPost, 
  addNewPost, 
  updatePostAction, 
  removePost, 
  setSubscription,
  addPostFromRealtime,
  updatePostFromRealtime,
  removePostFromRealtime
} = postsSlice.actions;
export default postsSlice.reducer;
