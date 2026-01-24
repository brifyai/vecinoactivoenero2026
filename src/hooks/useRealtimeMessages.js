import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import realtimeService from '../services/supabaseRealtimeService';
import { addMessage, updateMessage as updateMessageAction } from '../store/slices/messagesSlice';
import { selectUser } from '../store/selectors/authSelectors';

/**
 * Hook para subscribirse a mensajes del usuario en tiempo real
 */
export const useRealtimeMessages = (enabled = true) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (!enabled || !user) return;

    console.log('📡 Iniciando subscripción a mensajes...');

    // Subscribirse a mensajes donde el usuario es sender o recipient
    const channelName = realtimeService.subscribe('messages', (payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      // Solo procesar si el usuario está involucrado
      const isInvolved = 
        newRecord?.sender_id === user.id || 
        newRecord?.recipient_id === user.id ||
        oldRecord?.sender_id === user.id ||
        oldRecord?.recipient_id === user.id;

      if (!isInvolved) return;

      switch (eventType) {
        case 'INSERT':
          console.log('📡 Nuevo mensaje:', newRecord);
          dispatch(addMessage(newRecord));
          
          // Notificación si el usuario es el receptor
          if (newRecord.recipient_id === user.id) {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Nuevo Mensaje', {
                body: newRecord.content || 'Tienes un nuevo mensaje',
                icon: '/logo192.png'
              });
            }
          }
          break;
        case 'UPDATE':
          console.log('📡 Mensaje actualizado:', newRecord);
          dispatch(updateMessageAction(newRecord));
          break;
        default:
          break;
      }
    });

    // Cleanup
    return () => {
      console.log('📡 Cancelando subscripción a mensajes...');
      realtimeService.unsubscribe(channelName);
    };
  }, [enabled, user, dispatch]);
};
