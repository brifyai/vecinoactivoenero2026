# EJEMPLO PRÁCTICO: MIGRACIÓN A REDUX TOOLKIT
## Implementación paso a paso

---

## 🎯 OBJETIVO

Migrar AuthContext y PostsContext a Redux Toolkit como prueba de concepto.

---

## PASO 1: INSTALACIÓN

```bash
npm install @reduxjs/toolkit react-redux redux-persist
npm install --save-dev redux-logger
```

---

## PASO 2: ESTRUCTURA DE CARPETAS

```
src/
├── store/
│   ├── index.js                    # Configuración del store
│   ├── slices/
│   │   ├── authSlice.js           # ✅ Reemplaza AuthContext
│   │   ├── postsSlice.js          # ✅ Reemplaza PostsContext
│   │   └── notificationsSlice.js  # ✅ Reemplaza NotificationsContext
│   ├── selectors/
│   │   ├── authSelectors.js
│   │   └── postsSelectors.js
│   └── middleware/
│       ├── logger.js
│       └── persistence.js
```

---

## PASO 3: CREAR authSlice.js

```javascript
// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../../services/storageService';
import emailVerificationService from '../../services/emailVerificationService';

const SESSION_STORAGE_KEY = 'friendbook_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;

// Thunks asíncronos
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const users = storageService.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return rejectWithValue('Credenciales inválidas');
      }
      
      // Guardar sesión
      const session = {
        createdAt: Date.now(),
        userId: user.id
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      storageService.setCurrentUser(user);
      
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const users = storageService.getUsers();
      
      if (users.find(u => u.email === userData.email)) {
        return rejectWithValue('El email ya está registrado');
      }
      
      const newUser = {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString(),
        friends: [],
        friendRequests: [],
        verified: false
      };
      
      storageService.addUser(newUser);
      storageService.setCurrentUser(newUser);
      
      return newUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || 'null');
      const savedUser = storageService.getCurrentUser();
      
      if (!session || !savedUser) {
        return rejectWithValue('No hay sesión');
      }
      
      const currentTime = Date.now();
      if (currentTime - session.createdAt > SESSION_TIMEOUT) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        storageService.clearCurrentUser();
        return rejectWithValue('Sesión expirada');
      }
      
      return savedUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    sessionExpired: false,
    isAuthenticated: false
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem(SESSION_STORAGE_KEY);
      storageService.clearCurrentUser();
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      storageService.updateUser(state.user.id, action.payload);
      storageService.setCurrentUser(state.user);
    },
    updateUserAvatar: (state, action) => {
      state.user.avatar = action.payload;
      storageService.updateUser(state.user.id, { avatar: action.payload });
      storageService.setCurrentUser(state.user);
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Restore Session
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.sessionExpired = action.payload === 'Sesión expirada';
        state.loading = false;
      });
  }
});

export const { logout, updateUser, updateUserAvatar, clearError } = authSlice.actions;
export default authSlice.reducer;
```

---

## PASO 4: CREAR postsSlice.js

```javascript
// src/store/slices/postsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../../services/storageService';

export const loadPosts = createAsyncThunk(
  'posts/load',
  async () => {
    const posts = storageService.getPosts();
    return posts;
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (postData, { getState, dispatch }) => {
    const { auth } = getState();
    const user = auth.user;
    
    if (!user) {
      throw new Error('Usuario no autenticado');
    }
    
    const newPost = {
      id: Date.now(),
      author: user.name,
      authorId: user.id,
      avatar: user.avatar,
      time: 'Justo ahora',
      content: postData.content,
      image: postData.image || null,
      feeling: postData.feeling || null,
      location: postData.location || null,
      privacy: postData.privacy || 'public',
      category: postData.category || 'general',
      hashtags: postData.hashtags || [],
      likes: 0,
      comments: 0,
      shares: 0,
      reactions: {},
      createdAt: new Date().toISOString()
    };
    
    storageService.addPost(newPost);
    
    // Efecto secundario: crear notificación
    // dispatch(addNotification({ ... }));
    
    return newPost;
  }
);

export const updatePost = createAsyncThunk(
  'posts/update',
  async ({ postId, updates }) => {
    storageService.updatePost(postId, updates);
    return { postId, updates };
  }
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (postId) => {
    storageService.deletePost(postId);
    return postId;
  }
);

export const addReaction = createAsyncThunk(
  'posts/addReaction',
  async ({ postId, emoji }, { getState }) => {
    const { auth } = getState();
    const userId = auth.user.id;
    
    const posts = storageService.getPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) throw new Error('Post no encontrado');
    
    const reactions = post.reactions || {};
    const userReactions = reactions[userId] || [];
    
    let newUserReactions;
    if (userReactions.includes(emoji)) {
      newUserReactions = userReactions.filter(r => r !== emoji);
    } else {
      newUserReactions = [...userReactions, emoji];
    }
    
    const newReactions = {
      ...reactions,
      [userId]: newUserReactions
    };
    
    storageService.updatePost(postId, { reactions: newReactions });
    
    return { postId, reactions: newReactions };
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load posts
      .addCase(loadPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadPosts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(loadPosts.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update post
      .addCase(updatePost.fulfilled, (state, action) => {
        const { postId, updates } = action.payload;
        const index = state.items.findIndex(p => p.id === postId);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates };
        }
      })
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      // Add reaction
      .addCase(addReaction.fulfilled, (state, action) => {
        const { postId, reactions } = action.payload;
        const post = state.items.find(p => p.id === postId);
        if (post) {
          post.reactions = reactions;
        }
      });
  }
});

export const { clearError } = postsSlice.actions;
export default postsSlice.reducer;
```

