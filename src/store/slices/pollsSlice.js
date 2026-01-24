import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabasePollsService from '../../services/supabasePollsService';

// Async Thunks
export const loadPolls = createAsyncThunk(
  'polls/loadPolls',
  async (neighborhoodId, { rejectWithValue }) => {
    try {
      const polls = await supabasePollsService.getPolls(neighborhoodId);
      return polls;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPoll = createAsyncThunk(
  'polls/createPoll',
  async (pollData, { rejectWithValue }) => {
    try {
      const newPoll = await supabasePollsService.createPoll(pollData);
      return newPoll;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const vote = createAsyncThunk(
  'polls/vote',
  async ({ pollId, optionId, userId }, { rejectWithValue }) => {
    try {
      await supabasePollsService.vote(pollId, optionId, userId);
      return { pollId, optionId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const closePoll = createAsyncThunk(
  'polls/closePoll',
  async ({ pollId, userId }, { rejectWithValue }) => {
    try {
      await supabasePollsService.closePoll(pollId, userId);
      return pollId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePoll = createAsyncThunk(
  'polls/deletePoll',
  async ({ pollId, userId }, { rejectWithValue }) => {
    try {
      await supabasePollsService.deletePoll(pollId, userId);
      return pollId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const pollsSlice = createSlice({
  name: 'polls',
  initialState: {
    polls: [],
    loading: false,
    error: null
  },
  reducers: {
    clearPollsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPolls.fulfilled, (state, action) => {
        state.loading = false;
        state.polls = action.payload;
      })
      .addCase(loadPolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPoll.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.loading = false;
        state.polls.push(action.payload);
      })
      .addCase(createPoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(vote.fulfilled, (state, action) => {
        const { pollId, optionId } = action.payload;
        const poll = state.polls.find(p => p.id === pollId);
        if (poll) {
          const option = poll.options.find(o => o.id === optionId);
          if (option) {
            option.votes = (option.votes || 0) + 1;
          }
          poll.totalVotes = (poll.totalVotes || 0) + 1;
        }
      })
      .addCase(closePoll.fulfilled, (state, action) => {
        const poll = state.polls.find(p => p.id === action.payload);
        if (poll) {
          poll.status = 'closed';
        }
      })
      .addCase(deletePoll.fulfilled, (state, action) => {
        state.polls = state.polls.filter(p => p.id !== action.payload);
      });
  }
});

export const { clearPollsError } = pollsSlice.actions;
export default pollsSlice.reducer;
