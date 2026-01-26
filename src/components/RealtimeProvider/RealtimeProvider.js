import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../../store/selectors/authSelectors';
import { useRealtimePosts, useRealtimeNotifications } from '../../hooks/useSupabaseRealtime';

/**
 * Componente RealtimeProvider con WebSocket
 * Intenta usar WebSocket, fallback a carga manual
 */
const RealtimeProvider = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Configurar WebSocket para posts (solo si está autenticado)
  const { 
    isConnected: postsConnected, 
    error: postsError 
  } = useRealtimePosts({
    enabled: isAuthenticated
  });

  // Configurar WebSocket para notificaciones del usuario
  const { 
    isConnected: notificationsConnected, 
    error: notificationsError 
  } = useRealtimeNotifications(user?.id, {
    enabled: isAuthenticated && !!user?.id
  });

  // Pedir permisos para notificaciones del navegador
  useEffect(() => {
    if (isAuthenticated && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('🔔 Permiso de notificaciones:', permission);
        });
      }
    }
  }, [isAuthenticated]);

  // Log del estado de conexiones
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔌 Estado WebSocket:');
      console.log(`  Posts: ${postsConnected ? '✅ Conectado' : '❌ Desconectado'}`);
      console.log(`  Notificaciones: ${notificationsConnected ? '✅ Conectado' : '❌ Desconectado'}`);
      
      if (postsError) console.warn('⚠️ Error posts:', postsError);
      if (notificationsError) console.warn('⚠️ Error notificaciones:', notificationsError);
      
      if (!postsConnected && !notificationsConnected) {
        console.log('ℹ️ WebSocket no disponible, usando carga manual');
      }
    }
  }, [isAuthenticated, postsConnected, notificationsConnected, postsError, notificationsError]);

  return children;
};

export default RealtimeProvider;
