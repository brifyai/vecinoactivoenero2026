import { createSelector } from '@reduxjs/toolkit';

// Selectores básicos
export const selectAllPosts = state => state.posts.items;
export const selectPostsLoading = state => state.posts.loading;
export const selectPostsError = state => state.posts.error;

// Selectores memoizados
export const selectUserPosts = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts?.filter(post => post.authorId === userId) || []
);

export const selectPostsByCategory = createSelector(
  [selectAllPosts, (state, category) => category],
  (posts, category) => posts?.filter(post => post.category === category) || []
);

export const selectPostById = createSelector(
  [selectAllPosts, (state, postId) => postId],
  (posts, postId) => posts.find(post => post.id === postId)
);

export const selectPostsCount = createSelector(
  [selectAllPosts],
  (posts) => posts?.length || 0
);
