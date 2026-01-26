import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectNeighborhoodsState = (state) => state.neighborhoods;

// Basic selectors
export const selectAllNeighborhoods = createSelector(
  [selectNeighborhoodsState],
  (neighborhoods) => neighborhoods.neighborhoods
);

export const selectNeighborhoodsLoading = createSelector(
  [selectNeighborhoodsState],
  (neighborhoods) => neighborhoods.loading
);

export const selectNeighborhoodsError = createSelector(
  [selectNeighborhoodsState],
  (neighborhoods) => neighborhoods.error
);

export const selectCurrentNeighborhood = createSelector(
  [selectNeighborhoodsState],
  (neighborhoods) => neighborhoods.currentNeighborhood
);

export const selectNearbyNeighborhoods = createSelector(
  [selectNeighborhoodsState],
  (neighborhoods) => neighborhoods.nearbyNeighborhoods
);

// Computed selectors
export const selectNeighborhoodById = createSelector(
  [selectAllNeighborhoods, (state, id) => id],
  (neighborhoods, id) => neighborhoods.find(neighborhood => neighborhood.id === id)
);

export const selectNeighborhoodsByDistance = createSelector(
  [selectNearbyNeighborhoods],
  (nearby) => nearby.sort((a, b) => (a.distance || 0) - (b.distance || 0))
);

export const selectActiveNeighborhoods = createSelector(
  [selectAllNeighborhoods],
  (neighborhoods) => neighborhoods.filter(neighborhood => neighborhood.active)
);

export const selectNeighborhoodsCount = createSelector(
  [selectAllNeighborhoods],
  (neighborhoods) => neighborhoods.length
);