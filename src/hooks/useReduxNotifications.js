// =====================================================
// HOOK REDUX NOTIFICATIONS SIN POLLING
// Hook limpio para manejo de notificaciones sin polling destructivo
// =====================================================

import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import {
  loadNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAll,
  clearError
} from '../store/slices/notificationsSlice';
import {
  selectAllNotifications,
  selectNotificationsLoading,
  selectUnreadCount,
  selectUnreadNotifications
} from '../store/selectors/notificationsSelectors';
import { selectUser } from '../store/selectors/authSelectors';

/**
 * Hook Redux para notificaciones SIN polling
 * Carga datos una vez y permite operaciones CRUD
 */
export const useReduxNotifications = (options = {}) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  
  const notifications = useSelector(selectAllNotifications);
  const loading = useSelector(selectNotificationsLoading);
  const unreadCount = useSelector(selectUnreadCount);
  const unreadNotifications = useSelector(selectUnreadNotifications);

  // Cargar notificaciones iniciales si no hay datos
  useEffect(() => {
    if (notifications.length === 0 && !loading && user?.id) {
      dispatch(loadNotifications({ userId: user.id }));
    }
  }, [dispatch, notifications.length, loading, user?.id]);

  // Funciones de manejo de notificaciones
  const addNotification = async (notificationData) => {
    const result = await dispatch(createNotification(notificationData));
    if (createNotification.fulfilled.match(result)) {
      return { success: true, notification: result.payload };
    } else {
      return { success: false, error: result.error.message };
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    const result = await dispatch(markAsRead({ notificationId, userId: user?.id }));
    if (markAsRead.fulfilled.match(result)) {
      return { success: true };
    } else {
      return { success: false, error: result.error.message };
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await dispatch(markAllAsRead(user?.id));
    if (markAllAsRead.fulfilled.match(result)) {
      return { success: true };
    } else {
      return { success: false, error: result.error.message };
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    const result = await dispatch(deleteNotification({ notificationId, userId: user?.id }));
    if (deleteNotification.fulfilled.match(result)) {
      return { success: true };
    } else {
      return { success: false, error: result.error.message };
    }
  };

  const handleClearAll = async () => {
    const result = await dispatch(clearAll(user?.id));
    if (clearAll.fulfilled.match(result)) {
      return { success: true };
    } else {
      return { success: false, error: result.error.message };
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const refresh = () => {
    if (user?.id) {
      dispatch(loadNotifications({ userId: user.id }));
    }
  };

  return {
    // Datos principales
    notifications,
    loading,
    unreadCount,
    unreadNotifications,
    
    // Funciones de manejo
    addNotification,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    clearAll: handleClearAll,
    clearError: handleClearError,
    refresh
  };
};

export default useReduxNotifications;