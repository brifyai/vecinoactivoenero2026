import { createSelector } from '@reduxjs/toolkit';

const selectConnectionsState = (state) => state.connections;

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

export const selectConnectionsCount = createSelector(
  [selectAllConnections],
  (connections) => connections.length
);

export const selectConnectionById = createSelector(
  [selectAllConnections, (state, connectionId) => connectionId],
  (connections, connectionId) => connections.find(connection => connection.id === connectionId)
);

export const selectUserConnections = createSelector(
  [selectAllConnections, (state, userId) => userId],
  (connections, userId) => connections.filter(
    connection => connection.user1Id === userId || connection.user2Id === userId
  )
);

export const selectAcceptedConnections = createSelector(
  [selectAllConnections, (state, userId) => userId],
  (connections, userId) => connections.filter(
    connection => connection.status === 'accepted' &&
                 (connection.user1Id === userId || connection.user2Id === userId)
  )
);

export const selectPendingConnectionRequests = createSelector(
  [selectAllConnections, (state, userId) => userId],
  (connections, userId) => connections.filter(
    connection => connection.status === 'pending' && connection.user2Id === userId
  )
);

export const selectSentConnectionRequests = createSelector(
  [selectAllConnections, (state, userId) => userId],
  (connections, userId) => connections.filter(
    connection => connection.status === 'pending' && connection.user1Id === userId
  )
);

export const selectConnectionStatus = createSelector(
  [selectAllConnections, (state, userId1, userId2) => ({ userId1, userId2 })],
  (connections, { userId1, userId2 }) => {
    const connection = connections.find(
      c => (c.user1Id === userId1 && c.user2Id === userId2) ||
           (c.user1Id === userId2 && c.user2Id === userId1)
    );
    return connection?.status || null;
  }
);

export const selectBlockedConnections = createSelector(
  [selectAllConnections, (state, userId) => userId],
  (connections, userId) => connections.filter(
    connection => connection.status === 'blocked' &&
                 (connection.user1Id === userId || connection.user2Id === userId)
  )
);