import { createSelector } from '@reduxjs/toolkit';

const selectCommunityActionsState = (state) => state.communityActions;

export const selectAllCommunityActions = createSelector(
  [selectCommunityActionsState],
  (communityActions) => communityActions.actions
);

export const selectCommunityActionsLoading = createSelector(
  [selectCommunityActionsState],
  (communityActions) => communityActions.loading
);

export const selectCommunityActionsError = createSelector(
  [selectCommunityActionsState],
  (communityActions) => communityActions.error
);

export const selectCommunityActionsCount = createSelector(
  [selectAllCommunityActions],
  (actions) => actions.length
);

export const selectCommunityActionById = createSelector(
  [selectAllCommunityActions, (state, actionId) => actionId],
  (actions, actionId) => actions.find(action => action.id === actionId)
);

export const selectCommunityActionsByNeighborhood = createSelector(
  [selectAllCommunityActions, (state, neighborhoodId) => neighborhoodId],
  (actions, neighborhoodId) => actions.filter(action => action.neighborhoodId === neighborhoodId)
);

export const selectUpcomingCommunityActions = createSelector(
  [selectAllCommunityActions],
  (actions) => {
    const now = new Date();
    return actions.filter(
      action => action.status === 'planned' && new Date(action.startDate) > now
    ).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }
);

export const selectUserCommunityActions = createSelector(
  [selectAllCommunityActions, (state, userId) => userId],
  (actions, userId) => actions.filter(action => action.organizerId === userId)
);

export const selectUserCommunityParticipations = createSelector(
  [selectAllCommunityActions, (state, userId) => userId],
  (actions, userId) => actions.filter(action => 
    action.participants.some(p => p.userId === userId)
  )
);