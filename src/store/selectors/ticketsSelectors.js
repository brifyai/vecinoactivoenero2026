import { createSelector } from '@reduxjs/toolkit';

// Selectores básicos
export const selectTickets = (state) => state.tickets.items;
export const selectTicketsLoading = (state) => state.tickets.loading;
export const selectTicketsError = (state) => state.tickets.error;
export const selectTicketStats = (state) => state.tickets.stats;
export const selectSelectedTicket = (state) => state.tickets.selectedTicket;

// Selectores memoizados
export const selectTicketsByStatus = createSelector(
  [selectTickets, (_, status) => status],
  (tickets, status) => tickets.filter(ticket => ticket.status === status)
);

export const selectTicketsByPriority = createSelector(
  [selectTickets, (_, priority) => priority],
  (tickets, priority) => tickets.filter(ticket => ticket.priority === priority)
);

export const selectTicketsByCategory = createSelector(
  [selectTickets, (_, category) => category],
  (tickets, category) => tickets.filter(ticket => ticket.category === category)
);

export const selectOpenTickets = createSelector(
  [selectTickets],
  (tickets) => tickets.filter(ticket => ticket.status === 'open')
);

export const selectClosedTickets = createSelector(
  [selectTickets],
  (tickets) => tickets.filter(ticket => ticket.status === 'closed')
);

export const selectHighPriorityTickets = createSelector(
  [selectTickets],
  (tickets) => tickets.filter(ticket => ticket.priority === 'high')
);

export const selectRecentTickets = createSelector(
  [selectTickets],
  (tickets) => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return tickets.filter(ticket => new Date(ticket.created_at) > oneDayAgo);
  }
);