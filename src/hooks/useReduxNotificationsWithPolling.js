// =====================================================
// HOOK REDUX NOTIFICATIONS CON POLLING REAL-TIME
// Integra el sistema de polling con Redux para notificaciones
// =====================================================

import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback } from 'react';
import { usePollingRealtime } from './usePollingRealtime';
import {
  loadNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  clearError,
  addNotificationFromRealtime,
  updateNotificationFromRealtime,
  removeNotificationFromRealtime
} from '../store/slices/notificationsSlice';
import {
  selectAllNotifications,
  selectNotificationsLoading,
  selectUnreadCount,
  selectUnreadNotifications
} from '../store/selectors/notificationsSelectors';
import { selectUser } from '../store/selectors/authSelectors';

/**
 * Hook que combina Redux con polling real-time para notificaciones
 * Mantiene la misma API que useReduxNotifications pero añade funcionalidad real-time
 */
export const useReduxNotificationsWithPolling = (options = {}) => {
  const {
    enablePolling = false, // DESHABILITADO TEMPORALMENTE
    pollingInterval = 30000, // Aumentado a 30 segundos si se habilita
    showBrowserNotifications = true,
    playSound = true
  } = options;

  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  
  const notifications = useSelector(selectAllNotifications);
  const loading = useSelector(selectNotificationsLoading);
  const unreadCount = useSelector(selectUnreadCount);
  const unreadNotifications = useSelector(selectUnreadNotifications);

  // Configurar polling real-time para notificaciones del usuario actual
  const { data: realtimeNotifications, error: pollingError } = usePollingRealtime('notifications', {
    interval: pollingInterval,
    enabled: enablePolling && !!user?.id,
    filter: user?.id ? { column: 'user_id', operator: 'eq', value: user.id } : null,
    
    onInsert: useCallback((newNotification) => {
      console.log('🔔 Nueva notificación:', newNotification.message?.substring(0, 50) + '...');
      
      // Agregar al store de Redux
      dispatch(addNotificationFromRealtime(newNotification));
      
      // Mostrar notificación del navegador
      if (showBrowserNotifications && 'Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('Nueva notificación', {
          body: newNotification.message,
          icon: '/favicon.ico',
          tag: `notification-${newNotification.id}`,
          badge: '/favicon.ico'
        });
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => notification.close(), 5000);
      }
      
      // Reproducir sonido de notificación
      if (playSound) {
        try {
          // Crear un sonido simple usando Web Audio API
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
          console.log('No se pudo reproducir sonido de notificación:', error);
        }
      }
      
      // Actualizar badge del navegador si está soportado
      if ('setAppBadge' in navigator) {
        navigator.setAppBadge(unreadCount + 1);
      }
    }, [dispatch, showBrowserNotifications, playSound, unreadCount]),
    
    onUpdate: useCallback((updatedNotification, oldNotification) => {
      console.log('📝 Notificación actualizada:', updatedNotification.id);
      dispatch(updateNotificationFromRealtime(updatedNotification));
      
      // Si se marcó como leída, actualizar badge
      if (!updatedNotification.read && oldNotification?.read && 'setAppBadge' in navigator) {
        const newUnreadCount = Math.max(0, unreadCount - 1);
        if (newUnreadCount === 0) {
          navigator.clearAppBadge();
        } else {
          navigator.setAppBadge(newUnreadCount);
        }
      }
    }, [dispatch, unreadCount]),
    
    onDelete: useCallback((deletedNotification) => {
      console.log('🗑️ Notificación eliminada:', deletedNotification.id);
      dispatch(removeNotificationFromRealtime(deletedNotification.id));
      
      // Actualizar badge si era una notificación no leída
      if (!deletedNotification.read && 'setAppBadge' in navigator) {
        const newUnreadCount = Math.max(0, unreadCount - 1);
        if (newUnreadCount === 0) {
          navigator.clearAppBadge();
        } else {
          navigator.setAppBadge(newUnreadCount);
        }
      }
    }, [dispatch, unreadCount])
  });

  // Cargar notificaciones iniciales si no hay datos
  useEffect(() => {
    if (notifications.length === 0 && !loading && user?.id) {
      dispatch(loadNotifications());
    }
  }, [dispatch, notifications.length, loading, user?.id]);

  // Solicitar permisos de notificación
  useEffect(() => {
    if (showBrowserNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [showBrowserNotifications]);

  // Actualizar badge inicial
  useEffect(() => {
    if ('setAppBadge' in navigator) {
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount);
      } else {
        navigator.clearAppBadge();
      }
    }
  }, [unreadCount]);

  // Funciones de manejo de notificaciones (mantienen la misma API)
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

  // Información de estado del polling
  const pollingStatus = {
    isPolling: enablePolling && !!user?.id,
    interval: pollingInterval,
    error: pollingError,
    lastUpdate: realtimeNotifications?.length > 0 ? new Date().toISOString() : null,
    userId: user?.id
  };

  return {
    // Datos principales
    notifications,
    loading,
    unreadCount,
    unreadNotifications,
    
    // Funciones de manejo (API compatible)
    addNotification,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    clearError: handleClearError,
    
    // Información del polling
    pollingStatus
  };
};

export default useReduxNotificationsWithPolling;