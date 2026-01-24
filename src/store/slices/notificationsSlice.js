import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseNotificationsService from '../../services/supabaseNotificationsService';

// Thunks asíncronos
export const loadNotifications = createAsyncThunk(
  'notifications/load',
  async ({ userId, limit = 50, offset = 0 }, { rejectWithValue }) => {
    try {
      const notifications = await supabaseNotificationsService.getNotifications(userId, limit, offset);
      return notifications;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNotification = createAsyncThunk(
  'notifications/create',
  async (notificationData, { rejectWithValue }) => {
    try {
      // This is typically called by other services, not directly
      // But keeping for compatibility
      return notificationData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async ({ notificationId, userId }, { rejectWithValue }) => {
    try {
      await supabaseNotificationsService.markAsRead(notificationId, userId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (userId, { rejectWithValue }) => {
    try {
      await supabaseNotificationsService.markAllAsRead(userId);
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async ({ notificationId, userId }, { rejectWithValue }) => {
    try {
      await supabaseNotificationsService.deleteNotification(notificationId, userId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false,
    error: null,
    unreadCount: 0,
    subscription: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      // Para real-time: agregar nueva notificación
      const exists = state.items.find(n => n.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      }
    },
    addNewNotification: (state, action) => {
      // Para real-time updates
      state.items.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action) => {
      // Para real-time: eliminar notificación
      const notification = state.items.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.items = state.items.filter(n => n.id !== action.payload);
    },
    setSubscription: (state, action) => {
      state.subscription = action.payload;
    },
    // Acciones específicas para real-time polling
    addNotificationFromRealtime: (state, action) => {
      const exists = state.items.find(n => n.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
      }
    },
    updateNotificationFromRealtime: (state, action) => {
      const index = state.items.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        const oldNotification = state.items[index];
        const wasUnread = !oldNotification.read;
        const isNowRead = action.payload.read;
        
        state.items[index] = { ...oldNotification, ...action.payload };
        
        // Actualizar contador si cambió el estado de lectura
        if (wasUnread && isNowRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && !isNowRead) {
          state.unreadCount += 1;
        }
      }
    },
    removeNotificationFromRealtime: (state, action) => {
      const notification = state.items.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.items = state.items.filter(n => n.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Load notifications
      .addCase(loadNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
        state.loading = false;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // Create notification
      .addCase(createNotification.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
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
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(n => {
          n.read = true;
        });
        state.unreadCount = 0;
      })
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.items.find(n => n.id === action.payload);
        if (notification && !notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter(n => n.id !== action.payload);
      });
  }
});

export const { 
  clearError, 
  addNotification, 
  addNewNotification, 
  removeNotification, 
  setSubscription,
  addNotificationFromRealtime,
  updateNotificationFromRealtime,
  removeNotificationFromRealtime
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
