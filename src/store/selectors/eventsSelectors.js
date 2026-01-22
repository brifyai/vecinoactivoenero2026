import { createSelector } from '@reduxjs/toolkit';

export const selectEventsState = (state) => state.events;
export const selectAllEvents = (state) => state.events.allEvents;
export const selectMyEvents = (state) => state.events.myEvents;
export const selectEventsLoading = (state) => state.events.loading;
export const selectEventsError = (state) => state.events.error;

export const selectUpcomingEvents = createSelector(
  [selectAllEvents],
  (events) => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }
);

export const selectPastEvents = createSelector(
  [selectAllEvents],
  (events) => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate < now;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }
);

export const selectEventById = createSelector(
  [selectAllEvents, (state, eventId) => eventId],
  (events, eventId) => events.find(e => e.id === eventId)
);

export const selectUserRSVP = createSelector(
  [selectEventById, (state, eventId, userId) => userId],
  (event, userId) => {
    if (!event) return null;
    if (event.attendees?.includes(userId)) return 'going';
    if (event.interested?.includes(userId)) return 'interested';
    return 'not-going';
  }
);
