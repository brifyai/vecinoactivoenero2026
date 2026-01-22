import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectPolls = (state) => state.polls.polls;
export const selectPollsLoading = (state) => state.polls.loading;
export const selectPollsError = (state) => state.polls.error;

// Memoized selectors
export const selectActivePoll = createSelector(
  [selectPolls],
  (polls) => polls.filter(p => p.status === 'active')
);

export const selectPollById = createSelector(
  [selectPolls, (_, pollId) => pollId],
  (polls, pollId) => polls.find(p => p.id === pollId)
);

export const selectUserVote = createSelector(
  [selectPolls, (_, pollId, userId) => ({ pollId, userId })],
  (polls, { pollId, userId }) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return null;
    
    for (const option of poll.options) {
      if (option.voters && option.voters.includes(userId)) {
        return option.id;
      }
    }
    return null;
  }
);
