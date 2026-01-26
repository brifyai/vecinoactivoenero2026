import { createSelector } from '@reduxjs/toolkit';

// Selectores básicos
export const selectNotifications = state => state.notifications.items;
export const selectAllNotifications = state => state.notifications.items;
export const selectNotificationsLoading = state => state.notifications.loading;
export const selectNotificationsError = state => state.notifications.error;
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

export const selectRecentNotifications = createSelector(
  [selectAllNotifications],
  (notifications) => {
    if (!notifications) return [];
    return notifications
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
  }
);

export const selectNotificationById = createSelector(
  [selectAllNotifications, (state, id) => id],
  (notifications, id) => notifications?.find(n => n.id === id)
);
