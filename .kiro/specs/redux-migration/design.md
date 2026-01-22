# Migración a Redux - Diseño Técnico

## 1. Arquitectura General

### 1.1 Estructura del Store

```
src/
├── store/
│   ├── index.js                 # Configuración del store
│   ├── slices/                  # Redux slices
│   │   ├── authSlice.js
│   │   ├── postsSlice.js
│   │   ├── eventsSlice.js
│   │   ├── groupsSlice.js
│   │   ├── friendsSlice.js
│   │   ├── neighborhoodSlice.js
│   │   ├── localNeedsSlice.js
│   │   ├── communityActionsSlice.js
│   │   ├── messagesSlice.js
│   │   ├── notificationsSlice.js
│   │   └── ... (otros slices)
│   ├── selectors/               # Selectores memoizados
│   │   ├── authSelectors.js
│   │   ├── postsSelectors.js
│   │   └── ...
│   └── middleware/              # Middleware personalizado
│       └── persistenceMiddleware.js
├── hooks/                       # Custom hooks para Redux
│   ├── useReduxAuth.js
│   ├── useReduxPosts.js
│   └── ...
└── utils/
    └── persistenceManager.js    # Gestión de persistencia
```

### 1.2 Flujo de Datos

```
Componente
    ↓ dispatch(action)
Redux Store
    ↓ reducer actualiza state
    ↓ middleware persiste en localStorage
localStorage
    ↓ selector obtiene datos
Componente (re-render)
```

## 2. Configuración del Store

### 2.1 Store Principal (src/store/index.js)

```javascript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import logger from 'redux-logger';

// Importar slices
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import eventsReducer from './slices/eventsSlice';
// ... otros reducers

// Configuración de persistencia
const persistConfig = {
  key: 'vecino-activo-root',
  storage,
  whitelist: ['auth', 'posts', 'events', 'groups', 'friends'], // Solo persistir estos
  blacklist: ['ui', 'search'] // No persistir estado temporal
};

const rootReducer = {
  auth: authReducer,
  posts: postsReducer,
  events: eventsReducer,
  groups: groupsReducer,
  friends: friendsReducer,
  // ... otros reducers
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(process.env.NODE_ENV === 'development' ? logger : []),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
```

### 2.2 Integración en index.js

```javascript
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
```

## 3. Diseño de Slices

### 3.1 Patrón de Slice Estándar

Cada slice sigue esta estructura:

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../../services/storageService';

// Estado inicial
const initialState = {
  items: [],
  loading: false,
  error: null,
  selectedItem: null,
};

