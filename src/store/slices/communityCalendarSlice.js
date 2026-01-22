import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createNotification } from './notificationsSlice';
import { showSuccessToast } from '../../utils/sweetalert';

export const loadCalendarEvents = createAsyncThunk('communityCalendar/loadCalendarEvents', async () => {
  const stored = localStorage.getItem('communityCalendar');
  return stored ? JSON.parse(stored) : [];
});

export const createEvent = createAsyncThunk('communityCalendar/createEvent', async ({ eventData, user }, { getState }) => {
  if (!user) throw new Error('Usuario no autenticado');
  const newEvent = {
    id: Date.now(), title: eventData.title, description: eventData.description, type: eventData.type,
    date: eventData.date, startTime: eventData.startTime, endTime: eventData.endTime, location: eventData.location,
    organizerId: user.id, organizerName: user.name, organizerAvatar: user.avatar,
    neighborhoodId: user.neighborhoodId, neighborhoodName: user.neighborhoodName, neighborhoodCode: user.neighborhoodCode,
    isRecurring: eventData.isRecurring || false, recurrencePattern: eventData.recurrencePattern || null,
    maxAttendees: eventData.maxAttendees || null, attendees: [], reminders: eventData.reminders || [],
    images: eventData.images || [], tags: eventData.tags || [], isPublic: eventData.isPublic !== false,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  const { calendarEvents } = getState().communityCalendar;
  const updated = [...calendarEvents, newEvent];
  localStorage.setItem('communityCalendar', JSON.stringify(updated));
  showSuccessToast('¡Evento creado exitosamente!');
  return newEvent;
});

export const attendEvent = createAsyncThunk('communityCalendar/attendEvent', async ({ eventId, user }, { getState, dispatch }) => {
  if (!user) throw new Error('Usuario no autenticado');
  const { calendarEvents } = getState().communityCalendar;
  const event = calendarEvents.find(e => e.id === eventId);
  if (!event) throw new Error('Evento no encontrado');
  const isAttending = event.attendees.some(a => a.id === user.id);
  if (!isAttending && event.maxAttendees && event.attendees.length >= event.maxAttendees) {
    throw new Error('Evento lleno');
  }
  if (!isAttending && event.organizerId !== user.id) {
    dispatch(createNotification({
      userId: event.organizerId, type: 'event_attendance', from: user.id, fromName: user.name, fromAvatar: user.avatar,
      eventId, message: `${user.name} confirmó asistencia a "${event.title}"`, read: false
    }));
  }
  const updated = calendarEvents.map(e => e.id === eventId ? {
    ...e, attendees: isAttending ? e.attendees.filter(a => a.id !== user.id) : 
      [...e.attendees, { id: user.id, name: user.name, avatar: user.avatar, confirmedAt: new Date().toISOString() }]
  } : e);
  localStorage.setItem('communityCalendar', JSON.stringify(updated));
  return { eventId, userId: user.id, isAttending };
});

export const updateEvent = createAsyncThunk('communityCalendar/updateEvent', async ({ eventId, updates, user }, { getState }) => {
  if (!user) throw new Error('Usuario no autenticado');
  const { calendarEvents } = getState().communityCalendar;
  const event = calendarEvents.find(e => e.id === eventId);
  if (!event || event.organizerId !== user.id) throw new Error('No autorizado');
  const updated = calendarEvents.map(e => e.id === eventId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e);
  localStorage.setItem('communityCalendar', JSON.stringify(updated));
  showSuccessToast('Evento actualizado');
  return { eventId, updates };
});

export const deleteEvent = createAsyncThunk('communityCalendar/deleteEvent', async ({ eventId, user }, { getState }) => {
  if (!user) throw new Error('Usuario no autenticado');
  const { calendarEvents } = getState().communityCalendar;
  const event = calendarEvents.find(e => e.id === eventId);
  if (!event || event.organizerId !== user.id) throw new Error('No autorizado');
  const updated = calendarEvents.filter(e => e.id !== eventId);
  localStorage.setItem('communityCalendar', JSON.stringify(updated));
  showSuccessToast('Evento eliminado');
  return eventId;
});

const communityCalendarSlice = createSlice({
  name: 'communityCalendar',
  initialState: { calendarEvents: [], loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(loadCalendarEvents.pending, (state) => { state.loading = true; })
      .addCase(loadCalendarEvents.fulfilled, (state, action) => { state.calendarEvents = action.payload; state.loading = false; })
      .addCase(createEvent.fulfilled, (state, action) => { state.calendarEvents.push(action.payload); })
      .addCase(attendEvent.fulfilled, (state, action) => {
        const event = state.calendarEvents.find(e => e.id === action.payload.eventId);
        if (event) {
          event.attendees = action.payload.isAttending ? 
            event.attendees.filter(a => a.id !== action.payload.userId) : 
            [...event.attendees, action.meta.arg.user];
        }
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const event = state.calendarEvents.find(e => e.id === action.payload.eventId);
        if (event) Object.assign(event, action.payload.updates);
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.calendarEvents = state.calendarEvents.filter(e => e.id !== action.payload);
      });
  }
});

export const { clearError } = communityCalendarSlice.actions;
export default communityCalendarSlice.reducer;
