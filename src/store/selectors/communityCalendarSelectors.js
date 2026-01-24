import { createSelector } from '@reduxjs/toolkit';

export const selectCalendarEvents = (state) => state.communityCalendar.calendarEvents;
export const selectCalendarLoading = (state) => state.communityCalendar.loading;

export const selectEventsByDate = createSelector(
  [selectCalendarEvents, (_, date) => date],
  (events, date) => events?.filter(e => e.date === date) || []
);

export const selectEventsByMonth = createSelector(
  [selectCalendarEvents, (_, year, month) => ({ year, month })],
  (events, { year, month }) => events?.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate.getFullYear() === year && eventDate.getMonth() === month;
  }) || []
);

export const selectEventsByNeighborhood = createSelector(
  [selectCalendarEvents, (_, neighborhoodId) => neighborhoodId],
  (events, neighborhoodId) => events?.filter(e => e.neighborhoodId === neighborhoodId) || []
);

export const selectEventsByType = createSelector(
  [selectCalendarEvents, (_, type) => type],
  (events, type) => events?.filter(e => e.type === type) || []
);

export const selectUpcomingEvents = createSelector(
  [selectCalendarEvents],
  (events) => {
    if (!events) return [];
    const now = new Date();
    return events.filter(e => new Date(e.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
  }
);

export const selectMyEvents = createSelector(
  [selectCalendarEvents, (_, userId) => userId],
  (events, userId) => events?.filter(e => e.organizerId === userId || e.attendees?.some(a => a.id === userId)) || []
);
