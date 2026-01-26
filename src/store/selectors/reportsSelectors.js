import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectReportsState = (state) => state.reports;

// Basic selectors
export const selectAllReports = createSelector(
  [selectReportsState],
  (reports) => reports.reports
);

export const selectReportsLoading = createSelector(
  [selectReportsState],
  (reports) => reports.loading
);

export const selectReportsError = createSelector(
  [selectReportsState],
  (reports) => reports.error
);

export const selectCurrentReport = createSelector(
  [selectReportsState],
  (reports) => reports.currentReport
);

export const selectReportCategories = createSelector(
  [selectReportsState],
  (reports) => reports.categories
);

// Computed selectors
export const selectReportById = createSelector(
  [selectAllReports, (state, id) => id],
  (reports, id) => reports.find(report => report.id === id)
);

export const selectReportsByCategory = createSelector(
  [selectAllReports, (state, category) => category],
  (reports, category) => reports.filter(report => report.category === category)
);

export const selectPendingReports = createSelector(
  [selectAllReports],
  (reports) => reports.filter(report => report.status === 'pending')
);

export const selectResolvedReports = createSelector(
  [selectAllReports],
  (reports) => reports.filter(report => report.status === 'resolved')
);

export const selectRecentReports = createSelector(
  [selectAllReports],
  (reports) => reports
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
);

export const selectReportsCount = createSelector(
  [selectAllReports],
  (reports) => reports.length
);

export const selectReportsByPriority = createSelector(
  [selectAllReports, (state, priority) => priority],
  (reports, priority) => reports.filter(report => report.priority === priority)
);