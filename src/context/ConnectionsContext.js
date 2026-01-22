import { createContext, useContext, useState, useEffect } from 'react';
import storageService from '../services/storageService';

const ConnectionsContext = createContext();

export const useConnections = () => {
  const context = useContext(ConnectionsContext);
  if (!context) {
    throw new Error('useConnections must be used within a ConnectionsProvider');
  }
  return context;
};

export const ConnectionsProvider = ({ children }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedConnections = storageService.getConnections();
    setConnections(savedConnections);
    setLoading(false);
  }, []);

  const sendConnectionRequest = (fromUserId, toUserId) => {
    const existingConnection = connections.find(
      c => (c.user1Id === fromUserId && c.user2Id === toUserId) ||
           (c.user1Id === toUserId && c.user2Id === fromUserId)
    );

    if (existingConnection) {
      return { success: false, error: 'Ya existe una solicitud o conexión' };
    }

    const newConnection = {
      id: `conn-${Date.now()}`,
      user1Id: fromUserId,
      user2Id: toUserId,
      status: 'pending',
      initiatedBy: fromUserId,
      createdAt: new Date().toISOString(),
      respondedAt: null,
      sharedLocationConsent: false
    };

    const updated = [...connections, newConnection];
    storageService.saveConnections(updated);
    setConnections(updated);

    // Crear notificación
    storageService.addNotification(toUserId, {
      id: `notif-${Date.now()}`,
      type: 'connection_request',
      fromUserId,
      message: 'Te envió una solicitud de conexión',
      read: false,
      createdAt: new Date().toISOString()
    });

    return { success: true, connection: newConnection };
  };

  const acceptConnectionRequest = (connectionId, userId) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) {
      return { success: false, error: 'Conexión no encontrada' };
    }

    const updated = connections.map(c =>
      c.id === connectionId
        ? { ...c, status: 'accepted', respondedAt: new Date().toISOString() }
        : c
    );

    storageService.saveConnections(updated);
    setConnections(updated);

    // Notificar al otro usuario
    const otherUserId = connection.user1Id === userId ? connection.user2Id : connection.user1Id;
    storageService.addNotification(otherUserId, {
      id: `notif-${Date.now()}`,
      type: 'connection_accepted',
      fromUserId: userId,
      message: 'Aceptó tu solicitud de conexión',
      read: false,
      createdAt: new Date().toISOString()
    });

    return { success: true, connection: updated.find(c => c.id === connectionId) };
  };

  const rejectConnectionRequest = (connectionId, userId) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) {
      return { success: false, error: 'Conexión no encontrada' };
    }

    const updated = connections.filter(c => c.id !== connectionId);
    storageService.saveConnections(updated);
    setConnections(updated);

    return { success: true };
  };

  const getConnectionStatus = (userId1, userId2) => {
    const connection = connections.find(
      c => (c.user1Id === userId1 && c.user2Id === userId2) ||
           (c.user1Id === userId2 && c.user2Id === userId1)
    );
    return connection?.status || null;
  };

  const getAcceptedConnections = (userId) => {
    return connections.filter(
      c => c.status === 'accepted' &&
           (c.user1Id === userId || c.user2Id === userId)
    );
  };

  const getPendingRequests = (userId) => {
    return connections.filter(
      c => c.status === 'pending' && c.user2Id === userId
    );
  };

  const blockUser = (userId, blockedUserId) => {
    const connection = connections.find(
      c => (c.user1Id === userId && c.user2Id === blockedUserId) ||
           (c.user1Id === blockedUserId && c.user2Id === userId)
    );

    if (connection) {
      const updated = connections.map(c =>
        c.id === connection.id
          ? { ...c, status: 'blocked', blockedBy: userId }
          : c
      );
      storageService.saveConnections(updated);
      setConnections(updated);
    }

    return { success: true };
  };

  const value = {
    connections,
    loading,
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    getConnectionStatus,
    getAcceptedConnections,
    getPendingRequests,
    blockUser
  };

  return (
    <ConnectionsContext.Provider value={value}>
      {children}
    </ConnectionsContext.Provider>
  );
};
