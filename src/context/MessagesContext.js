import { createContext, useContext, useState, useEffect } from 'react';
import storageService from '../services/storageService';

const MessagesContext = createContext();

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};

export const MessagesProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedMessages = storageService.getMessages();
    setMessages(savedMessages);
    generateConversations(savedMessages);
    setLoading(false);
  }, []);

  const generateConversations = (msgs) => {
    const convMap = {};

    msgs.forEach(msg => {
      const key = [msg.senderId, msg.recipientId].sort().join('-');
      if (!convMap[key]) {
        convMap[key] = {
          id: key,
          user1Id: Math.min(msg.senderId, msg.recipientId),
          user2Id: Math.max(msg.senderId, msg.recipientId),
          lastMessage: msg,
          unreadCount: 0,
          createdAt: msg.timestamp
        };
      }
      convMap[key].lastMessage = msg;
    });

    setConversations(Object.values(convMap));
  };

  const sendMessage = (senderId, recipientId, content) => {
    if (!content.trim()) {
      return { success: false, error: 'El mensaje no puede estar vacío' };
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      recipientId,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };

    const updated = [...messages, newMessage];
    storageService.saveMessages(updated);
    setMessages(updated);
    generateConversations(updated);

    // Crear notificación
    storageService.addNotification(recipientId, {
      id: `notif-${Date.now()}`,
      type: 'new_message',
      fromUserId: senderId,
      message: 'Te envió un mensaje',
      read: false,
      createdAt: new Date().toISOString()
    });

    return { success: true, message: newMessage };
  };

  const getConversation = (userId1, userId2) => {
    const key = [userId1, userId2].sort().join('-');
    return messages.filter(m =>
      (m.senderId === userId1 && m.recipientId === userId2) ||
      (m.senderId === userId2 && m.recipientId === userId1)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const markAsRead = (messageId) => {
    const updated = messages.map(m =>
      m.id === messageId ? { ...m, read: true } : m
    );
    storageService.saveMessages(updated);
    setMessages(updated);
    generateConversations(updated);
  };

  const markConversationAsRead = (userId1, userId2) => {
    const updated = messages.map(m => {
      if ((m.senderId === userId1 && m.recipientId === userId2) ||
          (m.senderId === userId2 && m.recipientId === userId1)) {
        return { ...m, read: true };
      }
      return m;
    });
    storageService.saveMessages(updated);
    setMessages(updated);
    generateConversations(updated);
  };

  const getUnreadCount = (userId) => {
    return messages.filter(m => m.recipientId === userId && !m.read).length;
  };

  const deleteMessage = (messageId) => {
    const updated = messages.filter(m => m.id !== messageId);
    storageService.saveMessages(updated);
    setMessages(updated);
    generateConversations(updated);
  };

  const value = {
    messages,
    conversations,
    loading,
    sendMessage,
    getConversation,
    markAsRead,
    markConversationAsRead,
    getUnreadCount,
    deleteMessage
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};
