import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectConversationsState = (state) => state.conversations;

// Basic selectors
export const selectAllConversations = createSelector(
  [selectConversationsState],
  (conversations) => conversations.conversations
);

export const selectActiveConversation = createSelector(
  [selectConversationsState],
  (conversations) => conversations.activeConversation
);

export const selectConversationsLoading = createSelector(
  [selectConversationsState],
  (conversations) => conversations.loading
);

export const selectConversationsError = createSelector(
  [selectConversationsState],
  (conversations) => conversations.error
);

// Computed selectors
export const selectConversationById = createSelector(
  [selectAllConversations, (state, id) => id],
  (conversations, id) => conversations.find(conv => conv.id === id)
);

export const selectConversationMessages = createSelector(
  [selectConversationById],
  (conversation) => conversation?.messages || []
);

export const selectUnreadCount = createSelector(
  [selectAllConversations, (state, userId) => userId],
  (conversations, userId) => {
    return conversations.reduce((total, conv) => {
      const unread = conv.messages.filter(msg => 
        msg.senderId !== userId && !msg.read
      ).length;
      return total + unread;
    }, 0);
  }
);

export const selectFilteredConversations = createSelector(
  [selectAllConversations, (state, searchQuery) => searchQuery],
  (conversations, searchQuery) => {
    if (!searchQuery) return conversations;
    
    return conversations.filter(conv => {
      // Aquí necesitarías acceso a los datos de usuarios para filtrar por nombre
      // Por simplicidad, filtraremos por el último mensaje
      return conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }
);