import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseTicketsService from '../../services/supabaseTicketsService';

// =====================================================
// ASYNC THUNKS
// =====================================================

// Crear ticket
export const createTicket = createAsyncThunk(
  'tickets/create',
  async (ticketData, { rejectWithValue }) => {
    try {
      const result = await supabaseTicketsService.createTicket(ticketData);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener tickets
export const fetchTickets = createAsyncThunk(
  'tickets/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const result = await supabaseTicketsService.getTickets(filters);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener ticket por ID
export const fetchTicketById = createAsyncThunk(
  'tickets/fetchById',
  async (ticketId, { rejectWithValue }) => {
    try {
      const result = await supabaseTicketsService.getTicketById(ticketId);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Actualizar ticket
export const updateTicket = createAsyncThunk(
  'tickets/update',
  async ({ ticketId, updates }, { rejectWithValue }) => {
    try {
      const result = await supabaseTicketsService.updateTicket(ticketId, updates);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Asignar ticket
export const assignTicket = createAsyncThunk(
  'tickets/assign',
  async ({ ticketId, assignedTo, assignedBy }, { rejectWithValue }) => {
    try {
      const result = await supabaseTicketsService.assignTicket(ticketId, assignedTo, assignedBy);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Actualizar estado
export const updateTicketStatus = createAsyncThunk(
  'tickets/updateStatus',
  async ({ ticketId, newStatus, userId, notes }, { rejectWithValue }) => {
    try {
      const result = await supabaseTicketsService.updateStatus(ticketId, newStatus, userId, notes);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Agregar comentario
export const addTicketComment = createAsyncThunk(
  'tickets/addComment',
  async ({ ticketId, commentData }, { rejectWithValue }) => {
    try {
      const result = await supabaseTicketsService.addComment(ticketId, commentData);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return { ticketId, comment: result.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener comentarios
export const fetchTicketComments = createAsyncThunk(
  'tickets/fetchComments',
  async (ticketId, { rejectWithValue }) => {
    try {
      const result = await supabaseTicketsService.getComments(ticketId);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return { ticketId, comments: result.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener estadísticas
export const fetchTicketStats = createAsyncThunk(
  'tickets/fetchStats',
  async (neighborhoodId, { rejectWithValue }) => {
    try {
      const result = await supabaseTicketsService.getTicketStats(neighborhoodId);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Buscar tickets
export const searchTickets = createAsyncThunk(
  'tickets/search',
  async ({ searchTerm, filters }, { rejectWithValue }) => {
    try {
      const result = await supabaseTicketsService.searchTickets(searchTerm, filters);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// =====================================================
// SLICE
// =====================================================

const initialState = {
  tickets: [],
  currentTicket: null,
  comments: {},
  stats: [],
  loading: false,
  error: null,
  filters: {
    status: null,
    category: null,
    priority: null,
    neighborhood_id: null
  },
  searchTerm: '',
  searchResults: []
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchTerm = '';
    },
    setCurrentTicket: (state, action) => {
      state.currentTicket = action.payload;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
    // Realtime updates
    addTicketFromRealtime: (state, action) => {
      const newTicket = action.payload;
      const existingIndex = state.tickets.findIndex(t => t.id === newTicket.id);
      if (existingIndex === -1) {
        state.tickets.unshift(newTicket);
      }
    },
    updateTicketFromRealtime: (state, action) => {
      const updatedTicket = action.payload;
      const index = state.tickets.findIndex(t => t.id === updatedTicket.id);
      if (index !== -1) {
        state.tickets[index] = { ...state.tickets[index], ...updatedTicket };
      }
      if (state.currentTicket && state.currentTicket.id === updatedTicket.id) {
        state.currentTicket = { ...state.currentTicket, ...updatedTicket };
      }
    },
    removeTicketFromRealtime: (state, action) => {
      const ticketId = action.payload;
      state.tickets = state.tickets.filter(t => t.id !== ticketId);
      if (state.currentTicket && state.currentTicket.id === ticketId) {
        state.currentTicket = null;
      }
    },
    addCommentFromRealtime: (state, action) => {
      const { ticketId, comment } = action.payload;
      if (!state.comments[ticketId]) {
        state.comments[ticketId] = [];
      }
      const existingIndex = state.comments[ticketId].findIndex(c => c.id === comment.id);
      if (existingIndex === -1) {
        state.comments[ticketId].push(comment);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Create ticket
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets.unshift(action.payload);
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch ticket by ID
      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTicket = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update ticket
      .addCase(updateTicket.fulfilled, (state, action) => {
        const index = state.tickets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        if (state.currentTicket && state.currentTicket.id === action.payload.id) {
          state.currentTicket = action.payload;
        }
      })
      
      // Assign ticket
      .addCase(assignTicket.fulfilled, (state, action) => {
        const index = state.tickets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        if (state.currentTicket && state.currentTicket.id === action.payload.id) {
          state.currentTicket = action.payload;
        }
      })
      
      // Update status
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        const index = state.tickets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        if (state.currentTicket && state.currentTicket.id === action.payload.id) {
          state.currentTicket = action.payload;
        }
      })
      
      // Add comment
      .addCase(addTicketComment.fulfilled, (state, action) => {
        const { ticketId, comment } = action.payload;
        if (!state.comments[ticketId]) {
          state.comments[ticketId] = [];
        }
        state.comments[ticketId].push(comment);
      })
      
      // Fetch comments
      .addCase(fetchTicketComments.fulfilled, (state, action) => {
        const { ticketId, comments } = action.payload;
        state.comments[ticketId] = comments;
      })
      
      // Fetch stats
      .addCase(fetchTicketStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      
      // Search tickets
      .addCase(searchTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setSearchTerm,
  clearSearchResults,
  setCurrentTicket,
  clearCurrentTicket,
  addTicketFromRealtime,
  updateTicketFromRealtime,
  removeTicketFromRealtime,
  addCommentFromRealtime
} = ticketsSlice.actions;

export default ticketsSlice.reducer;