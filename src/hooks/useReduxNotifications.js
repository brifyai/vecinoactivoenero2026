import { useSelector, useDispatch } from 'react-redux';
import {
  loadNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  clearError
} from '../store/slices/notificationsSlice';
import {
  selectAllNotifications,
  selectNotificationsLoading,
  selectUnreadCount,
  selectUnreadNotifications
} from '../store/selectors/notificationsSelectors';

/**
 * Hook personalizado que replica la API de useNotifications() pero usa Redux
 */
export const useReduxNotifications = () => {
  const dispatch = useDispatch();
  
  const notifications = useSelector(selectAllNotifications);
  const loading = useSelector(selectNotificationsLoading);
  const unreadCount = useSelector(selectUnreadCount);
  const unreadNotifications = useSelector(selectUnreadNotifications);

  const addNotification = async (notificationData) => {
    const result = await dispatch(createNotification(notificationData));
    if (createNotification.fulfilled.match(result)) {
      return { success: true, notification: result.payload };
    } else {
      return { success: false, error: result.error.message };
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    const result = await dispatch(markAsRead(notificationId));
    if (markAsRead.fulfilled.match(result)) {
      return { success: true };
    } else {
      return { success: false, error: result.error.message };
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await dispatch(markAllAsRead());
    if (markAllAsRead.fulfilled.match(result)) {
      return { success: true };
    } else {
      return { success: false, error: result.error.message };
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    notifications,
    loading,
    unreadCount,
    unreadNotifications,
    addNotification,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    clearError: handleClearError
  };
};
