# GUÍA DE MIGRACIÓN A REDUX
## Cómo migrar componentes de Context API a Redux

---

## ✅ COMPLETADO

### Fase 1: Setup Básico
- [x] Instalación de Redux Toolkit y dependencias
- [x] Creación de store (src/store/index.js)
- [x] Creación de authSlice (src/store/slices/authSlice.js)
- [x] Creación de postsSlice (src/store/slices/postsSlice.js)
- [x] Creación de notificationsSlice (src/store/slices/notificationsSlice.js)
- [x] Creación de selectores (src/store/selectors/)
- [x] Integración en index.js con Provider
- [x] Integración en App.js
- [x] Creación de ReduxInitializer
- [x] Creación de hooks de compatibilidad (useReduxAuth, useReduxPosts, useReduxNotifications)

---

## 🎯 CÓMO MIGRAR COMPONENTES

### Opción 1: Migración Directa (Recomendada para nuevos componentes)

**ANTES (usando Context):**
```javascript
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostsContext';

const MyComponent = () => {
  const { user, logout } = useAuth();
  const { posts, createPost } = usePosts();
  
  return <div>...</div>;
};
```

**DESPUÉS (usando Redux directamente):**
```javascript
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { createPost } from '../store/slices/postsSlice';
import { selectUser } from '../store/selectors/authSelectors';
import { selectAllPosts } from '../store/selectors/postsSelectors';

const MyComponent = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const posts = useSelector(selectAllPosts);
  
  const handleLogout = () => dispatch(logout());
  const handleCreatePost = (data) => dispatch(createPost(data));
  
  return <div>...</div>;
};
```

### Opción 2: Migración Gradual (Para componentes existentes)

**Usar hooks de compatibilidad:**
```javascript
// Cambiar solo el import
// ANTES:
import { useAuth } from '../context/AuthContext';

// DESPUÉS:
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';

// El resto del código permanece igual!
const MyComponent = () => {
  const { user, logout } = useAuth();
  // ... código sin cambios
};
```

---

## 📋 CHECKLIST DE MIGRACIÓN POR COMPONENTE

### Para cada componente que uses AuthContext:

1. **Identificar el componente**
   - [ ] Abrir el archivo del componente
   - [ ] Buscar `import { useAuth } from`

2. **Opción A: Migración rápida**
   ```javascript
   // Cambiar:
   import { useAuth } from '../context/AuthContext';
   // Por:
   import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
   ```

3. **Opción B: Migración completa**
   ```javascript
   // Reemplazar:
   import { useAuth } from '../context/AuthContext';
   const { user, logout } = useAuth();
   
   // Por:
   import { useSelector, useDispatch } from 'react-redux';
   import { logout } from '../store/slices/authSlice';
   import { selectUser } from '../store/selectors/authSelectors';
   
   const dispatch = useDispatch();
   const user = useSelector(selectUser);
   const handleLogout = () => dispatch(logout());
   ```

4. **Probar el componente**
   - [ ] Verificar que funciona correctamente
   - [ ] Verificar en Redux DevTools que las acciones se disparan

---

## 🔄 COMPONENTES PRIORITARIOS PARA MIGRAR

### Alta Prioridad (Usan AuthContext):
1. **Login.js** - Página de inicio de sesión
2. **Register.js** - Página de registro
3. **Header.js** - Visible en todas las páginas
4. **ProfileHeader.js** - Usado en múltiples páginas

### Media Prioridad (Usan PostsContext):
5. **Home.js** - Página principal
6. **Timeline.js** - Línea de tiempo
7. **Feed.js** - Feed de contenido
8. **Post.js** - Componente de post individual

### Baja Prioridad:
9. Resto de componentes que usan los contextos

---

## 📝 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Migrar Login.js

**ANTES:**
```javascript
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loading, error } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
};
```

**DESPUÉS (Opción rápida):**
```javascript
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';

const Login = () => {
  const { login, loading, error } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
};
```

**DESPUÉS (Opción completa):**
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
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate('/');
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
};
```

### Ejemplo 2: Migrar Home.js

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

**DESPUÉS (Opción rápida):**
```javascript
import { useReduxPosts as usePosts } from '../hooks/useReduxPosts';

