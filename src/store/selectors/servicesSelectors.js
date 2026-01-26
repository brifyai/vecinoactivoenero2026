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

export const selectActiveServices = createSelector(
  [selectAllServices],
  (services) => services.filter(service => service.status === 'active')
);

export const selectServicesByCategory = createSelector(
  [selectAllServices, (state, category) => category],
  (services, category) => services.filter(service => service.category === category)
);

export const selectServicesByProvider = createSelector(
  [selectAllServices, (state, providerId) => providerId],
  (services, providerId) => services.filter(service => service.providerId === providerId)
);

export const selectFeaturedServices = createSelector(
  [selectAllServices],
  (services) => services.filter(service => service.featured)
);

export const selectServicesByRating = createSelector(
  [selectAllServices],
  (services) => services
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
);

export const selectServicesStatistics = createSelector(
  [selectAllServices, selectServiceProviders],
  (services, providers) => ({
    totalServices: services.length,
    activeServices: services.filter(s => s.status === 'active').length,
    totalProviders: providers.length,
    averageRating: services.reduce((sum, s) => sum + (s.rating || 0), 0) / services.length || 0
  })
);