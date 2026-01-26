import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const loadConversations = createAsyncThunk(
  'conversations/load',
  async (userId) => {
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const userConversations = allConversations.filter(conv => 
      conv.participants.includes(userId)
    );
    return userConversations;
  }
);

export const loadActiveConversation = createAsyncThunk(
  'conversations/loadActive',
  async (userId) => {
    const savedActive = localStorage.getItem(`activeConversation_${userId}`);
    if (savedActive) {
      try {
        const parsed = JSON.parse(savedActive);
        // Verificar que la conversación aún existe
        const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const exists = allConversations.find(c => c.id === parsed.id);
        return exists || null;
      } catch (error) {
        console.error('Error loading active conversation:', error);
        return null;
      }
    }
    return null;
  }
);

export const createConversation = createAsyncThunk(
  'conversations/create',
  async ({ userId, participantId }) => {
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    
    // Verificar si ya existe conversación
    const existing = allConversations.find(conv => 
      conv.participants.includes(userId) && conv.participants.includes(participantId)
    );

    if (existing) {
      return existing;
    }

    const newConversation = {
      id: Date.now(),
      participants: [userId, participantId],
      messages: [],
      createdAt: new Date().toISOString(),
      lastMessage: null,
      lastMessageTime: null
    };

    allConversations.push(newConversation);
    localStorage.setItem('conversations', JSON.stringify(allConversations));
    return newConversation;
  }
);

export const sendMessage = createAsyncThunk(
  'conversations/sendMessage',
  async ({ conversationId, userId, text, type = 'text' }) => {
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const convIndex = allConversations.findIndex(c => c.id === conversationId);

    if (convIndex === -1) throw new Error('Conversación no encontrada');

    const newMessage = {
      id: Date.now(),
      senderId: userId,
      text,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };

    allConversations[convIndex].messages.push(newMessage);
    allConversations[convIndex].lastMessage = text;
    allConversations[convIndex].lastMessageTime = newMessage.timestamp;

    localStorage.setItem('conversations', JSON.stringify(allConversations));
    
    return {
      conversationId,
      message: newMessage,
      updatedConversation: allConversations[convIndex]
    };
  }
);

export const markAsRead = createAsyncThunk(
  'conversations/markAsRead',
  async ({ conversationId, userId }) => {
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const convIndex = allConversations.findIndex(c => c.id === conversationId);

    if (convIndex === -1) return { conversationId };

    allConversations[convIndex].messages = allConversations[convIndex].messages.map(msg => {
      if (msg.senderId !== userId) {
        return { ...msg, read: true };
      }
      return msg;
    });

    localStorage.setItem('conversations', JSON.stringify(allConversations));
    return { conversationId, updatedConversation: allConversations[convIndex] };
  }
);

export const deleteMessage = createAsyncThunk(
  'conversations/deleteMessage',
  async ({ conversationId, messageId }) => {
    const allConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    const convIndex = allConversations.findIndex(c => c.id === conversationId);

    if (convIndex === -1) return { conversationId, messageId };

    allConversations[convIndex].messages = allConversations[convIndex].messages.filter(
      msg => msg.id !== messageId
    );

    localStorage.setItem('conversations', JSON.stringify(allConversations));
    return { conversationId, messageId, updatedConversation: allConversations[convIndex] };
  }
);

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState: {
    conversations: [],
    activeConversation: null,
    loading: false,
    error: null
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      // Persistir conversación activa
      if (action.payload && action.payload.userId) {
        localStorage.setItem(
          `activeConversation_${action.payload.userId}`, 
          JSON.stringify(action.payload)
        );
      }
    },
    clearActiveConversation: (state, action) => {
      state.activeConversation = null;
      if (action.payload?.userId) {
        localStorage.removeItem(`activeConversation_${action.payload.userId}`);
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load conversations
      .addCase(loadConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.loading = false;
      })
      .addCase(loadConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Load active conversation
      .addCase(loadActiveConversation.fulfilled, (state, action) => {
        state.activeConversation = action.payload;
      })
      // Create conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        const existing = state.conversations.find(c => c.id === action.payload.id);
        if (!existing) {
          state.conversations.push(action.payload);
        }
      })
      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, updatedConversation } = action.payload;
        const convIndex = state.conversations.findIndex(c => c.id === conversationId);
        if (convIndex !== -1) {
          state.conversations[convIndex] = updatedConversation;
        }
        // Actualizar conversación activa si es la misma
        if (state.activeConversation?.id === conversationId) {
          state.activeConversation = updatedConversation;
        }
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const { conversationId, updatedConversation } = action.payload;
        if (updatedConversation) {
          const convIndex = state.conversations.findIndex(c => c.id === conversationId);
          if (convIndex !== -1) {
            state.conversations[convIndex] = updatedConversation;
          }
        }
      })
      // Delete message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const { conversationId, updatedConversation } = action.payload;
        if (updatedConversation) {
          const convIndex = state.conversations.findIndex(c => c.id === conversationId);
          if (convIndex !== -1) {
            state.conversations[convIndex] = updatedConversation;
          }
        }
      });
  }
});

export const { setActiveConversation, clearActiveConversation, clearError } = conversationsSlice.actions;
export default conversationsSlice.reducer;