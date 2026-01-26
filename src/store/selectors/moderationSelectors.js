import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectModerationState = (state) => state.moderation;

// Basic selectors
export const selectModerationQueue = createSelector(
  [selectModerationState],
  (moderation) => moderation.queue
);

export const selectModerationLoading = createSelector(
  [selectModerationState],
  (moderation) => moderation.loading
);

export const selectModerationError = createSelector(
  [selectModerationState],
  (moderation) => moderation.error
);

export const selectModerationActions = createSelector(
  [selectModerationState],
  (moderation) => moderation.actions
);

export const selectModerationRules = createSelector(
  [selectModerationState],
  (moderation) => moderation.rules
);

export const selectModerationSettings = createSelector(
  [selectModerationState],
  (moderation) => moderation.settings
);

// Computed selectors
export const selectPendingModerationItems = createSelector(
  [selectModerationQueue],
  (queue) => queue.filter(item => item.status === 'pending')
);

export const selectModerationItemById = createSelector(
  [selectModerationQueue, (state, id) => id],
  (queue, id) => queue.find(item => item.id === id)
);

export const selectModerationItemsByType = createSelector(
  [selectModerationQueue, (state, type) => type],
  (queue, type) => queue.filter(item => item.type === type)
);

export const selectRecentModerationActions = createSelector(
  [selectModerationActions],
  (actions) => actions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20)
);

export const selectModerationStatistics = createSelector(
  [selectModerationQueue, selectModerationActions],
  (queue, actions) => ({
    totalItems: queue.length,
    pendingItems: queue.filter(item => item.status === 'pending').length,
    approvedItems: queue.filter(item => item.status === 'approved').length,
    rejectedItems: queue.filter(item => item.status === 'rejected').length,
    totalActions: actions.length
  })
);