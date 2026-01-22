import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../../services/storageService';

// Thunks asíncronos
export const loadNotifications = createAsyncThunk(
  'notifications/load',
  async (_, { getState }) => {
    const { auth } = getState();
    if (!auth.user) return [];
    
    const notifications = storageService.getNotifications();
    return notifications.filter(n => n.userId === auth.user.id);
  }
);

export const createNotification = createAsyncThunk(
  'notifications/create',
  async (notificationData, { getState }) => {
    const { auth } = getState();
    
    const newNotification = {
      id: Date.now(),
      userId: notificationData.userId,
      type: notificationData.type,
      message: notificationData.message,
      read: false,
      createdAt: new Date().toISOString(),
      ...notificationData
    };
    
    storageService.addNotification(newNotification);
    
    return newNotification;
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId) => {
    storageService.markNotificationAsRead(notificationId);
    return notificationId;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { getState }) => {
    const { auth, notifications } = getState();
    if (!auth.user) return;
    
    const userNotifications = notifications.items.filter(n => n.userId === auth.user.id);
    userNotifications.forEach(n => {
      if (!n.read) {
        storageService.markNotificationAsRead(n.id);
      }
    });
    
    return userNotifications.map(n => n.id);
  }
);

// Slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false,
    error: null,
    unreadCount: 0
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load notifications
      .addCase(loadNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
        state.loading = false;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      // Create notification
      .addCase(createNotification.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.unreadCount += 1;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.items.find(n => n.id === action.payload);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state, action) => {
        action.payload.forEach(id => {
          const notification = state.items.find(n => n.id === id);
          if (notification) {
            notification.read = true;
          }
        });
        state.unreadCount = 0;
      });
  }
});

export const { clearError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
