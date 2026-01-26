import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectReportsState = (state) => state.reports;

// Basic selectors
export const selectAllReports = createSelector(
  [selectReportsState],
  (reports) => reports.reports
);

export const selectBlockedUsers = createSelector(
  [selectReportsState],
  (reports) => reports.blockedUsers
);

export const selectReportsLoading = createSelector(
  [selectReportsState],
  (reports) => reports.loading
);

export const selectReportsError = createSelector(
  [selectReportsState],
  (reports) => reports.error
);

// Computed selectors
export const selectReportById = createSelector(
  [selectAllReports, (state, id) => id],
  (reports, id) => reports.find(report => report.id === id)
);

export const selectPendingReports = createSelector(
  [selectAllReports],
  (reports) => reports.filter(report => report.status === 'pending')
);

export const selectResolvedReports = createSelector(
  [selectAllReports],
  (reports) => reports.filter(report => report.status === 'resolved')
);

export const selectUserReports = createSelector(
  [selectAllReports, (state, userId) => userId],
  (reports, userId) => reports.filter(report => report.reporterId === userId)
);

export const selectReportsCount = createSelector(
  [selectAllReports],
  (reports) => reports.length
);

export const selectPendingReportsCount = createSelector(
  [selectPendingReports],
  (reports) => reports.length
);

// Blocked users selectors
export const selectUserBlockedUsers = createSelector(
  [selectBlockedUsers, (state, userId) => userId],
  (blockedUsers, userId) => blockedUsers.filter(b => b.blockerId === userId)
);

export const selectIsUserBlocked = createSelector(
  [selectBlockedUsers, (state, { userId, blockerId }) => ({ userId, blockerId })],
  (blockedUsers, { userId, blockerId }) => 
    blockedUsers.some(b => b.blockerId === blockerId && b.blockedUserId === userId)
);