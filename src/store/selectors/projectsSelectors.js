import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectProjects = (state) => state.projects.projects;
export const selectProjectsLoading = (state) => state.projects.loading;
export const selectProjectsError = (state) => state.projects.error;

// Memoized selectors
export const selectProjectsByNeighborhood = createSelector(
  [selectProjects, (_, neighborhoodId) => neighborhoodId],
  (projects, neighborhoodId) => 
    projects.filter(p => p.neighborhoodId === neighborhoodId)
);

export const selectProjectsByStatus = createSelector(
  [selectProjects, (_, status) => status],
  (projects, status) => projects.filter(p => p.status === status)
);

export const selectProjectsByCategory = createSelector(
  [selectProjects, (_, category) => category],
  (projects, category) => projects.filter(p => p.category === category)
);

export const selectProjectById = createSelector(
  [selectProjects, (_, projectId) => projectId],
  (projects, projectId) => projects.find(p => p.id === projectId)
);
