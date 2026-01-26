import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectGamificationState = (state) => state.gamification;

// Basic selectors
export const selectUserPoints = createSelector(
  [selectGamificationState],
  (gamification) => gamification.points
);

export const selectUserBadges = createSelector(
  [selectGamificationState],
  (gamification) => gamification.badges
);

export const selectGamificationLoading = createSelector(
  [selectGamificationState],
  (gamification) => gamification.loading
);

export const selectGamificationError = createSelector(
  [selectGamificationState],
  (gamification) => gamification.error
);

export const selectLeaderboard = createSelector(
  [selectGamificationState],
  (gamification) => gamification.leaderboard
);

export const selectAchievements = createSelector(
  [selectGamificationState],
  (gamification) => gamification.achievements
);

export const selectChallenges = createSelector(
  [selectGamificationState],
  (gamification) => gamification.challenges
);

// Computed selectors
export const selectUserLevel = createSelector(
  [selectUserPoints],
  (points) => {
    if (points < 100) return 1;
    if (points < 500) return 2;
    if (points < 1000) return 3;
    if (points < 2500) return 4;
    return 5;
  }
);

export const selectUnlockedBadges = createSelector(
  [selectUserBadges],
  (badges) => badges.filter(badge => badge.unlocked)
);

export const selectActiveChallenges = createSelector(
  [selectChallenges],
  (challenges) => challenges.filter(challenge => challenge.active)
);

export const selectCompletedAchievements = createSelector(
  [selectAchievements],
  (achievements) => achievements.filter(achievement => achievement.completed)
);

export const selectUserRank = createSelector(
  [selectLeaderboard, selectUserPoints],
  (leaderboard, userPoints) => {
    const sortedLeaderboard = leaderboard.sort((a, b) => b.points - a.points);
    return sortedLeaderboard.findIndex(user => user.points === userPoints) + 1;
  }
);

export const selectGamificationStatistics = createSelector(
  [selectUserPoints, selectUserBadges, selectAchievements, selectChallenges],
  (points, badges, achievements, challenges) => ({
    totalPoints: points,
    totalBadges: badges.length,
    unlockedBadges: badges.filter(b => b.unlocked).length,
    completedAchievements: achievements.filter(a => a.completed).length,
    activeChallenges: challenges.filter(c => c.active).length
  })
);