// Thunks asíncronos
export const loadItems = createAsyncThunk(
  'domain/loadItems',
  async (_, { rejectWithValue }) => {
    try {
      const items = storageService.getItems();
      return items;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const domainSlice = createSlice({
  name: 'domain',
  initialState,
  reducers: {
    // Acciones síncronas
    addItem: (state, action) => {
      state.items.push(action.payload);
      storageService.addItem(action.payload);
    },
    updateItem: (state, action) => {
      const index = state.items.findIndex(i => i.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        storageService.updateItem(action.payload.id, action.payload);
      }
    },
    deleteItem: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
      storageService.deleteItem(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Manejar thunks asíncronos
    builder
      .addCase(loadItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addItem, updateItem, deleteItem } = domainSlice.actions;
export default domainSlice.reducer;
```

### 3.2 Selectores (src/store/selectors/domainSelectors.js)

```javascript
import { createSelector } from '@reduxjs/toolkit';

// Selectores básicos
export const selectItems = (state) => state.domain.items;
export const selectLoading = (state) => state.domain.loading;
export const selectError = (state) => state.domain.error;

// Selectores memoizados
export const selectItemById = createSelector(
  [selectItems, (state, itemId) => itemId],
  (items, itemId) => items.find(item => item.id === itemId)
);

export const selectItemsByCategory = createSelector(
  [selectItems, (state, category) => category],
  (items, category) => items.filter(item => item.category === category)
);
```

### 3.3 Custom Hook (src/hooks/useReduxDomain.js)

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { 
  addItem, 
  updateItem, 
  deleteItem, 
  loadItems 
} from '../store/slices/domainSlice';
import {
  selectItems,
  selectLoading,
  selectError,
  selectItemById
} from '../store/selectors/domainSelectors';

export const useReduxDomain = () => {
  const dispatch = useDispatch();
  
  const items = useSelector(selectItems);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  
  return {
    // Estado
    items,
    loading,
    error,
    
    // Acciones
    addItem: (item) => dispatch(addItem(item)),
    updateItem: (item) => dispatch(updateItem(item)),
    deleteItem: (id) => dispatch(deleteItem(id)),
    loadItems: () => dispatch(loadItems()),
    
    // Selectores
    getItemById: (id) => useSelector(state => selectItemById(state, id)),
  };
};
```

## 4. Slices Específicos

### 4.1 authSlice

**Estado:**
```javascript
{
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
}
```

**Acciones:**
- `login(credentials)` - Iniciar sesión
- `logout()` - Cerrar sesión
- `register(userData)` - Registrar usuario
- `updateProfile(updates)` - Actualizar perfil
- `loadUser()` - Cargar usuario desde localStorage

### 4.2 postsSlice

**Estado:**
```javascript
{
  posts: [],
  loading: false,
  error: null,
  selectedPost: null
}
```

**Acciones:**
- `createPost(postData)` - Crear publicación
- `updatePost({ id, updates })` - Actualizar publicación
- `deletePost(id)` - Eliminar publicación
- `addReaction({ postId, reaction })` - Agregar reacción
- `removeReaction({ postId, userId })` - Quitar reacción
- `addComment({ postId, comment })` - Agregar comentario
- `sharePost({ postId, shareText })` - Compartir publicación
- `loadPosts()` - Cargar publicaciones

### 4.3 eventsSlice

**Estado:**
```javascript
{
  events: [],
  myEvents: [],
  loading: false,
  error: null
}
```

**Acciones:**
- `createEvent(eventData)` - Crear evento
- `updateEvent({ id, updates })` - Actualizar evento
- `deleteEvent(id)` - Eliminar evento
- `rsvpEvent({ eventId, status })` - RSVP a evento
- `inviteToEvent({ eventId, userId })` - Invitar a evento
- `loadEvents()` - Cargar eventos

### 4.4 groupsSlice

**Estado:**
```javascript
{
  groups: [],
  myGroups: [],
  loading: false,
  error: null
}
```

**Acciones:**
- `createGroup(groupData)` - Crear grupo
- `joinGroup(groupId)` - Unirse a grupo
- `leaveGroup(groupId)` - Salir de grupo
- `updateGroup({ id, updates })` - Actualizar grupo
- `deleteGroup(id)` - Eliminar grupo
- `loadGroups()` - Cargar grupos

### 4.5 friendsSlice

**Estado:**
```javascript
{
  friends: [],
  friendRequests: [],
  suggestions: [],
  loading: false,
  error: null
}
```

**Acciones:**
- `sendFriendRequest(userId)` - Enviar solicitud
- `acceptFriendRequest(requestId)` - Aceptar solicitud
- `rejectFriendRequest(requestId)` - Rechazar solicitud
- `removeFriend(userId)` - Eliminar amigo
- `loadFriends()` - Cargar amigos
- `loadFriendRequests()` - Cargar solicitudes

## 5. Migración Gradual

### 5.1 Estrategia de Coexistencia

Durante la migración, Context y Redux coexistirán:

```javascript
// Componente usando ambos (temporal)
const MyComponent = () => {
  // Nuevo: Redux
  const { posts, createPost } = useReduxPosts();
  
  // Antiguo: Context (fallback)
  const { posts: contextPosts } = usePosts();
  
  // Usar Redux si está disponible, sino Context
  const finalPosts = posts || contextPosts;
  
  return <div>{/* ... */}</div>;
};
```

### 5.2 Feature Flags

```javascript
// src/config/features.js
export const FEATURES = {
  USE_REDUX_AUTH: true,
  USE_REDUX_POSTS: true,
  USE_REDUX_EVENTS: true,
  USE_REDUX_GROUPS: false, // Aún no migrado
};

// En componente
import { FEATURES } from '../config/features';

const MyComponent = () => {
  const reduxPosts = useReduxPosts();
  const contextPosts = usePosts();
  
  const posts = FEATURES.USE_REDUX_POSTS ? reduxPosts : contextPosts;
  
  return <div>{/* ... */}</div>;
};
```

### 5.3 Wrapper de Compatibilidad

```javascript
// src/hooks/usePosts.js (wrapper)
import { FEATURES } from '../config/features';
import { useReduxPosts } from './useReduxPosts';
import { usePosts as useContextPosts } from '../context/PostsContext';

export const usePosts = () => {
  const reduxPosts = useReduxPosts();
  const contextPosts = useContextPosts();
  
  return FEATURES.USE_REDUX_POSTS ? reduxPosts : contextPosts;
};
```

## 6. Persistencia

### 6.1 Migración de Datos

```javascript
// src/utils/dataMigration.js
export const migrateContextToRedux = () => {
  // Leer datos antiguos de Context
  const oldPosts = localStorage.getItem('friendbook_posts');
  const oldEvents = localStorage.getItem('events');
  
  // Si existen, migrar al formato Redux
  if (oldPosts && !localStorage.getItem('persist:vecino-activo-root')) {
    const posts = JSON.parse(oldPosts);
    
    // Guardar en formato Redux Persist
    const reduxState = {
      posts: {
        posts: posts,
        loading: false,
        error: null
      }
    };
    
    localStorage.setItem(
      'persist:vecino-activo-root',
      JSON.stringify(reduxState)
    );
  }
};
```

### 6.2 Sincronización con storageService

```javascript
// Middleware para sincronizar con storageService
const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Después de cada acción, sincronizar con storageService
  if (action.type.startsWith('posts/')) {
    const state = store.getState();
    storageService.savePosts(state.posts.posts);
  }
  
  return result;
};
```

## 7. Testing

### 7.1 Test de Slice

```javascript
// src/store/slices/__tests__/postsSlice.test.js
import postsReducer, { addPost, deletePost } from '../postsSlice';

describe('postsSlice', () => {
  const initialState = {
    posts: [],
    loading: false,
    error: null
  };
  
  it('should handle addPost', () => {
    const post = { id: 1, content: 'Test' };
    const actual = postsReducer(initialState, addPost(post));
    expect(actual.posts).toHaveLength(1);
    expect(actual.posts[0]).toEqual(post);
  });
  
  it('should handle deletePost', () => {
    const state = {
      ...initialState,
      posts: [{ id: 1, content: 'Test' }]
    };
    const actual = postsReducer(state, deletePost(1));
    expect(actual.posts).toHaveLength(0);
  });
});
```

### 7.2 Test de Selector

```javascript
// src/store/selectors/__tests__/postsSelectors.test.js
import { selectPostById } from '../postsSelectors';

describe('postsSelectors', () => {
  const state = {
    posts: {
      posts: [
        { id: 1, content: 'Post 1' },
        { id: 2, content: 'Post 2' }
      ]
    }
  };
  
  it('should select post by id', () => {
    const post = selectPostById(state, 1);
    expect(post).toEqual({ id: 1, content: 'Post 1' });
  });
});
```

## 8. Redux DevTools

### 8.1 Configuración

```javascript
// Ya incluido en configureStore
devTools: process.env.NODE_ENV !== 'production'
```

### 8.2 Uso

1. Instalar extensión Redux DevTools en Chrome/Firefox
2. Abrir DevTools → Redux tab
3. Ver acciones en tiempo real
4. Time-travel debugging
5. Exportar/importar estado

## 9. Performance

### 9.1 Selectores Memoizados

Usar `createSelector` de Reselect para evitar re-renders innecesarios:

```javascript
export const selectExpensiveComputation = createSelector(
  [selectPosts, selectFilters],
  (posts, filters) => {
    // Computación costosa solo se ejecuta si posts o filters cambian
    return posts.filter(/* ... */).sort(/* ... */);
  }
);
```

### 9.2 Normalización de Estado

Para relaciones complejas, normalizar el estado:

```javascript
{
  posts: {
    byId: {
      '1': { id: 1, authorId: 101, content: '...' },
      '2': { id: 2, authorId: 102, content: '...' }
    },
    allIds: [1, 2]
  },
  users: {
    byId: {
      '101': { id: 101, name: 'User 1' },
      '102': { id: 102, name: 'User 2' }
    },
    allIds: [101, 102]
  }
}
```

## 10. Correctness Properties

### 10.1 Inmutabilidad
**Propiedad:** El estado nunca debe mutarse directamente
**Validación:** Redux Toolkit usa Immer, que detecta mutaciones

### 10.2 Serialización
**Propiedad:** Todo el estado debe ser serializable
**Validación:** Redux DevTools y Redux Persist requieren serialización

### 10.3 Determinismo
**Propiedad:** Misma acción + mismo estado = mismo resultado
**Validación:** Tests unitarios de reducers

### 10.4 Persistencia
**Propiedad:** El estado debe persistir entre sesiones
**Validación:** Tests de integración con localStorage

### 10.5 Sincronización
**Propiedad:** Redux y storageService deben estar sincronizados
**Validación:** Tests que verifican ambos después de cada acción
