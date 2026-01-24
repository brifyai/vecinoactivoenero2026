import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../../store/selectors/authSelectors';
import { loadPosts } from '../../store/slices/postsSlice';
import { loadNotifications } from '../../store/slices/notificationsSlice';
import { loadMessages } from '../../store/slices/messagesSlice';

/**
 * Componente que implementa polling para simular Real-time
 * Consulta la base de datos cada X segundos para obtener nuevos datos
 * 
 * NOTA: Esto es una alternativa temporal mientras se configura Real-time WebSocket
 */
const RealtimeProvider = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  // Pedir permiso para notificaciones del navegador
  useEffect(() => {
    if (isAuthenticated && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('🔔 Permiso de notificaciones:', permission);
        });
      }
    }
  }, [isAuthenticated]);

  // Polling: Consultar datos cada 10 segundos
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    console.log('🔄 Polling activado - consultando cada 10 segundos');

    // Función para refrescar datos
    const refreshData = () => {
      console.log('🔄 Refrescando datos...');
      
      // Recargar posts (con parámetros por defecto)
      dispatch(loadPosts({ 
        neighborhoodId: user.neighborhoodId, 
        limit: 50, 
        offset: 0 
      })).catch(err => {
        console.error('Error al recargar posts:', err);
      });

      // Recargar notificaciones
      dispatch(loadNotifications()).catch(err => {
        console.error('Error al recargar notificaciones:', err);
      });

      // Recargar mensajes
      dispatch(loadMessages()).catch(err => {
        console.error('Error al recargar mensajes:', err);
      });
    };

    // Ejecutar inmediatamente
    refreshData();

    // Configurar intervalo de 10 segundos
    const interval = setInterval(refreshData, 10000);

    // Cleanup: cancelar intervalo al desmontar
    return () => {
      console.log('🔄 Polling desactivado');
      clearInterval(interval);
    };
  }, [isAuthenticated, user, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔄 Polling Provider activado (alternativa a Real-time)');
    } else {
      console.log('🔄 Polling Provider desactivado (usuario no autenticado)');
    }
  }, [isAuthenticated]);

  return children;
};

export default RealtimeProvider;