---

## PASO 5: CREAR SELECTORES

```javascript
// src/store/selectors/authSelectors.js
export const selectUser = state => state.auth.user;
export const selectIsAuthenticated = state => state.auth.isAuthenticated;
export const selectAuthLoading = state => state.auth.loading;
export const selectAuthError = state => state.auth.error;

// src/store/selectors/postsSelectors.js
import { createSelector } from '@reduxjs/toolkit';

export const selectAllPosts = state => state.posts.items;
export const selectPostsLoading = state => state.posts.loading;

export const selectUserPosts = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter(post => post.authorId === userId)
);

export const selectPostsByCategory = createSelector(
  [selectAllPosts, (state, category) => category],
  (posts, category) => posts.filter(post => post.category === category)
);
```

---

## PASO 6: CONFIGURAR STORE

```javascript
// src/store/index.js
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

// Configuración de persistencia
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // Solo persistir auth
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    posts: postsReducer
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
```

---

## PASO 7: INTEGRAR EN APP

```javascript
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
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

---

## PASO 8: USAR EN COMPONENTES

### Login.js (ANTES vs DESPUÉS)

**ANTES:**
```javascript
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loading, error } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
};
```

**DESPUÉS:**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import { selectAuthLoading, selectAuthError } from '../store/selectors/authSelectors';

const Login = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(loginUser({ email, password }));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
};
```

### Home.js (ANTES vs DESPUÉS)

**ANTES:**
```javascript
import { usePosts } from '../context/PostsContext';

const Home = () => {
  const { posts, createPost, loading } = usePosts();
  
  return (
    <div>
      {posts.map(post => <Post key={post.id} post={post} />)}
    </div>
  );
};
```

**DESPUÉS:**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { createPost, loadPosts } from '../store/slices/postsSlice';
import { selectAllPosts, selectPostsLoading } from '../store/selectors/postsSelectors';

const Home = () => {
  const dispatch = useDispatch();
  const posts = useSelector(selectAllPosts);
  const loading = useSelector(selectPostsLoading);
  
  useEffect(() => {
    dispatch(loadPosts());
  }, [dispatch]);
  
  const handleCreatePost = (postData) => {
    dispatch(createPost(postData));
  };
  
  return (
    <div>
      {posts.map(post => <Post key={post.id} post={post} />)}
    </div>
  );
};
```

---

## PASO 9: DEBUGGING CON REDUX DEVTOOLS

1. Instalar extensión: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/)

2. Abrir DevTools en el navegador

3. Ver acciones en tiempo real:
```
🔵 auth/login/pending
🔵 auth/login/fulfilled
🔵 posts/create/fulfilled
🔵 posts/addReaction/fulfilled
```

4. Time Travel: Volver atrás en el tiempo

5. Ver estado completo en cualquier momento

---

## PASO 10: TESTING

```javascript
// src/store/slices/__tests__/authSlice.test.js
import authReducer, { loginUser, logout } from '../authSlice';
import { configureStore } from '@reduxjs/toolkit';

describe('authSlice', () => {
  let store;
  
  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authReducer }
    });
  });
  
  it('should handle logout', () => {
    store.dispatch(logout());
    expect(store.getState().auth.user).toBeNull();
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });
});
```

---

## ✅ RESULTADO

### Ventajas Inmediatas:

1. **Debugging visual**: Redux DevTools muestra TODOS los cambios
2. **Cambios explícitos**: Cada acción tiene un nombre claro
3. **Testing fácil**: Slices son funciones puras
4. **Rendimiento**: Selectores memoizados
5. **Escalabilidad**: Fácil agregar nuevos slices

### Comparación:

| Aspecto | Context API | Redux Toolkit |
|---------|-------------|---------------|
| Debugging | console.log | Redux DevTools |
| Testing | Complejo | Simple |
| Rendimiento | Re-renders | Optimizado |
| Boilerplate | Medio | Bajo (con RTK) |
| Curva aprendizaje | Baja | Media |
| Escalabilidad | Limitada | Excelente |

---

## 🚀 PRÓXIMOS PASOS

1. Migrar NotificationsContext
2. Migrar FriendsContext
3. Migrar ChatContext
4. Implementar middleware personalizado
5. Agregar tests completos
