// ============================================
// HOOK UNIFICADO PARA REALTIME
// Consolida todos los hooks de realtime en uno solo
// ============================================

import { useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../store/selectors/authSelectors';
import { useHybridRealtime } from './useHybridRealtime';

// Redux actions
import { 
  addPost, 
  updatePost as updatePostAction, 
  removePost 
} from '../store/slices/postsSlice';

import { 
  addMessage, 
  updateMessage as updateMessageAction 
} from '../store/slices/messagesSlice';

import { 
  addNotification, 
  markAsRead, 
  removeNotification 
} from '../store/slices/notificationsSlice';

/**
 * Hook unificado para manejar todas las subscripciones realtime
 * Reemplaza: useRealtimePosts, useRealtimeMessages, useRealtimeNotifications
 */
export const useUnifiedRealtime = (options = {}) => {
  const {
    enablePosts = true,
    enableMessages = true,
    enableNotifications = true,
    conversationId = null
  } = options;

  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { isConnected, connectionStatus, subscribe, unsubscribe } = useHybridRealtime();
  
  const [subscriptions, setSubscriptions] = useState({
    posts: null,
    messages: null,
    notifications: null
  });

  // Handler para posts
  const handlePostEvent = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        if (newRecord) {
          console.log('🆕 Nuevo post recibido:', newRecord.id);
          dispatch(addPost(newRecord));
        }
        break;
      case 'UPDATE':
        if (newRecord) {
          console.log('📝 Post actualizado:', newRecord.id);
          dispatch(updatePostAction(newRecord));
        }
        break;
      case 'DELETE':
        if (oldRecord) {
          console.log('🗑️ Post eliminado:', oldRecord.id);
          dispatch(removePost(oldRecord.id));
        }
        break;
      default:
        console.log('🔄 Evento de post no manejado:', eventType);
    }
  }, [dispatch]);

  // Handler para mensajes
  const handleMessageEvent = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Solo procesar mensajes del usuario actual
    if (!user || (newRecord && newRecord.sender_id !== user.id && newRecord.recipient_id !== user.id)) {
      return;
    }
    
    switch (eventType) {
      case 'INSERT':
        if (newRecord) {
          console.log('💬 Nuevo mensaje recibido:', newRecord.id);
          dispatch(addMessage(newRecord));
        }
        break;
      case 'UPDATE':
        if (newRecord) {
          console.log('📝 Mensaje actualizado:', newRecord.id);
          dispatch(updateMessageAction(newRecord));
        }
        break;
      default:
        console.log('🔄 Evento de mensaje no manejado:', eventType);
    }
  }, [dispatch, user]);

  // Handler para notificaciones
  const handleNotificationEvent = useCallback((payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Solo procesar notificaciones del usuario actual
    if (!user || (newRecord && newRecord.user_id !== user.id)) {
      return;
    }
    
    switch (eventType) {
      case 'INSERT':
        if (newRecord) {
          console.log('🔔 Nueva notificación recibida:', newRecord.id);
          dispatch(addNotification(newRecord));
        }
        break;
      case 'UPDATE':
        if (newRecord && newRecord.read) {
          console.log('✅ Notificación marcada como leída:', newRecord.id);
          dispatch(markAsRead(newRecord.id));
        }
        break;
      case 'DELETE':
        if (oldRecord) {
          console.log('🗑️ Notificación eliminada:', oldRecord.id);
          dispatch(removeNotification(oldRecord.id));
        }
        break;
      default:
        console.log('🔄 Evento de notificación no manejado:', eventType);
    }
  }, [dispatch, user]);

  // Efecto para manejar subscripciones
  useEffect(() => {
    if (!isConnected || !user) {
      return;
    }

    console.log('🔄 Configurando subscripciones realtime unificadas...');

    // Subscribir a posts
    if (enablePosts && !subscriptions.posts) {
      const postsChannel = subscribe('posts', handlePostEvent);
      setSubscriptions(prev => ({ ...prev, posts: postsChannel }));
      console.log('✅ Subscrito a posts');
    }

    // Subscribir a mensajes
    if (enableMessages && !subscriptions.messages) {
      const messagesChannel = subscribe('messages', handleMessageEvent, {
        filter: conversationId ? { conversation_id: conversationId } : null
      });
      setSubscriptions(prev => ({ ...prev, messages: messagesChannel }));
      console.log('✅ Subscrito a mensajes');
    }

    // Subscribir a notificaciones
    if (enableNotifications && !subscriptions.notifications) {
      const notificationsChannel = subscribe('notifications', handleNotificationEvent, {
        filter: { user_id: user.id }
      });
      setSubscriptions(prev => ({ ...prev, notifications: notificationsChannel }));
      console.log('✅ Subscrito a notificaciones');
    }

    // Cleanup function
    return () => {
      console.log('🧹 Limpiando subscripciones realtime...');
      
      if (subscriptions.posts) {
        unsubscribe(subscriptions.posts);
      }
      if (subscriptions.messages) {
        unsubscribe(subscriptions.messages);
      }
      if (subscriptions.notifications) {
        unsubscribe(subscriptions.notifications);
      }
      
      setSubscriptions({ posts: null, messages: null, notifications: null });
    };
  }, [
    isConnected, 
    user, 
    enablePosts, 
    enableMessages, 
    enableNotifications, 
    conversationId,
    subscribe,
    unsubscribe,
    handlePostEvent,
    handleMessageEvent,
    handleNotificationEvent
  ]);

  return {
    isConnected,
    connectionStatus,
    subscriptions: {
      posts: !!subscriptions.posts,
      messages: !!subscriptions.messages,
      notifications: !!subscriptions.notifications
    }
  };
};

// Hooks específicos para compatibilidad hacia atrás
export const useRealtimePosts = (enabled = true) => {
  return useUnifiedRealtime({
    enablePosts: enabled,
    enableMessages: false,
    enableNotifications: false
  });
};

export const useRealtimeMessages = (enabled = true, conversationId = null) => {
  return useUnifiedRealtime({
    enablePosts: false,
    enableMessages: enabled,
    enableNotifications: false,
    conversationId
  });
};

export const useRealtimeNotifications = (enabled = true) => {
  return useUnifiedRealtime({
    enablePosts: false,
    enableMessages: false,
    enableNotifications: enabled
  });
};

export default useUnifiedRealtime;