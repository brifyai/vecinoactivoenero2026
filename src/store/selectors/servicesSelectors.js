import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectServicesState = (state) => state.services;

// Basic selectors
export const selectAllServices = createSelector(
  [selectServicesState],
  (services) => services.services
);

export const selectServicesLoading = createSelector(
  [selectServicesState],
  (services) => services.loading
);

export const selectServicesError = createSelector(
  [selectServicesState],
  (services) => services.error
);

export const selectCurrentService = createSelector(
  [selectServicesState],
  (services) => services.currentService
);

export const selectServiceCategories = createSelector(
  [selectServicesState],
  (services) => services.categories
);

export const selectServiceProviders = createSelector(
  [selectServicesState],
  (services) => services.providers
);

// Computed selectors
export const selectServiceById = createSelector(
  [selectAllServices, (state, id) => id],
  (services, id) => services.find(service => service.id === id)
);

export const selectServicesByCategory = createSelector(
  [selectAllServices, (state, category) => category],
  (services, category) => {
    if (category === 'all') return services;
    return services.filter(service => service.category === category);
  }
);

export const selectServicesByNeighborhood = createSelector(
  [selectAllServices, (state, neighborhoodId) => neighborhoodId],
  (services, neighborhoodId) => 
    services.filter(service => service.neighborhoodId === neighborhoodId || !service.neighborhoodId)
);

export const selectServicesCount = createSelector(
  [selectAllServices],
  (services) => services.length
);