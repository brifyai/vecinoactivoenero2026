import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import realtimeService from '../services/supabaseRealtimeService';
import { addNotification, markAsRead, removeNotification } from '../store/slices/notificationsSlice';
import { selectUser } from '../store/selectors/authSelectors';

/**
 * Hook para subscribirse a notificaciones del usuario en tiempo real
 */
export const useRealtimeNotifications = (enabled = true) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (!enabled || !user) return;

    console.log('📡 Iniciando subscripción a notificaciones...');

    // Subscribirse solo a notificaciones del usuario actual
    const channelName = realtimeService.subscribe(
      'notifications',
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        switch (eventType) {
          case 'INSERT':
            if (newRecord.user_id === user.id) {
              console.log('📡 Nueva notificación:', newRecord);
              dispatch(addNotification(newRecord));
              
              // Mostrar notificación del navegador si está permitido
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Vecino Activo', {
                  body: newRecord.message || 'Tienes una nueva notificación',
                  icon: '/logo192.png'
                });
              }
            }
            break;
          case 'UPDATE':
            if (newRecord.user_id === user.id) {
              console.log('📡 Notificación actualizada:', newRecord);
              if (newRecord.read) {
                dispatch(markAsRead(newRecord.id));
              }
            }
            break;
          case 'DELETE':
            if (oldRecord.user_id === user.id) {
              console.log('📡 Notificación eliminada:', oldRecord);
              dispatch(removeNotification(oldRecord.id));
            }
            break;
          default:
            break;
        }
      },
      { filter: `user_id=eq.${user.id}` }
    );

    // Cleanup
    return () => {
      console.log('📡 Cancelando subscripción a notificaciones...');
      realtimeService.unsubscribe(channelName);
    };
  }, [enabled, user, dispatch]);
};
