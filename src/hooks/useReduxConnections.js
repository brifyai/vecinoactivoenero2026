import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import {
  loadConnections,
  sendConnectionRequest
} from '../store/slices/connectionsSlice';
import {
  selectAllConnections,
  selectConnectionsLoading,
  selectConnectionsError,
  selectConnectionsCount
} from '../store/selectors/connectionsSelectors';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast } from '../utils/sweetalert';

export const useReduxConnections = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const connections = useSelector(selectAllConnections);
  const loading = useSelector(selectConnectionsLoading);
  const error = useSelector(selectConnectionsError);
  const connectionsCount = useSelector(selectConnectionsCount);

  const loadUserConnections = () => {
    dispatch(loadConnections());
  };

  const sendRequest = async (toUserId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const result = await dispatch(sendConnectionRequest({ fromUserId: user.id, toUserId })).unwrap();
      showSuccessToast('Solicitud de conexión enviada');
      return { success: true, connection: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Funciones simuladas para compatibilidad (usando localStorage directamente)
  const acceptRequest = async (connectionId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const storedConnections = JSON.parse(localStorage.getItem('connections') || '[]');
      const updatedConnections = storedConnections.map(conn => {
        if (conn.id === connectionId) {
          return { ...conn, status: 'accepted', respondedAt: new Date().toISOString() };
        }
        return conn;
      });
      localStorage.setItem('connections', JSON.stringify(updatedConnections));
      dispatch(loadConnections());
      showSuccessToast('Solicitud de conexión aceptada');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const rejectRequest = async (connectionId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const storedConnections = JSON.parse(localStorage.getItem('connections') || '[]');
      const updatedConnections = storedConnections.filter(conn => conn.id !== connectionId);
      localStorage.setItem('connections', JSON.stringify(updatedConnections));
      dispatch(loadConnections());
      showSuccessToast('Solicitud de conexión rechazada');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const blockUserAction = async (blockedUserId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const storedConnections = JSON.parse(localStorage.getItem('connections') || '[]');
      const updatedConnections = storedConnections.map(conn => {
        if ((conn.user1Id === user.id && conn.user2Id === blockedUserId) ||
            (conn.user1Id === blockedUserId && conn.user2Id === user.id)) {
          return { ...conn, status: 'blocked', blockedBy: user.id };
        }
        return conn;
      });
      localStorage.setItem('connections', JSON.stringify(updatedConnections));
      dispatch(loadConnections());
      showSuccessToast('Usuario bloqueado');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Helper functions - usando useMemo para optimización
  const getConnectionStatus = useMemo(() => {
    return (userId1, userId2) => {
      const connection = connections.find(
        c => (c.user1Id === userId1 && c.user2Id === userId2) ||
             (c.user1Id === userId2 && c.user2Id === userId1)
      );
      return connection?.status || null;
    };
  }, [connections]);

  const getAcceptedConnections = useMemo(() => {
    return (userId) => {
      return connections.filter(
        c => c.status === 'accepted' &&
             (c.user1Id === userId || c.user2Id === userId)
      );
    };
  }, [connections]);

  const getPendingRequests = useMemo(() => {
    return (userId) => {
      return connections.filter(
        c => c.status === 'pending' && c.user2Id === userId
      );
    };
  }, [connections]);

  return {
    connections,
    loading,
    error,
    connectionsCount,
    loadConnections: loadUserConnections,
    sendConnectionRequest: sendRequest,
    acceptConnectionRequest: acceptRequest,
    rejectConnectionRequest: rejectRequest,
    blockUser: blockUserAction,
    // Helper functions
    getConnectionStatus,
    getAcceptedConnections,
    getPendingRequests
  };
};