import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firebaseMessagesService from '../services/firebaseMessagesService';
import {
  setMessagesFromRealtime,
  addMessageFromRealtime,
  updateMessageFromRealtime,
  removeMessageFromRealtime,
  setConversationsFromRealtime,
  addConversationFromRealtime,
  updateConversationFromRealtime,
  setTypingStatus,
  updateUnreadCount
} from '../store/slices/messagesSlice';

export const useFirebaseMessages = (userId) => {
  const dispatch = useDispatch();
  const { conversations, messagesByConversation, typingStatus } = useSelector(state => state.messages);
  
  // Usar useRef para guardar las funciones de unsubscribe (no serializables)
  const subscriptionsRef = useRef({});

  // Suscribirse a conversaciones del usuario
  const subscribeToConversations = useCallback(() => {
    if (!userId) return;

    console.log('Suscribiéndose a conversaciones para usuario:', userId);
    
    const unsubscribe = firebaseMessagesService.subscribeToConversations(userId, (conversations) => {
      console.log('Conversaciones actualizadas:', conversations.length);
      dispatch(setConversationsFromRealtime(conversations));
      
      // Calcular conteo de mensajes no leídos
      let totalUnread = 0;
      conversations.forEach(conv => {
        const userDetails = conv.participantDetails?.[userId];
        totalUnread += userDetails?.unreadCount || 0;
      });
      dispatch(updateUnreadCount(totalUnread));
    });

    return unsubscribe;
  }, [userId, dispatch]);

  // Suscribirse a mensajes de una conversación específica
  const subscribeToMessages = useCallback((conversationId) => {
    if (!conversationId) return;

    console.log('Suscribiéndose a mensajes para conversación:', conversationId);
    
    const unsubscribe = firebaseMessagesService.subscribeToMessages(conversationId, (messages) => {
      console.log(`Mensajes actualizados para conversación ${conversationId}:`, messages.length);
      dispatch(setMessagesFromRealtime({ conversationId, messages }));
    });

    // Guardar suscripción en ref en lugar de Redux
    subscriptionsRef.current[conversationId] = unsubscribe;

    return unsubscribe;
  }, [dispatch]);

  // Suscribirse al estado de typing
  const subscribeToTypingStatus = useCallback((conversationId) => {
    if (!conversationId) return;

    console.log('Suscribiéndose al estado de typing para conversación:', conversationId);
    
    const unsubscribe = firebaseMessagesService.subscribeToTypingStatus(conversationId, (typingStatus) => {
      console.log(`Estado de typing actualizado para conversación ${conversationId}:`, typingStatus);
      dispatch(setTypingStatus({ conversationId, typingStatus }));
    });

    return unsubscribe;
  }, [dispatch]);

  // Cancelar suscripción a mensajes
  const unsubscribeFromMessages = useCallback((conversationId) => {
    const subscription = subscriptionsRef.current[conversationId];
    if (subscription) {
      subscription();
      delete subscriptionsRef.current[conversationId];
      console.log('Suscripción cancelada para conversación:', conversationId);
    }
  }, []);

  // Enviar mensaje
  const sendMessage = useCallback(async (conversationId, senderId, recipientId, content, type = 'text') => {
    try {
      const messageData = {
        conversationId,
        senderId,
        recipientId,
        content,
        type,
        timestamp: new Date()
      };

      await firebaseMessagesService.sendMessage(messageData);
      console.log('Mensaje enviado exitosamente');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  }, []);

  // Marcar mensajes como leídos
  const markAsRead = useCallback(async (conversationId, userId) => {
    try {
      await firebaseMessagesService.markAsRead(conversationId, userId);
      console.log('Mensajes marcados como leídos');
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
      throw error;
    }
  }, []);

  // Actualizar estado de typing
  const updateTypingStatus = useCallback(async (conversationId, userId, isTyping) => {
    try {
      await firebaseMessagesService.updateTypingStatus(conversationId, userId, isTyping);
    } catch (error) {
      console.error('Error actualizando estado de typing:', error);
    }
  }, []);

  // Crear o obtener conversación
  const getOrCreateConversation = useCallback(async (participant1Id, participant2Id) => {
    try {
      const conversation = await firebaseMessagesService.getOrCreateConversation(participant1Id, participant2Id);
      console.log('Conversación obtenida/creada:', conversation.id);
      return conversation;
    } catch (error) {
      console.error('Error creando/obteniendo conversación:', error);
      throw error;
    }
  }, []);

  // Obtener usuarios que están escribiendo
  const getTypingUsers = useCallback((conversationId, currentUserId) => {
    const typing = typingStatus[conversationId] || {};
    const typingUsers = [];
    
    Object.entries(typing).forEach(([userId, timestamp]) => {
      if (userId !== currentUserId && timestamp) {
        // Considerar que está escribiendo si el timestamp es reciente (menos de 3 segundos)
        const now = new Date();
        const typingTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const timeDiff = now - typingTime;
        
        if (timeDiff < 3000) { // 3 segundos
          typingUsers.push(userId);
        }
      }
    });
    
    return typingUsers;
  }, [typingStatus]);

  // Limpiar todas las suscripciones
  const cleanup = useCallback(() => {
    Object.keys(subscriptionsRef.current).forEach(conversationId => {
      unsubscribeFromMessages(conversationId);
    });
  }, [unsubscribeFromMessages]);

  // Efecto para limpiar suscripciones al desmontar
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // Estado
    conversations,
    messagesByConversation,
    typingStatus,
    
    // Funciones
    subscribeToConversations,
    subscribeToMessages,
    subscribeToTypingStatus,
    unsubscribeFromMessages,
    sendMessage,
    markAsRead,
    updateTypingStatus,
    getOrCreateConversation,
    getTypingUsers,
    cleanup
  };
};

export default useFirebaseMessages;