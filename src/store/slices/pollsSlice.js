import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { showSuccessToast } from '../../utils/sweetalert';

// Async Thunks
export const loadPolls = createAsyncThunk(
  'polls/loadPolls',
  async (_, { rejectWithValue }) => {
    try {
      const stored = localStorage.getItem('communityPolls');
      if (stored) {
        const loadedPolls = JSON.parse(stored);
        return loadedPolls.map(poll => ({
          ...poll,
          options: poll.options.map(opt => ({
            ...opt,
            voters: opt.voters || []
          }))
        }));
      }
      
      // Default polls
      const defaultPolls = [
        {
          id: 1,
          title: '¿Deberíamos instalar cámaras de seguridad en la entrada?',
          description: 'Votación para decidir si instalamos un sistema de cámaras de seguridad.',
          options: [
            { id: 1, text: 'Sí, es necesario', votes: 45, voters: [] },
            { id: 2, text: 'No, es muy costoso', votes: 12, voters: [] },
            { id: 3, text: 'Necesito más información', votes: 8, voters: [] }
          ],
          totalVotes: 65,
          endsAt: '2025-02-15',
          status: 'active',
          creatorId: 1,
          creatorName: 'Admin',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('communityPolls', JSON.stringify(defaultPolls));
      return defaultPolls;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPoll = createAsyncThunk(
  'polls/createPoll',
  async ({ pollData, user }, { getState, rejectWithValue }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const newPoll = {
        id: Date.now(),
        title: pollData.title,
        description: pollData.description,
        options: pollData.options.map((text, index) => ({
          id: index + 1,
          text,
          votes: 0,
          voters: []
        })),
        totalVotes: 0,
        endsAt: pollData.endsAt,
        status: 'active',
        creatorId: user.id,
        creatorName: user.name,
        creatorAvatar: user.avatar,
        neighborhoodId: user.neighborhoodId,
        createdAt: new Date().toISOString()
      };

      const { polls } = getState().polls;
      const updated = [...polls, newPoll];
      localStorage.setItem('communityPolls', JSON.stringify(updated));
      showSuccessToast('¡Votación creada exitosamente!');

      return newPoll;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const vote = createAsyncThunk(
  'polls/vote',
  async ({ pollId, optionId, user }, { getState, rejectWithValue }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { polls } = getState().polls;
      const poll = polls.find(p => p.id === pollId);
      if (!poll) throw new Error('Votación no encontrada');

      // Check if already voted
      const hasVoted = poll.options.some(opt => opt.voters.includes(user.id));
      if (hasVoted) throw new Error('Ya has votado en esta encuesta');

      const updated = polls.map(p => {
        if (p.id === pollId) {
          return {
            ...p,
            options: p.options.map(opt => 
              opt.id === optionId
                ? { ...opt, votes: opt.votes + 1, voters: [...opt.voters, user.id] }
                : opt
            ),
            totalVotes: p.totalVotes + 1
          };
        }
        return p;
      });

      localStorage.setItem('communityPolls', JSON.stringify(updated));
      showSuccessToast('¡Voto registrado!');

      return { pollId, optionId, userId: user.id };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const closePoll = createAsyncThunk(
  'polls/closePoll',
  async ({ pollId, user }, { getState, rejectWithValue }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { polls } = getState().polls;
      const poll = polls.find(p => p.id === pollId);
      
      if (!poll) throw new Error('Votación no encontrada');
      if (poll.creatorId !== user.id) throw new Error('No autorizado');

      const updated = polls.map(p => 
        p.id === pollId ? { ...p, status: 'closed' } : p
      );

      localStorage.setItem('communityPolls', JSON.stringify(updated));
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
      .addCase(createPoll.fulfilled, (state, action) => {
        state.polls.push(action.payload);
      })
      .addCase(vote.fulfilled, (state, action) => {
        const { pollId, optionId, userId } = action.payload;
        const poll = state.polls.find(p => p.id === pollId);
        if (poll) {
          const option = poll.options.find(o => o.id === optionId);
          if (option) {
            option.votes += 1;
            option.voters.push(userId);
          }
          poll.totalVotes += 1;
        }
      })
      .addCase(closePoll.fulfilled, (state, action) => {
        const poll = state.polls.find(p => p.id === action.payload);
        if (poll) {
          poll.status = 'closed';
        }
      });
  }
});

export const { clearPollsError } = pollsSlice.actions;
export default pollsSlice.reducer;
