import { createSelector } from '@reduxjs/toolkit';

// Selectores base
export const selectFriendsState = (state) => state.friends;
export const selectFriends = (state) => state.friends.friends;
export const selectFriendRequests = (state) => state.friends.friendRequests;
export const selectFriendsLoading = (state) => state.friends.loading;
export const selectFriendsError = (state) => state.friends.error;

// Selectores memoizados
export const selectFriendsCount = createSelector(
  [selectFriends],
  (friends) => friends.length
);

export const selectPendingRequestsCount = createSelector(
  [selectFriendRequests],
  (requests) => requests.length
);

export const selectIsFriend = createSelector(
  [selectFriends, (state, userId) => userId],
  (friends, userId) => friends.some(friend => friend.id === userId)
);

export const selectHasPendingRequest = createSelector(
  [selectFriendRequests, (state, userId) => userId],
  (requests, userId) => requests.some(req => req.fromUserId === userId)
);
