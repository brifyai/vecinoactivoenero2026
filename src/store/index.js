import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import logger from 'redux-logger';

import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import notificationsReducer from './slices/notificationsSlice';
import friendsReducer from './slices/friendsSlice';
import groupsReducer from './slices/groupsSlice';
import eventsReducer from './slices/eventsSlice';
import messagesReducer from './slices/messagesSlice';

// Configuración de persistencia para auth
const persistConfig = {
  key: 'vecino-activo-root',
  storage,
  whitelist: ['auth'] // Solo persistir auth
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    posts: postsReducer,
    notifications: notificationsReducer,
    friends: friendsReducer,
    groups: groupsReducer,
    events: eventsReducer,
    messages: messagesReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).concat(
      process.env.NODE_ENV === 'development' ? logger : []
    ),
  devTools: process.env.NODE_ENV !== 'production'
});

export const persistor = persistStore(store);
