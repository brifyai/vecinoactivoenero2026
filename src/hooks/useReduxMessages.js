import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadMessages,
  sendMessage as sendMessageAction,
  markAsRead as markAsReadAction,
  markConversationAsRead as markConversationAsReadAction,
  deleteMessage as deleteMessageAction,
  clearMessagesError
} from '../store/slices/messagesSlice';
import {
  selectMessages,
  selectConversations,
  selectMessagesLoading,
  selectMessagesError,
  selectConversationMessages,
  selectUnreadCount
} from '../store/selectors/messagesSelectors';

/**
 * Hook de compatibilidad para migración de MessagesContext a Redux
 * Mantiene la misma API que el context original
 */
export const useReduxMessages = () => {
  const dispatch = useDispatch();
  
  const messages = useSelector(selectMessages);
  const conversations = useSelector(selectConversations);
  const loading = useSelector(selectMessagesLoading);
  const error = useSelector(selectMessagesError);

  // Cargar mensajes al montar
  useEffect(() => {
    dispatch(loadMessages());
  }, [dispatch]);

  // Enviar mensaje
  const sendMessage = useCallback(async (senderId, recipientId, content) => {
    try {
      const result = await dispatch(sendMessageAction({ 
        senderId, 
        recipientId, 
        content 
      })).unwrap();
      
      return { success: true, message: result };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  // Obtener conversación entre dos usuarios
  const getConversation = useCallback((userId1, userId2) => {
    return selectConversationMessages({ messages: { messages } }, userId1, userId2);
  }, [messages]);

  // Marcar mensaje como leído
  const markAsRead = useCallback(async (messageId) => {
    try {
      await dispatch(markAsReadAction(messageId)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  // Marcar conversación completa como leída
  const markConversationAsRead = useCallback(async (userId1, userId2) => {
    try {
      await dispatch(markConversationAsReadAction({ userId1, userId2 })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  // Obtener cantidad de mensajes no leídos
  const getUnreadCount = useCallback((userId) => {
    return selectUnreadCount({ messages: { messages } }, userId);
  }, [messages]);

  // Eliminar mensaje
  const deleteMessage = useCallback(async (messageId) => {
    try {
      await dispatch(deleteMessageAction(messageId)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);

  // Limpiar error
  const clearError = useCallback(() => {
    dispatch(clearMessagesError());
  }, [dispatch]);

  return {
    messages,
    conversations,
    loading,
    error,
    sendMessage,
    getConversation,
    markAsRead,
    markConversationAsRead,
    getUnreadCount,
    deleteMessage,
    clearError
  };
};

export default useReduxMessages;
