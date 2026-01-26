import { createSelector } from '@reduxjs/toolkit';

// Selectores básicos
export const selectNeighborhood = (state) => state.neighborhood;
export const selectCurrentNeighborhood = (state) => state.neighborhood.current;
export const selectNeighborhoodLoading = (state) => state.neighborhood.loading;
export const selectNeighborhoodError = (state) => state.neighborhood.error;
export const selectNeighborhoodStats = (state) => state.neighborhood.stats;
export const selectNeighborhoodMembers = (state) => state.neighborhood.members;
export const selectNeighborhoodEvents = (state) => state.neighborhood.events;
export const selectNeighborhoodPosts = (state) => state.neighborhood.posts;

// Selectores memoizados
export const selectNeighborhoodById = createSelector(
  [selectCurrentNeighborhood, (_, id) => id],
  (neighborhood, id) => neighborhood?.id === id ? neighborhood : null
);

export const selectActiveMembers = createSelector(
  [selectNeighborhoodMembers],
  (members) => members.filter(member => member.status === 'active')
);

export const selectRecentEvents = createSelector(
  [selectNeighborhoodEvents],
  (events) => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return events.filter(event => new Date(event.date) > oneWeekAgo);
  }
);

export const selectRecentPosts = createSelector(
  [selectNeighborhoodPosts],
  (posts) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return posts.filter(post => new Date(post.created_at) > oneDayAgo);
  }
);

export const selectNeighborhoodStatsByType = createSelector(
  [selectNeighborhoodStats, (_, type) => type],
  (stats, type) => stats[type] || 0
);