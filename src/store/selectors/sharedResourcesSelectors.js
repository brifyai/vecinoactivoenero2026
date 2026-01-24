import { createSelector } from '@reduxjs/toolkit';

export const selectResources = (state) => state.sharedResources.resources;
export const selectReservations = (state) => state.sharedResources.reservations;
export const selectResourcesLoading = (state) => state.sharedResources.loading;

export const selectResourcesByNeighborhood = createSelector(
  [selectResources, (_, neighborhoodId) => neighborhoodId],
  (resources, neighborhoodId) => resources?.filter(r => r.neighborhoodId === neighborhoodId && r.isAvailable) || []
);

export const selectResourcesByCategory = createSelector(
  [selectResources, (_, category) => category],
  (resources, category) => resources?.filter(r => r.category === category && r.isAvailable) || []
);

export const selectMyResources = createSelector(
  [selectResources, (_, userId) => userId],
  (resources, userId) => resources?.filter(r => r.ownerId === userId) || []
);

export const selectMyReservations = createSelector(
  [selectReservations, (_, userId) => userId],
  (reservations, userId) => reservations?.filter(r => r.borrowerId === userId) || []
);

export const selectPendingRequests = createSelector(
  [selectReservations, (_, userId) => userId],
  (reservations, userId) => reservations?.filter(r => r.ownerId === userId && r.status === 'pendiente') || []
);
