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

import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import notificationsReducer from './slices/notificationsSlice';
import friendsReducer from './slices/friendsSlice';
import groupsReducer from './slices/groupsSlice';
import eventsReducer from './slices/eventsSlice';
import messagesReducer from './slices/messagesSlice';
import projectsReducer from './slices/projectsSlice';
import pollsReducer from './slices/pollsSlice';
import helpRequestsReducer from './slices/helpRequestsSlice';
import sharedResourcesReducer from './slices/sharedResourcesSlice';
import localBusinessReducer from './slices/localBusinessSlice';
import communityCalendarReducer from './slices/communityCalendarSlice';
import neighborhoodReducer from './slices/neighborhoodSlice';
import neighborhoodsReducer from './slices/neighborhoodsSlice';
import neighborhoodExpansionReducer from './slices/neighborhoodExpansionSlice';
import photosReducer from './slices/photosSlice';
import reportsReducer from './slices/reportsSlice';
import securityReducer from './slices/securitySlice';
import moderationReducer from './slices/moderationSlice';
import verificationReducer from './slices/verificationSlice';
import communityActionsReducer from './slices/communityActionsSlice';
import localNeedsReducer from './slices/localNeedsSlice';
import servicesReducer from './slices/servicesSlice';
import gamificationReducer from './slices/gamificationSlice';
import connectionsReducer from './slices/connectionsSlice';
import appReducer from './slices/appSlice';

// Configuración de persistencia
const persistConfig = {
  key: 'vecino-activo-root',
  storage,
  whitelist: ['auth'] // Solo persistir auth
};

// Crear el rootReducer primero
const rootReducer = {
  auth: authReducer,
  posts: postsReducer,
  notifications: notificationsReducer,
  friends: friendsReducer,
  groups: groupsReducer,
  events: eventsReducer,
  messages: messagesReducer,
  projects: projectsReducer,
  polls: pollsReducer,
  helpRequests: helpRequestsReducer,
  sharedResources: sharedResourcesReducer,
  localBusiness: localBusinessReducer,
  communityCalendar: communityCalendarReducer,
  neighborhood: neighborhoodReducer,
  neighborhoods: neighborhoodsReducer,
  neighborhoodExpansion: neighborhoodExpansionReducer,
  photos: photosReducer,
  reports: reportsReducer,
  security: securityReducer,
  moderation: moderationReducer,
  verification: verificationReducer,
  communityActions: communityActionsReducer,
  localNeeds: localNeedsReducer,
  services: servicesReducer,
  gamification: gamificationReducer,
  connections: connectionsReducer,
  app: appReducer
};

// Aplicar persistencia al rootReducer completo
const persistedReducer = persistReducer(persistConfig, (state, action) => {
  // Si es logout, limpiar el estado persistido
  if (action.type === 'auth/logout') {
    storage.removeItem('persist:vecino-activo-root');
    state = undefined;
  }
  
  // Aplicar reducers normalmente
  const newState = {};
  Object.keys(rootReducer).forEach(key => {
    newState[key] = rootReducer[key](state?.[key], action);
  });
  
  return newState;
});

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => {
    const middleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    });
    
    // Solo agregar logger en desarrollo y si está disponible
    if (process.env.NODE_ENV === 'development') {
      try {
        const logger = require('redux-logger').default;
        return middleware.concat(logger);
      } catch (error) {
        console.warn('redux-logger no disponible en desarrollo');
        return middleware;
      }
    }
    
    return middleware;
  },
  devTools: process.env.NODE_ENV !== 'production'
});

export const persistor = persistStore(store);
