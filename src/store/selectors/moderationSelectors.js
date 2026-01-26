import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectModerationState = (state) => state.moderation;

// Basic selectors
export const selectModerationReports = createSelector(
  [selectModerationState],
  (moderation) => moderation.reports
);

export const selectModerators = createSelector(
  [selectModerationState],
  (moderation) => moderation.moderators
);

export const selectModerationLoading = createSelector(
  [selectModerationState],
  (moderation) => moderation.loading
);

export const selectModerationError = createSelector(
  [selectModerationState],
  (moderation) => moderation.error
);

// Computed selectors
export const selectPendingModerationReports = createSelector(
  [selectModerationReports],
  (reports) => reports.filter(report => report.status === 'pending')
);

export const selectResolvedModerationReports = createSelector(
  [selectModerationReports],
  (reports) => reports.filter(report => report.status === 'resolved')
);

export const selectRejectedModerationReports = createSelector(
  [selectModerationReports],
  (reports) => reports.filter(report => report.status === 'rejected')
);

export const selectModeratorReports = createSelector(
  [selectModerationReports, (state, moderatorId) => moderatorId],
  (reports, moderatorId) => reports.filter(report => report.moderatorId === moderatorId)
);

export const selectModerationReportById = createSelector(
  [selectModerationReports, (state, id) => id],
  (reports, id) => reports.find(report => report.id === id)
);

export const selectModerationStatistics = createSelector(
  [selectModerationReports, selectModerators],
  (reports, moderators) => ({
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    resolvedReports: reports.filter(r => r.status === 'resolved').length,
    rejectedReports: reports.filter(r => r.status === 'rejected').length,
    totalModerators: moderators.length,
    activeModerators: moderators.filter(m => m.actionsCount > 0).length
  })
);