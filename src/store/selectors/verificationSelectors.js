import { createSelector } from '@reduxjs/toolkit';

const selectVerificationState = (state) => state.verification;

export const selectAllVerificationRequests = createSelector(
  [selectVerificationState],
  (verification) => verification.requests
);

export const selectVerificationLoading = createSelector(
  [selectVerificationState],
  (verification) => verification.loading
);

export const selectVerificationError = createSelector(
  [selectVerificationState],
  (verification) => verification.error
);

export const selectVerificationRequestsCount = createSelector(
  [selectAllVerificationRequests],
  (requests) => requests.length
);

export const selectVerificationRequestById = createSelector(
  [selectAllVerificationRequests, (state, requestId) => requestId],
  (requests, requestId) => requests.find(request => request.id === requestId)
);

export const selectPendingVerificationRequests = createSelector(
  [selectAllVerificationRequests],
  (requests) => requests.filter(request => request.status === 'pending')
);

export const selectApprovedVerificationRequests = createSelector(
  [selectAllVerificationRequests],
  (requests) => requests.filter(request => request.status === 'approved')
);

export const selectRejectedVerificationRequests = createSelector(
  [selectAllVerificationRequests],
  (requests) => requests.filter(request => request.status === 'rejected')
);

export const selectUserVerificationRequest = createSelector(
  [selectAllVerificationRequests, (state, userId) => userId],
  (requests, userId) => requests.find(
    request => request.userId === userId && request.status === 'pending'
  )
);

export const selectUserVerificationHistory = createSelector(
  [selectAllVerificationRequests, (state, userId) => userId],
  (requests, userId) => requests.filter(request => request.userId === userId)
);

export const selectVerificationsByNeighborhood = createSelector(
  [selectAllVerificationRequests, (state, neighborhoodId) => neighborhoodId],
  (requests, neighborhoodId) => requests.filter(request => request.neighborhoodId === neighborhoodId)
);

export const selectRecentVerificationRequests = createSelector(
  [selectAllVerificationRequests],
  (requests) => {
    return [...requests]
      .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
      .slice(0, 10);
  }
);