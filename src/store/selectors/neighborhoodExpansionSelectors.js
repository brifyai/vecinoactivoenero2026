import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectNeighborhoodExpansionState = (state) => state.neighborhoodExpansion;

// Basic selectors
export const selectExpansionRequests = createSelector(
  [selectNeighborhoodExpansionState],
  (expansion) => expansion.requests
);

export const selectExpansionLoading = createSelector(
  [selectNeighborhoodExpansionState],
  (expansion) => expansion.loading
);

export const selectExpansionError = createSelector(
  [selectNeighborhoodExpansionState],
  (expansion) => expansion.error
);

export const selectCurrentExpansionRequest = createSelector(
  [selectNeighborhoodExpansionState],
  (expansion) => expansion.currentRequest
);

export const selectExpansionHistory = createSelector(
  [selectNeighborhoodExpansionState],
  (expansion) => expansion.history
);

// Computed selectors
export const selectPendingExpansionRequests = createSelector(
  [selectExpansionRequests],
  (requests) => requests.filter(request => request.status === 'pending')
);

export const selectApprovedExpansionRequests = createSelector(
  [selectExpansionRequests],
  (requests) => requests.filter(request => request.status === 'approved')
);

export const selectExpansionRequestById = createSelector(
  [selectExpansionRequests, (state, id) => id],
  (requests, id) => requests.find(request => request.id === id)
);

export const selectExpansionRequestsCount = createSelector(
  [selectExpansionRequests],
  (requests) => requests.length
);