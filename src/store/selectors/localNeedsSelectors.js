import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectLocalNeedsState = (state) => state.localNeeds;

// Basic selectors
export const selectAllLocalNeeds = createSelector(
  [selectLocalNeedsState],
  (needs) => needs.needs
);

export const selectLocalNeedsLoading = createSelector(
  [selectLocalNeedsState],
  (needs) => needs.loading
);

export const selectLocalNeedsError = createSelector(
  [selectLocalNeedsState],
  (needs) => needs.error
);

export const selectCurrentLocalNeed = createSelector(
  [selectLocalNeedsState],
  (needs) => needs.currentNeed
);

export const selectNeedCategories = createSelector(
  [selectLocalNeedsState],
  (needs) => needs.categories
);

export const selectNeedResponses = createSelector(
  [selectLocalNeedsState],
  (needs) => needs.responses
);

// Computed selectors
export const selectLocalNeedById = createSelector(
  [selectAllLocalNeeds, (state, id) => id],
  (needs, id) => needs.find(need => need.id === id)
);

export const selectActiveLocalNeeds = createSelector(
  [selectAllLocalNeeds],
  (needs) => needs.filter(need => need.status === 'active')
);

export const selectLocalNeedsByCategory = createSelector(
  [selectAllLocalNeeds, (state, category) => category],
  (needs, category) => needs.filter(need => need.category === category)
);

export const selectUrgentLocalNeeds = createSelector(
  [selectAllLocalNeeds],
  (needs) => needs.filter(need => need.priority === 'urgent')
);

export const selectRecentLocalNeeds = createSelector(
  [selectAllLocalNeeds],
  (needs) => needs
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10)
);

export const selectLocalNeedsByUser = createSelector(
  [selectAllLocalNeeds, (state, userId) => userId],
  (needs, userId) => needs.filter(need => need.userId === userId)
);

export const selectLocalNeedsStatistics = createSelector(
  [selectAllLocalNeeds, selectNeedResponses],
  (needs, responses) => ({
    totalNeeds: needs.length,
    activeNeeds: needs.filter(n => n.status === 'active').length,
    fulfilledNeeds: needs.filter(n => n.status === 'fulfilled').length,
    totalResponses: responses.length
  })
);