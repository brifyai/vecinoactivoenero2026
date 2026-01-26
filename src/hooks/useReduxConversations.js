import { useSelector, useDispatch } from 'react-redux';
import {
  loadConversations,
  loadActiveConversation,
  createConversation,
  sendMessage,
  markAsRead,
  deleteMessage,
  setActiveConversation,
  clearActiveConversation,
  clearError
} from '../store/slices/conversationsSlice';
import {
  selectAllConversations,
  selectActiveConversation,
  selectConversationsLoading,
  selectConversationsError,
  selectConversationMessages,
  selectUnreadCount
} from '../store/selectors/conversationsSelectors';
import { selectUser } from '../store/selectors/authSelectors';

export const useReduxConversations = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const conversations = useSelector(selectAllConversations);
  const activeConversation = useSelector(selectActiveConversation);
  const loading = useSelector(selectConversationsLoading);
  const error = useSelector(selectConversationsError);

  const loadUserConversations = () => {
    if (user) {
      dispatch(loadConversations(user.id));
    }
  };

  const loadUserActiveConversation = () => {
    if (user) {
      dispatch(loadActiveConversation(user.id));
    }
  };

  const createNewConversation = async (participantId) => {
    if (!user) return null;
    
    try {
      const result = await dispatch(createConversation({ 
        userId: user.id, 
        participantId 
      })).unwrap();
      return result;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const sendNewMessage = async (conversationId, text, type = 'text') => {
    if (!user) return null;

    try {
      const result = await dispatch(sendMessage({
        conversationId,
        userId: user.id,
        text,
        type
      })).unwrap();
      return result.message;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  };

  const markConversationAsRead = (conversationId) => {
    if (user) {
      dispatch(markAsRead({ conversationId, userId: user.id }));
    }
  };

  const deleteMessageFromConversation = (conversationId, messageId) => {
    dispatch(deleteMessage({ conversationId, messageId }));
  };

  const setCurrentActiveConversation = (conversation) => {
    dispatch(setActiveConversation(conversation));
  };

  const clearCurrentActiveConversation = () => {
    dispatch(clearActiveConversation({ userId: user?.id }));
  };

  const clearConversationsError = () => {
    dispatch(clearError());
  };

  // Helper functions from ChatContext
  const getMessages = (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId);
    return conversation?.messages || [];
  };

  const getUnreadCount = () => {
    if (!user) return 0;
    return conversations.reduce((total, conv) => {
      const unread = conv.messages.filter(msg => 
        msg.senderId !== user.id && !msg.read
      ).length;
      return total + unread;
    }, 0);
  };

  return {
    conversations,
    activeConversation,
    loading,
    error,
    loadConversations: loadUserConversations,
    loadActiveConversation: loadUserActiveConversation,
    createConversation: createNewConversation,
    sendMessage: sendNewMessage,
    markAsRead: markConversationAsRead,
    deleteMessage: deleteMessageFromConversation,
    setActiveConversation: setCurrentActiveConversation,
    clearActiveConversation: clearCurrentActiveConversation,
    clearError: clearConversationsError,
    // Helper functions
    getMessages,
    getUnreadCount
  };
};