import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectSecurityState = (state) => state.security;

// Basic selectors
export const selectSecurityReports = createSelector(
  [selectSecurityState],
  (security) => security.reports
);

export const selectSecurityLoading = createSelector(
  [selectSecurityState],
  (security) => security.loading
);

export const selectSecurityError = createSelector(
  [selectSecurityState],
  (security) => security.error
);

// Computed selectors
export const selectSecurityReportById = createSelector(
  [selectSecurityReports, (state, id) => id],
  (reports, id) => reports.find(report => report.id === id)
);

export const selectReportsByNeighborhood = createSelector(
  [selectSecurityReports, (state, neighborhoodId) => neighborhoodId],
  (reports, neighborhoodId) => reports.filter(report => report.neighborhoodId === neighborhoodId)
);

export const selectRecentReports = createSelector(
  [selectSecurityReports, (state, hours = 24) => hours],
  (reports, hours) => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
    return reports.filter(report => new Date(report.timestamp) > cutoff);
  }
);

export const selectSecurityReportsCount = createSelector(
  [selectSecurityReports],
  (reports) => reports.length
);