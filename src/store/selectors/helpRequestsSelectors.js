import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectHelpRequests = (state) => state.helpRequests.helpRequests;
export const selectHelpRequestsLoading = (state) => state.helpRequests.loading;
export const selectHelpRequestsError = (state) => state.helpRequests.error;

// Memoized selectors
export const selectRequestsByNeighborhood = createSelector(
  [selectHelpRequests, (_, neighborhoodId) => neighborhoodId],
  (requests, neighborhoodId) => 
    requests?.filter(r => r.neighborhoodId === neighborhoodId) || []
);

export const selectRequestsByType = createSelector(
  [selectHelpRequests, (_, type) => type],
  (requests, type) => requests?.filter(r => r.type === type) || []
);

export const selectRequestsByStatus = createSelector(
  [selectHelpRequests, (_, status) => status],
  (requests, status) => requests?.filter(r => r.status === status) || []
);

export const selectMyRequests = createSelector(
  [selectHelpRequests, (_, userId) => userId],
  (requests, userId) => requests?.filter(r => r.requesterId === userId) || []
);

export const selectMyOffers = createSelector(
  [selectHelpRequests, (_, userId) => userId],
  (requests, userId) => 
    requests?.filter(r => r.offers?.some(o => o.helperId === userId)) || []
);
