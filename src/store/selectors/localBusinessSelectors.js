import { createSelector } from '@reduxjs/toolkit';

export const selectBusinesses = (state) => state.localBusiness.businesses;
export const selectBusinessesLoading = (state) => state.localBusiness.loading;

export const selectBusinessesByNeighborhood = createSelector(
  [selectBusinesses, (_, neighborhoodId) => neighborhoodId],
  (businesses, neighborhoodId) => businesses?.filter(b => b.neighborhoodId === neighborhoodId && b.isActive) || []
);

export const selectBusinessesByCategory = createSelector(
  [selectBusinesses, (_, category) => category],
  (businesses, category) => businesses?.filter(b => b.category === category && b.isActive) || []
);

export const selectTopRatedBusinesses = createSelector(
  [selectBusinesses, (_, limit = 10) => limit],
  (businesses, limit) => businesses?.filter(b => b.isActive && b.totalReviews > 0).sort((a, b) => b.rating - a.rating).slice(0, limit) || []
);

export const selectMyBusinesses = createSelector(
  [selectBusinesses, (_, userId) => userId],
  (businesses, userId) => businesses?.filter(b => b.ownerId === userId) || []
);
