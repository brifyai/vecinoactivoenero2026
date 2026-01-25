import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import firebaseMessagesService from '../../services/firebaseMessagesService';

// Async Thunks - Usando Firebase para tiempo real
export const loadConversations = createAsyncThunk(
  'messages/loadConversations',
  async (userId, { rejectWithValue }) => {
    try {
      // Usar Firebase para conversaciones en tiempo real
      const conversations = await firebaseMessagesService.getConversations(userId);
      return conversations;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadMessages = createAsyncThunk(
  'messages/loadMessages',
  async ({ conversationId, limit = 50, offset = 0 }, { rejectWithValue }) => {
    try {
      // Firebase maneja esto con listeners en tiempo real
      // Este thunk es principalmente para compatibilidad
      return { conversationId, messages: [] };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, senderId, recipientId, content, type = 'text' }, { rejectWithValue }) => {
    try {
      if (!content.trim()) {
        throw new Error('El mensaje no puede estar vacío');
      }

      // Enviar mensaje a Firebase para tiempo real
      const messageData = {
        conversationId,
        senderId,
        recipientId,
        content,
        type,
        timestamp: new Date()
      };

      const message = await firebaseMessagesService.sendMessage(messageData);
      return message;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createConversation = createAsyncThunk(
  'messages/createConversation',
  async ({ participant1Id, participant2Id }, { rejectWithValue }) => {
    try {
      // Crear conversación en Firebase
      const conversation = await firebaseMessagesService.getOrCreateConversation(participant1Id, participant2Id);
      return conversation;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async ({ conversationId, userId }, { rejectWithValue }) => {
    try {
      // Marcar como leído en Firebase
      await firebaseMessagesService.markAsRead(conversationId, userId);
      return { conversationId, userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markConversationAsRead = createAsyncThunk(
  'messages/markConversationAsRead',
  async ({ conversationId, userId }, { rejectWithValue }) => {
    try {
      // Marcar conversación como leída en Firebase
      await firebaseMessagesService.markAsRead(conversationId, userId);
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async ({ messageId, conversationId }, { rejectWithValue }) => {
    try {
      // Eliminar mensaje de Firebase
      await firebaseMessagesService.deleteMessage(messageId);
      return { messageId, conversationId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTypingStatus = createAsyncThunk(
  'messages/updateTypingStatus',
  async ({ conversationId, userId, isTyping }, { rejectWithValue }) => {
    try {
      // Actualizar estado de typing en Firebase
      await firebaseMessagesService.updateTypingStatus(conversationId, userId, isTyping);
      return { conversationId, userId, isTyping };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    messagesByConversation: {},
    typingStatus: {},
    loading: false,
    error: null,
    subscriptions: {},
    unreadCount: 0
  },
  reducers: {
    clearMessagesError: (state) => {
      state.error = null;
    },
    
    // Acciones para tiempo real con Firebase
    setMessagesFromRealtime: (state, action) => {
      const { conversationId, messages } = action.payload;
      state.messagesByConversation[conversationId] = messages;
    },
    
    addMessageFromRealtime: (state, action) => {
      const message = action.payload;
      const conversationId = message.conversationId;
      
      if (!state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId] = [];
      }
      
      const exists = state.messagesByConversation[conversationId].find(m => m.id === message.id);
      if (!exists) {
        state.messagesByConversation[conversationId].push(message);
        
        // Actualizar conversación
        const conv = state.conversations.find(c => c.id === conversationId);
        if (conv) {
          conv.lastMessage = message.content;
          conv.lastMessageTime = message.timestamp;
        }
      }
    },
    
    updateMessageFromRealtime: (state, action) => {
      const message = action.payload;
      const conversationId = message.conversationId;
      
      if (state.messagesByConversation[conversationId]) {
        const index = state.messagesByConversation[conversationId].findIndex(m => m.id === message.id);
        if (index !== -1) {
          state.messagesByConversation[conversationId][index] = message;
        }
      }
    },
    
    removeMessageFromRealtime: (state, action) => {
      const { messageId, conversationId } = action.payload;
      if (state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId] = 
          state.messagesByConversation[conversationId].filter(m => m.id !== messageId);
      }
    },
    
    setConversationsFromRealtime: (state, action) => {
      state.conversations = action.payload;
    },
    
    addConversationFromRealtime: (state, action) => {
      const conversation = action.payload;
      const exists = state.conversations.find(c => c.id === conversation.id);
      if (!exists) {
        state.conversations.unshift(conversation);
      }
    },
    
    updateConversationFromRealtime: (state, action) => {
      const conversation = action.payload;
      const index = state.conversations.findIndex(c => c.id === conversation.id);
      if (index !== -1) {
        state.conversations[index] = { ...state.conversations[index], ...conversation };
      }
    },
    
    setTypingStatus: (state, action) => {
      const { conversationId, typingStatus } = action.payload;
      state.typingStatus[conversationId] = typingStatus;
    },
    
    setSubscription: (state, action) => {
      const { conversationId, subscription } = action.payload;
      state.subscriptions[conversationId] = subscription;
    },
    
    removeSubscription: (state, action) => {
      const conversationId = action.payload;
      delete state.subscriptions[conversationId];
    },
    
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load Conversations
      .addCase(loadConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(loadConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Load Messages (principalmente para compatibilidad)
      .addCase(loadMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { conversationId, messages } = action.payload;
        state.messagesByConversation[conversationId] = messages;
      })
      .addCase(loadMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        // El mensaje se agregará automáticamente via realtime listener
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Conversation
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        const conversation = action.payload;
        const exists = state.conversations.find(c => c.id === conversation.id);
        if (!exists) {
          state.conversations.unshift(conversation);
        }
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        // Los cambios se reflejarán via realtime listeners
      })

      // Mark Conversation as Read
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const conversationId = action.payload;
        // Los cambios se reflejarán via realtime listeners
      })

      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const { messageId, conversationId } = action.payload;
        // El mensaje se eliminará automáticamente via realtime listener
      })

      // Update Typing Status
      .addCase(updateTypingStatus.fulfilled, (state, action) => {
        // Los cambios se reflejarán via realtime listeners
      });
  }
});

export const { 
  clearMessagesError,
  setMessagesFromRealtime,
  addMessageFromRealtime,
  updateMessageFromRealtime,
  removeMessageFromRealtime,
  setConversationsFromRealtime,
  addConversationFromRealtime,
  updateConversationFromRealtime,
  setTypingStatus,
  setSubscription,
  removeSubscription,
  updateUnreadCount
} = messagesSlice.actions;

export default messagesSlice.reducer;