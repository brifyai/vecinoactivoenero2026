import { createSelector } from '@reduxjs/toolkit';

// Selectores básicos
export const selectAllNotifications = state => state.notifications.items;
export const selectNotificationsLoading = state => state.notifications.loading;
export const selectUnreadCount = state => state.notifications.unreadCount;

// Selectores memoizados
export const selectUnreadNotifications = createSelector(
  [selectAllNotifications],
  (notifications) => notifications?.filter(n => !n.read) || []
);

export const selectNotificationsByType = createSelector(
  [selectAllNotifications, (state, type) => type],
  (notifications, type) => notifications?.filter(n => n.type === type) || []
);
