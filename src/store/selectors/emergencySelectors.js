import { createSelector } from '@reduxjs/toolkit';

// Selectores básicos
export const selectEmergencyState = (state) => state.emergency;
export const selectEmergencies = (state) => state.emergency.emergencies;
export const selectIsLoading = (state) => state.emergency.isLoading;
export const selectIsSending = (state) => state.emergency.isSending;
export const selectSendError = (state) => state.emergency.sendError;
export const selectLastAlert = (state) => state.emergency.lastAlert;
export const selectIsLoadingHistory = (state) => state.emergency.isLoadingHistory;
export const selectHistoryError = (state) => state.emergency.historyError;
export const selectEmergencyStats = (state) => state.emergency.stats;
export const selectEmergencySettings = (state) => state.emergency.settings;

// Selectores memoizados
export const selectActiveEmergencies = createSelector(
  [selectEmergencies],
  (emergencies) => emergencies.filter(emergency => emergency.status === 'active')
);

export const selectRecentEmergencies = createSelector(
  [selectEmergencies],
  (emergencies) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return emergencies.filter(emergency => new Date(emergency.timestamp) > oneDayAgo);
  }
);

export const selectEmergenciesByType = createSelector(
  [selectEmergencies, (_, type) => type],
  (emergencies, type) => emergencies.filter(emergency => emergency.type === type)
);

export const selectEmergenciesByStatus = createSelector(
  [selectEmergencies, (_, status) => status],
  (emergencies, status) => emergencies.filter(emergency => emergency.status === status)
);

export const selectEmergenciesByNeighborhood = createSelector(
  [selectEmergencies, (_, neighborhoodId) => neighborhoodId],
  (emergencies, neighborhoodId) => emergencies.filter(emergency => emergency.neighborhood_id === neighborhoodId)
);

export const selectCriticalEmergencies = createSelector(
  [selectEmergencies],
  (emergencies) => emergencies.filter(emergency => emergency.priority === 'critical')
);

export const selectEmergencyStatsByType = createSelector(
  [selectEmergencyStats],
  (stats) => stats.byType || {}
);

export const selectEmergencyStatsByNeighborhood = createSelector(
  [selectEmergencyStats],
  (stats) => stats.byNeighborhood || {}
);