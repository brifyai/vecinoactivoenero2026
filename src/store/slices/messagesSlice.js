import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseMessagesService from '../../services/supabaseMessagesService';

// Async Thunks
export const loadConversations = createAsyncThunk(
  'messages/loadConversations',
  async (userId, { rejectWithValue }) => {
    try {
      const conversations = await supabaseMessagesService.getConversations(userId);
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
      const messages = await supabaseMessagesService.getMessages(conversationId, limit, offset);
      return { conversationId, messages };
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

      const newMessage = await supabaseMessagesService.sendMessage({
        conversationId,
        senderId,
        recipientId,
        content,
        type
      });

      return newMessage;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async ({ messageId, userId }, { rejectWithValue }) => {
    try {
      await supabaseMessagesService.markAsRead(messageId, userId);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markConversationAsRead = createAsyncThunk(
  'messages/markConversationAsRead',
  async ({ conversationId, userId }, { rejectWithValue }) => {
    try {
      // Mark all messages in conversation as read
      await supabaseMessagesService.markConversationAsRead(conversationId, userId);
      return conversationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async ({ messageId, userId }, { rejectWithValue }) => {
    try {
      await supabaseMessagesService.deleteMessage(messageId, userId);
      return messageId;
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
    loading: false,
    error: null,
    subscription: null
  },
  reducers: {
    clearMessagesError: (state) => {
      state.error = null;
    },
    addMessage: (state, action) => {
      // Para real-time: agregar nuevo mensaje
      const message = action.payload;
      const conversationId = message.conversation_id;
      
      if (!state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId] = [];
      }
      
      const exists = state.messagesByConversation[conversationId].find(m => m.id === message.id);
      if (!exists) {
        state.messagesByConversation[conversationId].push(message);
      }
    },
    addNewMessage: (state, action) => {
      // Para real-time updates
      const { conversationId, message } = action.payload;
      if (!state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId] = [];
      }
      state.messagesByConversation[conversationId].push(message);
    },
    updateMessage: (state, action) => {
      // Para real-time: actualizar mensaje existente
      const message = action.payload;
      const conversationId = message.conversation_id;
      
      if (state.messagesByConversation[conversationId]) {
        const index = state.messagesByConversation[conversationId].findIndex(m => m.id === message.id);
        if (index !== -1) {
          state.messagesByConversation[conversationId][index] = message;
        }
      }
    },
    setSubscription: (state, action) => {
      state.subscription = action.payload;
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

      // Load Messages
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
        const message = action.payload;
        const conversationId = message.conversation_id;
        
        if (!state.messagesByConversation[conversationId]) {
          state.messagesByConversation[conversationId] = [];
        }
        state.messagesByConversation[conversationId].push(message);
        
        // Update conversation last message
        const conv = state.conversations.find(c => c.id === conversationId);
        if (conv) {
          conv.last_message = message;
          conv.updated_at = message.created_at;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const messageId = action.payload;
        Object.values(state.messagesByConversation).forEach(messages => {
          const message = messages.find(m => m.id === messageId);
          if (message) {
            message.read = true;
          }
        });
      })

      // Mark Conversation as Read
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const conversationId = action.payload;
        const messages = state.messagesByConversation[conversationId];
        if (messages) {
          messages.forEach(m => {
            m.read = true;
          });
        }
      })

      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const messageId = action.payload;
        Object.keys(state.messagesByConversation).forEach(conversationId => {
          state.messagesByConversation[conversationId] = 
            state.messagesByConversation[conversationId].filter(m => m.id !== messageId);
        });
      });
  }
});

export const { clearMessagesError, addMessage, addNewMessage, updateMessage, setSubscription } = messagesSlice.actions;
export default messagesSlice.reducer;
