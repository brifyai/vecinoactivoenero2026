import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseEventsService from '../../services/supabaseEventsService';

// Async Thunks
export const loadEvents = createAsyncThunk(
  'events/loadEvents',
  async ({ neighborhoodId, filters = {} }, { rejectWithValue }) => {
    try {
      const events = await supabaseEventsService.getEvents(neighborhoodId, filters);
      return events;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const newEvent = await supabaseEventsService.createEvent(eventData);
      return newEvent;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const rsvpEvent = createAsyncThunk(
  'events/rsvpEvent',
  async ({ eventId, userId, status }, { rejectWithValue }) => {
    try {
      await supabaseEventsService.rsvpToEvent(eventId, userId, status);
      return { eventId, status };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, updates, userId }, { rejectWithValue }) => {
    try {
      const updatedEvent = await supabaseEventsService.updateEvent(eventId, updates, userId);
      return updatedEvent;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async ({ eventId, userId }, { rejectWithValue }) => {
    try {
      await supabaseEventsService.deleteEvent(eventId, userId);
      return eventId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getEventAttendees = createAsyncThunk(
  'events/getAttendees',
  async (eventId, { rejectWithValue }) => {
    try {
      const attendees = await supabaseEventsService.getEventAttendees(eventId);
      return { eventId, attendees };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const eventsSlice = createSlice({
  name: 'events',
  initialState: {
    allEvents: [],
    myEvents: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setMyEvents: (state, action) => {
      state.myEvents = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load Events
      .addCase(loadEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.allEvents = action.payload;
      })
      .addCase(loadEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.allEvents.push(action.payload);
        state.myEvents.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // RSVP Event
      .addCase(rsvpEvent.fulfilled, (state, action) => {
        const { eventId, status } = action.payload;
        const event = state.allEvents.find(e => e.id === eventId);
        if (event) {
          // Update attendee count or status
          event.rsvp_status = status;
        }
      })
      // Update Event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const eventIndex = state.allEvents.findIndex(e => e.id === action.payload.id);
        if (eventIndex !== -1) {
          state.allEvents[eventIndex] = action.payload;
        }
        const myEventIndex = state.myEvents.findIndex(e => e.id === action.payload.id);
        if (myEventIndex !== -1) {
          state.myEvents[myEventIndex] = action.payload;
        }
      })
      // Delete Event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.allEvents = state.allEvents.filter(e => e.id !== action.payload);
        state.myEvents = state.myEvents.filter(e => e.id !== action.payload);
      })
      // Get Attendees
      .addCase(getEventAttendees.fulfilled, (state, action) => {
        const { eventId, attendees } = action.payload;
        const event = state.allEvents.find(e => e.id === eventId);
        if (event) {
          event.attendees = attendees;
        }
      });
  }
});

export const { clearError, setMyEvents } = eventsSlice.actions;
export default eventsSlice.reducer;
