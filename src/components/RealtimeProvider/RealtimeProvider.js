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

  // POLLING TEMPORALMENTE DESHABILITADO - CAUSABA COLAPSO DEL NAVEGADOR
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    console.log('⚠️ Polling deshabilitado temporalmente para evitar colapso del navegador');

    // Cargar datos solo UNA VEZ al iniciar sesión
    const loadInitialData = () => {
      console.log('🔄 Cargando datos iniciales...');
      
      // Recargar posts (con parámetros por defecto)
      dispatch(loadPosts({ 
        neighborhoodId: user.neighborhoodId, 
        limit: 50, 
        offset: 0 
      })).catch(err => {
        console.error('Error al cargar posts:', err);
      });

      // Recargar notificaciones
      dispatch(loadNotifications()).catch(err => {
        console.error('Error al cargar notificaciones:', err);
      });

      // Recargar mensajes
      dispatch(loadMessages()).catch(err => {
        console.error('Error al cargar mensajes:', err);
      });
    };

    // Ejecutar solo una vez
    loadInitialData();

    // NO configurar intervalo para evitar colapso
    // const interval = setInterval(refreshData, 10000);

    return () => {
      console.log('🔄 Cleanup realizado');
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
