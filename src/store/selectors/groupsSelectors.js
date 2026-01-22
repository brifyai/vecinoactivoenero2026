import { createSelector } from '@reduxjs/toolkit';

// Selectores base
export const selectGroupsState = (state) => state.groups;
export const selectAllGroups = (state) => state.groups.allGroups;
export const selectMyGroups = (state) => state.groups.myGroups;
export const selectGroupsLoading = (state) => state.groups.loading;
export const selectGroupsError = (state) => state.groups.error;

// Selectores memoizados
export const selectMyGroupsCount = createSelector(
  [selectMyGroups],
  (myGroups) => myGroups.length
);

export const selectSuggestedGroups = createSelector(
  [selectAllGroups, selectMyGroups],
  (allGroups, myGroups) => {
    const myGroupIds = myGroups.map(g => g.id);
    return allGroups.filter(g => !myGroupIds.includes(g.id));
  }
);

export const selectGroupById = createSelector(
  [selectAllGroups, (state, groupId) => groupId],
  (allGroups, groupId) => allGroups.find(g => g.id === groupId)
);

export const selectIsGroupMember = createSelector(
  [selectMyGroups, (state, groupId) => groupId],
  (myGroups, groupId) => myGroups.some(g => g.id === groupId)
);

export const selectGroupPosts = createSelector(
  [selectGroupById],
  (group) => group?.posts || []
);

export const selectSearchGroups = createSelector(
  [selectAllGroups, (state, query) => query],
  (allGroups, query) => {
    if (!query || !query.trim()) return allGroups;
    const lowerQuery = query.toLowerCase();
    return allGroups.filter(group =>
      group.name.toLowerCase().includes(lowerQuery) ||
      group.description.toLowerCase().includes(lowerQuery)
    );
  }
);