const Home = () => {
  const { posts, createPost, loading } = usePosts();
  
  return (
    <div>
      {posts.map(post => <Post key={post.id} post={post} />)}
    </div>
  );
};
```

**DESPUÉS (Opción completa):**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../store/slices/postsSlice';
import { selectAllPosts, selectPostsLoading } from '../store/selectors/postsSelectors';

const Home = () => {
  const dispatch = useDispatch();
  const posts = useSelector(selectAllPosts);
  const loading = useSelector(selectPostsLoading);
  
  const handleCreatePost = (data) => dispatch(createPost(data));
  
  return (
    <div>
      {posts.map(post => <Post key={post.id} post={post} />)}
    </div>
  );
};
```

---

## 🐛 DEBUGGING CON REDUX DEVTOOLS

### Instalar Redux DevTools

1. Instalar extensión del navegador:
   - Chrome: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
   - Firefox: [Redux DevTools](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

2. Abrir DevTools en el navegador (F12)

3. Ir a la pestaña "Redux"

### Usar Redux DevTools

**Ver acciones en tiempo real:**
```
🔵 auth/login/pending
🔵 auth/login/fulfilled
🔵 posts/create/fulfilled
🔵 notifications/create/fulfilled
```

**Ver estado completo:**
```javascript
{
  auth: {
    user: { id: 1, name: "Juan", avatar: "..." },
    isAuthenticated: true,
    loading: false
  },
  posts: {
    items: [...],
    loading: false
  },
  notifications: {
    items: [...],
    unreadCount: 3
  }
}
```

**Time Travel:**
- Puedes volver atrás en el tiempo
- Ver cómo era el estado en cualquier momento
- Reproducir acciones

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "Cannot read property 'user' of undefined"

**Causa:** El componente intenta acceder a `user` antes de que Redux se inicialice

**Solución:**
```javascript
const user = useSelector(selectUser);

// Agregar verificación
if (!user) return <div>Loading...</div>;

// O usar optional chaining
<div>{user?.name}</div>
```

### Problema 2: "dispatch is not a function"

**Causa:** Olvidaste llamar a `useDispatch()`

**Solución:**
```javascript
import { useDispatch } from 'react-redux';

const MyComponent = () => {
  const dispatch = useDispatch(); // ← No olvidar esto
  
  const handleClick = () => {
    dispatch(someAction());
  };
};
```

### Problema 3: El componente no se actualiza cuando cambia el estado

**Causa:** No estás usando `useSelector` correctamente

**Solución:**
```javascript
// ❌ MAL
const state = useSelector(state => state);
const user = state.auth.user;

// ✅ BIEN
const user = useSelector(selectUser);
```

---

## 📊 PROGRESO DE MIGRACIÓN

### Componentes Migrados: 0/10

- [ ] Login.js
- [ ] Register.js
- [ ] Header.js
- [ ] ProfileHeader.js
- [ ] Home.js
- [ ] Timeline.js
- [ ] Feed.js
- [ ] Post.js
- [ ] Settings.js
- [ ] About.js

### Contextos Eliminados: 0/3

- [ ] AuthContext.js (reemplazado por authSlice)
- [ ] PostsContext.js (reemplazado por postsSlice)
- [ ] NotificationsContext.js (reemplazado por notificationsSlice)

---

## 🚀 PRÓXIMOS PASOS

1. **Migrar Login y Register** (páginas de autenticación)
2. **Migrar Header** (visible en todas las páginas)
3. **Migrar Home** (página principal)
4. **Probar Redux DevTools**
5. **Migrar resto de componentes gradualmente**

---

## 💡 TIPS

1. **Usa los hooks de compatibilidad** para migración rápida
2. **Migra un componente a la vez** y prueba
3. **Usa Redux DevTools** para ver qué está pasando
4. **No elimines los contextos antiguos** hasta que todos los componentes estén migrados
5. **Documenta los cambios** en este archivo

---

## 📚 RECURSOS

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)
