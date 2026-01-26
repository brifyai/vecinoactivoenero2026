import { createSelector } from '@reduxjs/toolkit';

// Selectores básicos
export const selectAdminDashboard = (state) => state.adminDashboard;
export const selectCurrentAdmin = (state) => state.adminDashboard.currentAdmin;
export const selectPermissions = (state) => state.adminDashboard.permissions;
export const selectUserNeighborhoods = (state) => state.adminDashboard.userNeighborhoods;
export const selectCurrentNeighborhood = (state) => state.adminDashboard.currentNeighborhood;
export const selectAdminRoles = (state) => state.adminDashboard.adminRoles;
export const selectDashboardConfig = (state) => state.adminDashboard.dashboardConfig;
export const selectDashboardStats = (state) => state.adminDashboard.dashboardStats;
export const selectNeighborhoodUsers = (state) => state.adminDashboard.neighborhoodUsers;
export const selectUserSearchResults = (state) => state.adminDashboard.userSearchResults;
export const selectAdminLoading = (state) => state.adminDashboard.loading;
export const selectAdminError = (state) => state.adminDashboard.error;

// Selectores memoizados
export const selectAdminPermissionsByRole = createSelector(
  [selectPermissions, (_, role) => role],
  (permissions, role) => permissions.filter(p => p.role === role)
);

export const selectNeighborhoodUsersByRole = createSelector(
  [selectNeighborhoodUsers, (_, role) => role],
  (users, role) => users.filter(u => u.role === role)
);

export const selectActiveAdminRoles = createSelector(
  [selectAdminRoles],
  (roles) => roles.filter(role => role.active)
);

export const selectDashboardStatsByType = createSelector(
  [selectDashboardStats, (_, type) => type],
  (stats, type) => stats[type] || {}
);