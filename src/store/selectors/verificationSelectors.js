import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectVerificationState = (state) => state.verification;

// Basic selectors
export const selectVerificationRequests = createSelector(
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

export const selectVerificationStatus = createSelector(
  [selectVerificationState],
  (verification) => verification.status
);

export const selectVerificationDocuments = createSelector(
  [selectVerificationState],
  (verification) => verification.documents
);

export const selectVerificationSettings = createSelector(
  [selectVerificationState],
  (verification) => verification.settings
);

// Computed selectors
export const selectPendingVerificationRequests = createSelector(
  [selectVerificationRequests],
  (requests) => requests.filter(request => request.status === 'pending')
);

export const selectVerificationRequestById = createSelector(
  [selectVerificationRequests, (state, id) => id],
  (requests, id) => requests.find(request => request.id === id)
);

export const selectVerifiedUsers = createSelector(
  [selectVerificationRequests],
  (requests) => requests.filter(request => request.status === 'verified')
);

export const selectVerificationRequestsByType = createSelector(
  [selectVerificationRequests, (state, type) => type],
  (requests, type) => requests.filter(request => request.type === type)
);

export const selectVerificationStatistics = createSelector(
  [selectVerificationRequests],
  (requests) => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    verified: requests.filter(r => r.status === 'verified').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  })
);

export const selectUserVerificationStatus = createSelector(
  [selectVerificationRequests, (state, userId) => userId],
  (requests, userId) => {
    const userRequest = requests.find(request => request.userId === userId);
    return userRequest ? userRequest.status : 'unverified';
  }
);