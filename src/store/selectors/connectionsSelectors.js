import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectConnectionsState = (state) => state.connections;

// Basic selectors
export const selectAllConnections = createSelector(
  [selectConnectionsState],
  (connections) => connections.connections
);

export const selectConnectionsLoading = createSelector(
  [selectConnectionsState],
  (connections) => connections.loading
);

export const selectConnectionsError = createSelector(
  [selectConnectionsState],
  (connections) => connections.error
);

export const selectConnectionRequests = createSelector(
  [selectConnectionsState],
  (connections) => connections.requests
);

export const selectConnectionSuggestions = createSelector(
  [selectConnectionsState],
  (connections) => connections.suggestions
);

export const selectBlockedUsers = createSelector(
  [selectConnectionsState],
  (connections) => connections.blocked
);

// Computed selectors
export const selectConnectionById = createSelector(
  [selectAllConnections, (state, id) => id],
  (connections, id) => connections.find(connection => connection.id === id)
);

export const selectActiveConnections = createSelector(
  [selectAllConnections],
  (connections) => connections.filter(connection => connection.status === 'active')
);

export const selectPendingConnectionRequests = createSelector(
  [selectConnectionRequests],
  (requests) => requests.filter(request => request.status === 'pending')
);

export const selectMutualConnections = createSelector(
  [selectAllConnections, (state, userId) => userId],
  (connections, userId) => connections.filter(connection => 
    connection.mutualConnections && connection.mutualConnections.includes(userId)
  )
);

export const selectNearbyConnections = createSelector(
  [selectAllConnections],
  (connections) => connections.filter(connection => connection.distance && connection.distance < 1000)
);

export const selectConnectionsStatistics = createSelector(
  [selectAllConnections, selectConnectionRequests, selectBlockedUsers],
  (connections, requests, blocked) => ({
    totalConnections: connections.length,
    activeConnections: connections.filter(c => c.status === 'active').length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    blockedUsers: blocked.length
  })
);