// =====================================================
// HOOK REDUX NOTIFICATIONS CON HÍBRIDO
// Hook para manejo de notificaciones con sincronización híbrida
// =====================================================

import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback } from 'react';
import {
  loadNotifications,
  markAsRead,
  markAllAsRead,
  clearError
} from '../store/slices/notificationsSlice';
import {
  selectNotifications,
  selectNotificationsLoading,
  selectNotificationsError,
  selectUnreadCount,
  selectUnreadNotifications
} from '../store/selectors/notificationsSelectors';

/**
 * Hook Redux para notificaciones con sincronización híbrida
 */
export const useReduxNotifications = (userId) => {
  const dispatch = useDispatch();
  
  const notifications = useSelector(selectNotifications);
  const loading = useSelector(selectNotificationsLoading);
  const error = useSelector(selectNotificationsError);
  const unreadCount = useSelector(selectUnreadCount);
  const unreadNotifications = useSelector(selectUnreadNotifications);

  // Cargar notificaciones iniciales
  useEffect(() => {
    if (userId && notifications.length === 0 && !loading) {
      dispatch(loadNotifications({ userId, limit: 50 }));
    }
  }, [dispatch, userId, notifications.length, loading]);

  // Funciones de manejo de notificaciones
  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      const result = await dispatch(markAsRead({ notificationId, userId }));
      
      if (markAsRead.fulfilled.match(result)) {
        return { success: true };
      } else {
        return { success: false, error: result.error.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch, userId]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const result = await dispatch(markAllAsRead({ userId }));
      
      if (markAllAsRead.fulfilled.match(result)) {
        return { success: true };
      } else {
        return { success: false, error: result.error.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch, userId]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const refreshNotifications = useCallback((limit = 50) => {
    if (userId) {
      dispatch(loadNotifications({ userId, limit }));
    }
  }, [dispatch, userId]);

  // Obtener notificaciones por tipo
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Obtener notificación por ID
  const getNotificationById = useCallback((notificationId) => {
    return notifications.find(n => n.id === notificationId);
  }, [notifications]);

  return {
    // Datos principales
    notifications,
    loading,
    error,
    unreadCount,
    unreadNotifications,
    
    // Funciones de manejo
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    clearError: handleClearError,
    refreshNotifications,
    
    // Funciones de utilidad
    getNotificationsByType,
    getNotificationById
  };
};

export default useReduxNotifications;