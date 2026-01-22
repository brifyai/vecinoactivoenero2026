import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../../services/storageService';

// Thunks asíncronos
export const loadPosts = createAsyncThunk(
  'posts/load',
  async () => {
    const posts = storageService.getPosts();
    return posts;
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (postData, { getState, dispatch }) => {
    const { auth } = getState();
    const user = auth.user;
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    const newPost = {
      id: Date.now(),
      author: user.name,
      authorId: user.id,
      avatar: user.avatar,
      time: 'Justo ahora',
      content: postData.content,
      image: postData.image || null,
      feeling: postData.feeling || null,
      location: postData.location || null,
      privacy: postData.privacy || 'public',
      category: postData.category || 'general',
      hashtags: postData.hashtags || [],
      likes: 0,
      comments: 0,
      shares: 0,
      reactions: {},
      commentsData: [],
      createdAt: new Date().toISOString()
    };
    
    storageService.addPost(newPost);
    
    return newPost;
  }
);

export const updatePost = createAsyncThunk(
  'posts/update',
  async ({ postId, updates }) => {
    storageService.updatePost(postId, updates);
    return { postId, updates };
  }
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (postId) => {
    storageService.deletePost(postId);
    return postId;
  }
);

export const addReaction = createAsyncThunk(
  'posts/addReaction',
  async ({ postId, emoji }, { getState }) => {
    const { auth } = getState();
    const userId = auth.user.id;
    
    const posts = storageService.getPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) throw new Error('Post no encontrado');
    
    const reactions = post.reactions || {};
    const userReactions = reactions[userId] || [];
    
    let newUserReactions;
    if (userReactions.includes(emoji)) {
      newUserReactions = userReactions.filter(r => r !== emoji);
    } else {
      newUserReactions = [...userReactions, emoji];
    }
    
    const newReactions = {
      ...reactions,
      [userId]: newUserReactions
    };
    
    storageService.updatePost(postId, { reactions: newReactions });
    
    return { postId, reactions: newReactions };
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content }, { getState }) => {
    const { auth } = getState();
    const user = auth.user;
    
    if (!user) throw new Error('Usuario no autenticado');
    
    const posts = storageService.getPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) throw new Error('Post no encontrado');
    
    const newComment = {
      id: Date.now(),
      author: user.name,
      authorId: user.id,
      avatar: user.avatar,
      content,
      time: 'Justo ahora',
      likes: 0,
      createdAt: new Date().toISOString()
    };
    
    const commentsData = post.commentsData || [];
    const updatedComments = [...commentsData, newComment];
    
    storageService.updatePost(postId, {
      commentsData: updatedComments,
      comments: updatedComments.length
    });
    
    return { postId, comment: newComment };
  }
);

// Slice
const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
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
      // Load posts
      .addCase(loadPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadPosts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(loadPosts.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update post
      .addCase(updatePost.fulfilled, (state, action) => {
        const { postId, updates } = action.payload;
        const index = state.items.findIndex(p => p.id === postId);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates };
        }
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      // Add reaction
      .addCase(addReaction.fulfilled, (state, action) => {
        const { postId, reactions } = action.payload;
        const post = state.items.find(p => p.id === postId);
        if (post) {
          post.reactions = reactions;
        }
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const post = state.items.find(p => p.id === postId);
        if (post) {
          post.commentsData = post.commentsData || [];
          post.commentsData.push(comment);
          post.comments = post.commentsData.length;
        }
      });
  }
});

export const { clearError } = postsSlice.actions;
export default postsSlice.reducer;
