// =====================================================
// HOOK REDUX MESSAGES CON HÍBRIDO
// Hook para manejo de mensajes con sincronización híbrida
// =====================================================

import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback } from 'react';
import {
  loadConversations,
  loadMessages,
  sendMessage,
  markAsRead,
  clearMessagesError
} from '../store/slices/messagesSlice';
import {
  selectConversations,
  selectMessages,
  selectMessagesLoading,
  selectMessagesError,
  selectUnreadCount,
  selectUserConversations
} from '../store/selectors/messagesSelectors';

/**
 * Hook Redux para mensajes con sincronización híbrida
 */
export const useReduxMessages = (userId) => {
  const dispatch = useDispatch();
  
  const conversations = useSelector(state => selectUserConversations(state, userId));
  const messages = useSelector(selectMessages);
  const loading = useSelector(selectMessagesLoading);
  const error = useSelector(selectMessagesError);
  const unreadCount = useSelector(state => selectUnreadCount(state, userId));

  // Cargar conversaciones iniciales
  useEffect(() => {
    if (userId && conversations.length === 0 && !loading) {
      dispatch(loadConversations(userId));
    }
  }, [dispatch, userId, conversations.length, loading]);

  // Funciones de manejo de mensajes
  const handleSendMessage = useCallback(async (messageData) => {
    try {
      const result = await dispatch(sendMessage({
        ...messageData,
        senderId: userId
      }));
      
      if (sendMessage.fulfilled.match(result)) {
        return { success: true, message: result.payload };
      } else {
        return { success: false, error: result.error.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch, userId]);

  const handleLoadMessages = useCallback(async (conversationId, options = {}) => {
    try {
      const result = await dispatch(loadMessages({
        conversationId,
        ...options
      }));
      
      if (loadMessages.fulfilled.match(result)) {
        return { success: true, messages: result.payload.messages };
      } else {
        return { success: false, error: result.error.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const handleMarkAsRead = useCallback(async (messageId) => {
    try {
      const result = await dispatch(markAsRead({ messageId, userId }));
      
      if (markAsRead.fulfilled.match(result)) {
        return { success: true };
      } else {
        return { success: false, error: result.error.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch, userId]);

  const handleClearError = useCallback(() => {
    dispatch(clearMessagesError());
  }, [dispatch]);

  const refreshConversations = useCallback(() => {
    if (userId) {
      dispatch(loadConversations(userId));
    }
  }, [dispatch, userId]);

  // Obtener mensajes de una conversación específica
  const getConversationMessages = useCallback((conversationId) => {
    return messages.filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [messages]);

  // Obtener conversación por ID
  const getConversation = useCallback((conversationId) => {
    return conversations.find(c => c.id === conversationId);
  }, [conversations]);

  // Obtener conversación con otro usuario
  const getConversationWithUser = useCallback((otherUserId) => {
    return conversations.find(c => 
      (c.user1Id === userId && c.user2Id === otherUserId) ||
      (c.user1Id === otherUserId && c.user2Id === userId)
    );
  }, [conversations, userId]);

  return {
    // Datos principales
    conversations,
    messages,
    loading,
    error,
    unreadCount,
    
    // Funciones de manejo
    sendMessage: handleSendMessage,
    loadMessages: handleLoadMessages,
    markAsRead: handleMarkAsRead,
    clearError: handleClearError,
    refreshConversations,
    
    // Funciones de utilidad
    getConversationMessages,
    getConversation,
    getConversationWithUser
  };
};

export default useReduxMessages;