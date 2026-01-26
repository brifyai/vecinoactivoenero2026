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

export const selectSecurityAlerts = createSelector(
  [selectSecurityState],
  (security) => security.alerts
);

export const selectSecurityIncidents = createSelector(
  [selectSecurityState],
  (security) => security.incidents
);

export const selectSecuritySettings = createSelector(
  [selectSecurityState],
  (security) => security.settings
);

// Computed selectors
export const selectActiveSecurityAlerts = createSelector(
  [selectSecurityAlerts],
  (alerts) => alerts.filter(alert => alert.active)
);

export const selectHighPriorityIncidents = createSelector(
  [selectSecurityIncidents],
  (incidents) => incidents.filter(incident => incident.priority === 'high')
);

export const selectRecentSecurityReports = createSelector(
  [selectSecurityReports],
  (reports) => reports
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
);

export const selectSecurityReportById = createSelector(
  [selectSecurityReports, (state, id) => id],
  (reports, id) => reports.find(report => report.id === id)
);

export const selectSecurityStatistics = createSelector(
  [selectSecurityReports, selectSecurityIncidents],
  (reports, incidents) => ({
    totalReports: reports.length,
    totalIncidents: incidents.length,
    resolvedReports: reports.filter(r => r.status === 'resolved').length,
    activeIncidents: incidents.filter(i => i.status === 'active').length
  })
);