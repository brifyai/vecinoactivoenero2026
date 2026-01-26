import { createSelector } from '@reduxjs/toolkit';

const selectLocalNeedsState = (state) => state.localNeeds;

export const selectAllLocalNeeds = createSelector(
  [selectLocalNeedsState],
  (localNeeds) => localNeeds.needs
);

export const selectLocalNeedsLoading = createSelector(
  [selectLocalNeedsState],
  (localNeeds) => localNeeds.loading
);

export const selectLocalNeedsError = createSelector(
  [selectLocalNeedsState],
  (localNeeds) => localNeeds.error
);

export const selectLocalNeedsCount = createSelector(
  [selectAllLocalNeeds],
  (needs) => needs.length
);

export const selectLocalNeedById = createSelector(
  [selectAllLocalNeeds, (state, needId) => needId],
  (needs, needId) => needs.find(need => need.id === needId)
);

export const selectLocalNeedsByNeighborhood = createSelector(
  [selectAllLocalNeeds, (state, neighborhoodId) => neighborhoodId],
  (needs, neighborhoodId) => needs.filter(need => need.neighborhoodId === neighborhoodId)
);

export const selectActiveLocalNeeds = createSelector(
  [selectAllLocalNeeds],
  (needs) => needs.filter(need => need.status === 'active')
);

export const selectActiveLocalNeedsByNeighborhood = createSelector(
  [selectAllLocalNeeds, (state, neighborhoodId) => neighborhoodId],
  (needs, neighborhoodId) => needs.filter(
    need => need.neighborhoodId === neighborhoodId && need.status === 'active'
  )
);

export const selectUserLocalNeeds = createSelector(
  [selectAllLocalNeeds, (state, userId) => userId],
  (needs, userId) => needs.filter(need => need.userId === userId)
);

export const selectLocalNeedsByUrgency = createSelector(
  [selectAllLocalNeeds, (state, urgency) => urgency],
  (needs, urgency) => needs.filter(need => need.urgency === urgency)
);

export const selectCriticalLocalNeeds = createSelector(
  [selectAllLocalNeeds],
  (needs) => needs.filter(need => need.urgency === 'critical' && need.status === 'active')
);