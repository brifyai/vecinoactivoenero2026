import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectMessages = (state) => state.messages.messages;
export const selectConversations = (state) => state.messages.conversations;
export const selectMessagesLoading = (state) => state.messages.loading;
export const selectMessagesError = (state) => state.messages.error;

// Memoized selectors
export const selectConversationMessages = createSelector(
  [selectMessages, (_, userId1, userId2) => ({ userId1, userId2 })],
  (messages, { userId1, userId2 }) => {
    return messages
      .filter(m =>
        (m.senderId === userId1 && m.recipientId === userId2) ||
        (m.senderId === userId2 && m.recipientId === userId1)
      )
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
);

export const selectUnreadCount = createSelector(
  [selectMessages, (_, userId) => userId],
  (messages, userId) => {
    return messages.filter(m => m.recipientId === userId && !m.read).length;
  }
);

export const selectUserConversations = createSelector(
  [selectConversations, (_, userId) => userId],
  (conversations, userId) => {
    return conversations.filter(c => 
      c.user1Id === userId || c.user2Id === userId
    );
  }
);
