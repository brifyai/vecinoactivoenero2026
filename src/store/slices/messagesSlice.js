import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../../services/storageService';

// Async Thunks
export const loadMessages = createAsyncThunk(
  'messages/loadMessages',
  async (_, { rejectWithValue }) => {
    try {
      const messages = storageService.getMessages();
      return messages;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ senderId, recipientId, content }, { rejectWithValue, dispatch }) => {
    try {
      if (!content.trim()) {
        throw new Error('El mensaje no puede estar vacío');
      }

      const newMessage = {
        id: `msg-${Date.now()}`,
        senderId,
        recipientId,
        content,
        timestamp: new Date().toISOString(),
        read: false
      };

      const currentMessages = storageService.getMessages();
      const updated = [...currentMessages, newMessage];
      storageService.saveMessages(updated);

      // Crear notificación
      storageService.addNotification(recipientId, {
        id: `notif-${Date.now()}`,
        type: 'new_message',
        fromUserId: senderId,
        message: 'Te envió un mensaje',
        read: false,
        createdAt: new Date().toISOString()
      });

      return newMessage;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageId, { getState, rejectWithValue }) => {
    try {
      const { messages } = getState().messages;
      const updated = messages.map(m =>
        m.id === messageId ? { ...m, read: true } : m
      );
      storageService.saveMessages(updated);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markConversationAsRead = createAsyncThunk(
  'messages/markConversationAsRead',
  async ({ userId1, userId2 }, { getState, rejectWithValue }) => {
    try {
      const { messages } = getState().messages;
      const updated = messages.map(m => {
        if ((m.senderId === userId1 && m.recipientId === userId2) ||
            (m.senderId === userId2 && m.recipientId === userId1)) {
          return { ...m, read: true };
        }
        return m;
      });
      storageService.saveMessages(updated);
      return { userId1, userId2 };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId, { getState, rejectWithValue }) => {
    try {
      const { messages } = getState().messages;
      const updated = messages.filter(m => m.id !== messageId);
      storageService.saveMessages(updated);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to generate conversations
const generateConversations = (messages) => {
  const convMap = {};

  messages.forEach(msg => {
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

  return Object.values(convMap);
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    messages: [],
    conversations: [],
    loading: false,
    error: null
  },
  reducers: {
    clearMessagesError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load Messages
      .addCase(loadMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
        state.conversations = generateConversations(action.payload);
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
        state.messages.push(action.payload);
        state.conversations = generateConversations(state.messages);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const message = state.messages.find(m => m.id === action.payload);
        if (message) {
          message.read = true;
        }
        state.conversations = generateConversations(state.messages);
      })

      // Mark Conversation as Read
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const { userId1, userId2 } = action.payload;
        state.messages.forEach(m => {
          if ((m.senderId === userId1 && m.recipientId === userId2) ||
              (m.senderId === userId2 && m.recipientId === userId1)) {
            m.read = true;
          }
        });
        state.conversations = generateConversations(state.messages);
      })

      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.messages = state.messages.filter(m => m.id !== action.payload);
        state.conversations = generateConversations(state.messages);
      });
  }
});

export const { clearMessagesError } = messagesSlice.actions;
export default messagesSlice.reducer;
