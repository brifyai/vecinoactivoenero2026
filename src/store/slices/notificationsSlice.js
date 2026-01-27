import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import firebaseNotificationsService from '../../services/firebaseNotificationsService';

// Thunks asíncronos - Usando Firebase para tiempo real
export const initializeNotifications = createAsyncThunk(
  'notifications/initialize',
  async (userId, { rejectWithValue }) => {
    try {
      // Inicializar servicio de notificaciones Firebase
      const token = await firebaseNotificationsService.initialize(userId);
      return { userId, token };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadNotifications = createAsyncThunk(
  'notifications/load',
  async ({ userId, limit = 50 }, { rejectWithValue }) => {
    try {
      const notifications = await firebaseNotificationsService.getNotifications(userId, limit);
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
      const notification = await firebaseNotificationsService.createNotification(notificationData);
      return notification;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await firebaseNotificationsService.markAsRead(notificationId);
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
      await firebaseNotificationsService.markAllAsRead(userId);
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId, { rejectWithValue }) => {
    try {
      await firebaseNotificationsService.deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (userId, { rejectWithValue }) => {
    try {
      const count = await firebaseNotificationsService.getUnreadCount(userId);
      return count;
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
    fcmToken: null,
    initialized: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    // Acciones para tiempo real con Firebase
    setNotificationsFromRealtime: (state, action) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    },
    
    addNotificationFromRealtime: (state, action) => {
      const notification = action.payload;
      const exists = state.items.find(n => n.id === notification.id);
      if (!exists) {
        state.items.unshift(notification);
        if (!notification.read) {
          state.unreadCount += 1;
        }
      }
    },
    
    updateNotificationFromRealtime: (state, action) => {
      const notification = action.payload;
      const index = state.items.findIndex(n => n.id === notification.id);
      if (index !== -1) {
        const oldNotification = state.items[index];
        const wasUnread = !oldNotification.read;
        const isNowRead = notification.read;
        
        state.items[index] = { ...oldNotification, ...notification };
        
        // Actualizar contador si cambió el estado de lectura
        if (wasUnread && isNowRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && !isNowRead) {
          state.unreadCount += 1;
        }
      }
    },
    
    removeNotificationFromRealtime: (state, action) => {
      const notificationId = action.payload;
      const notification = state.items.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.items = state.items.filter(n => n.id !== notificationId);
    },
    
    setFCMToken: (state, action) => {
      state.fcmToken = action.payload;
    },
    
    setInitialized: (state, action) => {
      state.initialized = action.payload;
    },
    
    updateUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    
    // Acciones específicas para notificaciones push
    handleForegroundNotification: (state, action) => {
      // Manejar notificación recibida en foreground
      const notification = action.payload;
      // Agregar a la lista si no existe
      const exists = state.items.find(n => n.id === notification.id);
      if (!exists && notification.id) {
        state.items.unshift(notification);
        if (!notification.read) {
          state.unreadCount += 1;
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize notifications
      .addCase(initializeNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.fcmToken = action.payload.token;
        state.initialized = true;
      })
      .addCase(initializeNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
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
        // La notificación se agregará automáticamente via realtime listener
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        // Los cambios se reflejarán via realtime listeners
      })
      
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        // Los cambios se reflejarán via realtime listeners
      })
      
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        // La notificación se eliminará automáticamente via realtime listener
      })
      
      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      });
  }
});

export const { 
  clearError,
  setNotificationsFromRealtime,
  addNotificationFromRealtime,
  updateNotificationFromRealtime,
  removeNotificationFromRealtime,
  setFCMToken,
  setInitialized,
  updateUnreadCount,
  handleForegroundNotification
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
