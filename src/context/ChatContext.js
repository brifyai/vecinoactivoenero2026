import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  // Cargar conversaciones y conversación activa al iniciar
  useEffect(() => {
    if (user) {
      loadConversations();
      loadActiveConversation();
    }
  }, [user]);

  // Guardar conversación activa cuando cambia
  useEffect(() => {
    if (user && activeConversation) {
      localStorage.setItem(`activeConversation_${user.id}`, JSON.stringify(activeConversation));
    }
  }, [activeConversation, user]);

  const loadConversations = () => {
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const userConversations = allConversations.filter(conv => 
      conv.participants.includes(user.id)
    );
    setConversations(userConversations);
  };

  const loadActiveConversation = () => {
    const savedActive = localStorage.getItem(`activeConversation_${user.id}`);
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        // Verificar que la conversación aún existe
        const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const exists = allConversations.find(c => c.id === parsed.id);
        if (exists) {
          setActiveConversation(exists);
        }
      } catch (error) {
        console.error('Error loading active conversation:', error);
      }
    }
  };

  const createConversation = (participantId) => {
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    
    // Verificar si ya existe conversación
    const existing = allConversations.find(conv => 
      conv.participants.includes(user.id) && conv.participants.includes(participantId)
    );

    if (existing) {
      return existing;
    }

    const newConversation = {
      id: Date.now(),
      participants: [user.id, participantId],
      messages: [],
      createdAt: new Date().toISOString(),
      lastMessage: null,
      lastMessageTime: null
    };

    allConversations.push(newConversation);
    localStorage.setItem('conversations', JSON.stringify(allConversations));
    loadConversations();
    return newConversation;
  };

  const sendMessage = (conversationId, text, type = 'text') => {
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const convIndex = allConversations.findIndex(c => c.id === conversationId);

    if (convIndex === -1) return;

    const newMessage = {
      id: Date.now(),
      senderId: user.id,
      text,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };

    allConversations[convIndex].messages.push(newMessage);
    allConversations[convIndex].lastMessage = text;
    allConversations[convIndex].lastMessageTime = newMessage.timestamp;

    localStorage.setItem('conversations', JSON.stringify(allConversations));
    loadConversations();

    // Actualizar conversación activa y persistirla
    if (activeConversation?.id === conversationId) {
      const updatedConv = allConversations[convIndex];
      setActiveConversation(updatedConv);
      localStorage.setItem(`activeConversation_${user.id}`, JSON.stringify(updatedConv));
    }

    return newMessage;
  };

  const getMessages = (conversationId) => {
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const conversation = allConversations.find(c => c.id === conversationId);
    return conversation?.messages || [];
  };

  const markAsRead = (conversationId) => {
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const convIndex = allConversations.findIndex(c => c.id === conversationId);

    if (convIndex === -1) return;

    allConversations[convIndex].messages = allConversations[convIndex].messages.map(msg => {
      if (msg.senderId !== user.id) {
        return { ...msg, read: true };
      }
      return msg;
    });

    localStorage.setItem('conversations', JSON.stringify(allConversations));
    loadConversations();
  };

  const deleteMessage = (conversationId, messageId) => {
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const convIndex = allConversations.findIndex(c => c.id === conversationId);

    if (convIndex === -1) return;

    allConversations[convIndex].messages = allConversations[convIndex].messages.filter(
      msg => msg.id !== messageId
    );

    localStorage.setItem('conversations', JSON.stringify(allConversations));
    loadConversations();
  };

  const getUnreadCount = () => {
    return conversations.reduce((total, conv) => {
      const unread = conv.messages.filter(msg => 
        msg.senderId !== user.id && !msg.read
      ).length;
      return total + unread;
    }, 0);
  };

  const clearActiveConversation = () => {
    setActiveConversation(null);
    if (user) {
      localStorage.removeItem(`activeConversation_${user.id}`);
    }
  };

  const value = {
    conversations,
    activeConversation,
    setActiveConversation,
    createConversation,
    sendMessage,
    getMessages,
    markAsRead,
    deleteMessage,
    getUnreadCount,
    loadConversations,
    clearActiveConversation
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
