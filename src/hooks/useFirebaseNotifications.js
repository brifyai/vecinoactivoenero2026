import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firebaseNotificationsService from '../services/firebaseNotificationsService';
import {
  initializeNotifications,
  loadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  setNotificationsFromRealtime,
  addNotificationFromRealtime,
  updateNotificationFromRealtime,
  removeNotificationFromRealtime,
  setSubscription,
  setFCMToken,
  handleForegroundNotification
} from '../store/slices/notificationsSlice';

export const useFirebaseNotifications = (userId) => {
  const dispatch = useDispatch();
  const { 
    items: notifications, 
    unreadCount, 
    fcmToken, 
    initialized, 
    loading, 
    error,
    subscription 
  } = useSelector(state => state.notifications);

  // Inicializar servicio de notificaciones
  const initialize = useCallback(async () => {
    if (!userId || initialized) return;

    try {
      console.log('Inicializando notificaciones Firebase para usuario:', userId);
      await dispatch(initializeNotifications(userId)).unwrap();
      console.log('Notificaciones Firebase inicializadas exitosamente');
    } catch (error) {
      console.error('Error inicializando notificaciones:', error);
    }
  }, [userId, initialized, dispatch]);

  // Suscribirse a notificaciones en tiempo real
  const subscribeToNotifications = useCallback(() => {
    if (!userId) return;

    console.log('Suscribiéndose a notificaciones para usuario:', userId);
    
    const unsubscribe = firebaseNotificationsService.subscribeToNotifications(userId, (notifications) => {
      console.log('Notificaciones actualizadas:', notifications.length);
      dispatch(setNotificationsFromRealtime(notifications));
    });

    dispatch(setSubscription(unsubscribe));
    return unsubscribe;
  }, [userId, dispatch]);

  // Configurar listener para notificaciones en foreground
  const setupForegroundListener = useCallback(() => {
    // Escuchar evento personalizado de notificaciones
    const handleFirebaseNotification = (event) => {
      console.log('Notificación recibida en foreground:', event.detail);
      dispatch(handleForegroundNotification(event.detail));
    };

    window.addEventListener('firebaseNotification', handleFirebaseNotification);

    return () => {
      window.removeEventListener('firebaseNotification', handleFirebaseNotification);
    };
  }, [dispatch]);

  // Cargar notificaciones iniciales
  const loadInitialNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      await dispatch(loadNotifications({ userId, limit: 50 })).unwrap();
      console.log('Notificaciones iniciales cargadas');
    } catch (error) {
      console.error('Error cargando notificaciones iniciales:', error);
    }
  }, [userId, dispatch]);

  // Marcar notificación como leída
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await dispatch(markAsRead(notificationId)).unwrap();
      console.log('Notificación marcada como leída:', notificationId);
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  }, [dispatch]);

  // Marcar todas las notificaciones como leídas
  const markAllNotificationsAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await dispatch(markAllAsRead(userId)).unwrap();
      console.log('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }
  }, [userId, dispatch]);

  // Eliminar notificación
  const deleteNotificationById = useCallback(async (notificationId) => {
    try {
      await dispatch(deleteNotification(notificationId)).unwrap();
      console.log('Notificación eliminada:', notificationId);
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  }, [dispatch]);

  // Actualizar conteo de no leídas
  const updateUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      await dispatch(getUnreadCount(userId)).unwrap();
    } catch (error) {
      console.error('Error actualizando conteo de no leídas:', error);
    }
  }, [userId, dispatch]);

  // Crear notificación (para testing o uso interno)
  const createNotification = useCallback(async (notificationData) => {
    try {
      const notification = await firebaseNotificationsService.createNotification(notificationData);
      console.log('Notificación creada:', notification.id);
      return notification;
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }, []);

  // Solicitar permisos de notificación
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  // Mostrar notificación local (para testing)
  const showLocalNotification = useCallback((title, options = {}) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      return notification;
    }
  }, []);

  // Limpiar suscripciones
  const cleanup = useCallback(() => {
    if (subscription) {
      subscription();
      dispatch(setSubscription(null));
    }
    
    // Limpiar servicio Firebase
    firebaseNotificationsService.cleanup();
  }, [subscription, dispatch]);

  // Efectos
  useEffect(() => {
    if (userId && !initialized) {
      initialize();
    }
  }, [userId, initialized, initialize]);

  useEffect(() => {
    if (initialized && userId) {
      const unsubscribe = subscribeToNotifications();
      const cleanupForeground = setupForegroundListener();
      loadInitialNotifications();

      return () => {
        if (unsubscribe) unsubscribe();
        cleanupForeground();
      };
    }
  }, [initialized, userId, subscribeToNotifications, setupForegroundListener, loadInitialNotifications]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // Estado
    notifications,
    unreadCount,
    fcmToken,
    initialized,
    loading,
    error,
    
    // Funciones
    initialize,
    subscribeToNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotificationById,
    updateUnreadCount,
    createNotification,
    requestNotificationPermission,
    showLocalNotification,
    cleanup
  };
};

export default useFirebaseNotifications;