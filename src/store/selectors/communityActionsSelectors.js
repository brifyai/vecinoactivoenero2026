import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectCommunityActionsState = (state) => state.communityActions;

// Basic selectors
export const selectAllCommunityActions = createSelector(
  [selectCommunityActionsState],
  (actions) => actions.actions
);

export const selectCommunityActionsLoading = createSelector(
  [selectCommunityActionsState],
  (actions) => actions.loading
);

export const selectCommunityActionsError = createSelector(
  [selectCommunityActionsState],
  (actions) => actions.error
);

export const selectCurrentCommunityAction = createSelector(
  [selectCommunityActionsState],
  (actions) => actions.currentAction
);

export const selectActionCategories = createSelector(
  [selectCommunityActionsState],
  (actions) => actions.categories
);

export const selectUserParticipations = createSelector(
  [selectCommunityActionsState],
  (actions) => actions.participations
);

// Computed selectors
export const selectCommunityActionById = createSelector(
  [selectAllCommunityActions, (state, id) => id],
  (actions, id) => actions.find(action => action.id === id)
);

export const selectActiveCommunityActions = createSelector(
  [selectAllCommunityActions],
  (actions) => actions.filter(action => action.status === 'active')
);

export const selectCommunityActionsByCategory = createSelector(
  [selectAllCommunityActions, (state, category) => category],
  (actions, category) => actions.filter(action => action.category === category)
);

export const selectUpcomingCommunityActions = createSelector(
  [selectAllCommunityActions],
  (actions) => actions
    .filter(action => new Date(action.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
);

export const selectUserCommunityActions = createSelector(
  [selectAllCommunityActions, selectUserParticipations, (state, userId) => userId],
  (actions, participations, userId) => {
    const userParticipations = participations.filter(p => p.userId === userId);
    return actions.filter(action => 
      userParticipations.some(p => p.actionId === action.id)
    );
  }
);

export const selectCommunityActionsStatistics = createSelector(
  [selectAllCommunityActions, selectUserParticipations],
  (actions, participations) => ({
    totalActions: actions.length,
    activeActions: actions.filter(a => a.status === 'active').length,
    completedActions: actions.filter(a => a.status === 'completed').length,
    totalParticipations: participations.length
  })
);