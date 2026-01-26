// ============================================
// HOOK PARA REALTIME HÍBRIDO
// Combina Firebase Realtime + Supabase + Polling
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/selectors/authSelectors';
import hybridSyncService from '../services/hybridSyncService';
import firebaseNotificationsService from '../services/firebaseNotificationsService';
import { HYBRID_CONFIG } from '../config/hybridConfig';

export const useHybridRealtime = () => {
  const user = useSelector(selectUser);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const initializationRef = useRef(false);

  // ============================================
  // INICIALIZACIÓN
  // ============================================

  const initialize = useCallback(async () => {
    if (!user?.id || initializationRef.current) return;

    try {
      console.log('🚀 Inicializando sistema híbrido realtime...');
      setConnectionStatus('connecting');

      // Inicializar sincronización híbrida
      const syncInitialized = await hybridSyncService.initialize(user.id);
      
      // Inicializar notificaciones Firebase
      const notificationsInitialized = await firebaseNotificationsService.initialize(user.id);

      if (syncInitialized || notificationsInitialized) {
        setIsConnected(true);
        setConnectionStatus('connected');
        setLastUpdate(new Date());
        initializationRef.current = true;
        console.log('✅ Sistema híbrido realtime inicializado');
      } else {
        throw new Error('No se pudo inicializar ningún servicio');
      }

    } catch (error) {
      console.error('❌ Error inicializando sistema híbrido:', error);
      setConnectionStatus('error');
      setIsConnected(false);
    }
  }, [user?.id]);

  // ============================================
  // EFECTOS
  // ============================================

  // Inicializar cuando el usuario esté disponible
  useEffect(() => {
    if (user?.id && !initializationRef.current) {
      initialize();
    }

    return () => {
      if (initializationRef.current) {
        cleanup();
      }
    };
  }, [user?.id, initialize]);

  // Configurar listeners de eventos personalizados
  useEffect(() => {
    if (!isConnected) return;

    const handleFirebasePostsUpdate = (event) => {
      console.log('🔄 Posts actualizados desde Firebase:', event.detail.length);
      setLastUpdate(new Date());
      // Disparar evento global para que los componentes se actualicen
      window.dispatchEvent(new CustomEvent('hybridPostsUpdate', { detail: event.detail }));
    };

    const handleFirebaseMessagesUpdate = (event) => {
      console.log('💬 Mensajes actualizados desde Firebase:', event.detail.length);
      setLastUpdate(new Date());
      window.dispatchEvent(new CustomEvent('hybridMessagesUpdate', { detail: event.detail }));
    };

    const handleFirebaseNotificationsUpdate = (event) => {
      console.log('🔔 Notificaciones actualizadas desde Firebase:', event.detail.length);
      setLastUpdate(new Date());
      window.dispatchEvent(new CustomEvent('hybridNotificationsUpdate', { detail: event.detail }));
    };

    const handlePollingPostsUpdate = (event) => {
      console.log('🔄 Posts actualizados desde polling:', event.detail.length);
      setLastUpdate(new Date());
      window.dispatchEvent(new CustomEvent('hybridPostsUpdate', { detail: event.detail }));
    };

    const handlePollingNotificationsUpdate = (event) => {
      console.log('🔔 Notificaciones actualizadas desde polling:', event.detail.length);
      setLastUpdate(new Date());
      window.dispatchEvent(new CustomEvent('hybridNotificationsUpdate', { detail: event.detail }));
    };

    // Agregar listeners
    window.addEventListener('firebasePostsUpdate', handleFirebasePostsUpdate);
    window.addEventListener('firebaseMessagesUpdate', handleFirebaseMessagesUpdate);
    window.addEventListener('firebaseNotificationsUpdate', handleFirebaseNotificationsUpdate);
    window.addEventListener('pollingPostsUpdate', handlePollingPostsUpdate);
    window.addEventListener('pollingNotificationsUpdate', handlePollingNotificationsUpdate);

    return () => {
      // Remover listeners
      window.removeEventListener('firebasePostsUpdate', handleFirebasePostsUpdate);
      window.removeEventListener('firebaseMessagesUpdate', handleFirebaseMessagesUpdate);
      window.removeEventListener('firebaseNotificationsUpdate', handleFirebaseNotificationsUpdate);
      window.removeEventListener('pollingPostsUpdate', handlePollingPostsUpdate);
      window.removeEventListener('pollingNotificationsUpdate', handlePollingNotificationsUpdate);
    };
  }, [isConnected]);

  // ============================================
  // FUNCIONES PÚBLICAS
  // ============================================

  // Sincronizar post a Firebase
  const syncPost = useCallback(async (postData) => {
    if (!isConnected) return false;

    try {
      await hybridSyncService.syncPostToFirebase(postData);
      return true;
    } catch (error) {
      console.error('❌ Error sincronizando post:', error);
      return false;
    }
  }, [isConnected]);

  // Sincronizar mensaje a Firebase
  const syncMessage = useCallback(async (messageData) => {
    if (!isConnected) return false;

    try {
      await hybridSyncService.syncMessageToFirebase(messageData);
      return true;
    } catch (error) {
      console.error('❌ Error sincronizando mensaje:', error);
      return false;
    }
  }, [isConnected]);

  // Sincronizar notificación a Firebase
  const syncNotification = useCallback(async (notificationData) => {
    if (!isConnected) return false;

    try {
      await hybridSyncService.syncNotificationToFirebase(notificationData);
      return true;
    } catch (error) {
      console.error('❌ Error sincronizando notificación:', error);
      return false;
    }
  }, [isConnected]);

  // Sincronizar emergencia a Firebase
  const syncEmergency = useCallback(async (emergencyData) => {
    if (!isConnected) return false;

    try {
      await hybridSyncService.syncEmergencyToFirebase(emergencyData);
      return true;
    } catch (error) {
      console.error('❌ Error sincronizando emergencia:', error);
      return false;
    }
  }, [isConnected]);

  // Actualizar presencia del usuario
  const updatePresence = useCallback(async (status = 'online') => {
    if (!isConnected || !user?.id) return false;

    try {
      await hybridSyncService.updateUserPresence(user.id, status);
      return true;
    } catch (error) {
      console.error('❌ Error actualizando presencia:', error);
      return false;
    }
  }, [isConnected, user?.id]);

  // Reconectar servicios
  const reconnect = useCallback(async () => {
    console.log('🔄 Intentando reconectar sistema híbrido...');
    setConnectionStatus('connecting');
    
    try {
      cleanup();
      initializationRef.current = false;
      await initialize();
    } catch (error) {
      console.error('❌ Error reconectando:', error);
      setConnectionStatus('error');
    }
  }, [initialize]);

  // Limpiar recursos
  const cleanup = useCallback(() => {
    console.log('🧹 Limpiando recursos híbridos...');
    
    hybridSyncService.cleanup();
    firebaseNotificationsService.cleanup();
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    initializationRef.current = false;
  }, []);

  // ============================================
  // ESTADO Y ESTADÍSTICAS
  // ============================================

  const getConnectionInfo = useCallback(() => {
    return {
      isConnected,
      status: connectionStatus,
      lastUpdate,
      services: {
        hybridSync: hybridSyncService.isInitialized,
        firebaseNotifications: firebaseNotificationsService.fcmToken !== null
      },
      config: {
        syncEnabled: HYBRID_CONFIG.sync.enabled,
        pollingEnabled: HYBRID_CONFIG.polling.enabled,
        syncInterval: HYBRID_CONFIG.sync.interval,
        pollingInterval: HYBRID_CONFIG.polling.interval
      }
    };
  }, [isConnected, connectionStatus, lastUpdate]);

  return {
    // Estado
    isConnected,
    connectionStatus,
    lastUpdate,
    
    // Funciones de sincronización
    syncPost,
    syncMessage,
    syncNotification,
    syncEmergency,
    updatePresence,
    
    // Control de conexión
    reconnect,
    cleanup,
    
    // Información
    getConnectionInfo
  };
};

export default useHybridRealtime;