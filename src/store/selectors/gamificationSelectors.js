import { createSelector } from '@reduxjs/toolkit';

const selectGamificationState = (state) => state.gamification;

export const selectUserStats = createSelector(
  [selectGamificationState],
  (gamification) => gamification.userStats
);

export const selectLeaderboard = createSelector(
  [selectGamificationState],
  (gamification) => gamification.leaderboard
);

export const selectGamificationLoading = createSelector(
  [selectGamificationState],
  (gamification) => gamification.loading
);

export const selectGamificationError = createSelector(
  [selectGamificationState],
  (gamification) => gamification.error
);

export const selectUserRank = createSelector(
  [selectLeaderboard, (state, userId) => userId],
  (leaderboard, userId) => {
    const index = leaderboard.findIndex(u => u.userId === userId);
    return index >= 0 ? index + 1 : null;
  }
);

export const selectNeighborhoodLeaderboard = createSelector(
  [selectLeaderboard, (state, neighborhoodId) => neighborhoodId],
  (leaderboard, neighborhoodId) => {
    return leaderboard.filter(u => u.neighborhoodId === neighborhoodId).slice(0, 10);
  }
);

export const selectTopUsers = createSelector(
  [selectLeaderboard],
  (leaderboard) => leaderboard.slice(0, 10)
);

export const selectUserLevel = createSelector(
  [selectUserStats],
  (userStats) => userStats?.level || 1
);

export const selectUserPoints = createSelector(
  [selectUserStats],
  (userStats) => userStats?.points || 0
);

export const selectUserBadges = createSelector(
  [selectUserStats],
  (userStats) => userStats?.badges || []
);

export const selectUserStreak = createSelector(
  [selectUserStats],
  (userStats) => userStats?.streak || { current: 0, longest: 0 }
);