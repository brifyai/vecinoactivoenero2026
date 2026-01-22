# ARQUITECTURA COMPLETA - VECINO ACTIVO
## Mapa de Dependencias y Propagación de Cambios

---

## 🔴 PUNTOS CRÍTICOS DE ALTO IMPACTO

### 1. **AuthContext** → Afecta 100% de la aplicación
**Ubicación**: `src/context/AuthContext.js`

**Consumidores directos**: TODAS las páginas y la mayoría de componentes

**Campos críticos**:
- `user` → Usado en Header, ProfileHeader, Post, todos los contextos
- `user.avatar` → Aparece en Header, Post, ProfileCard, ProfileHeader
- `user.name` → Aparece en múltiples lugares
- `user.neighborhood` → Usado en filtros de contenido

**Si cambias AuthContext, afecta**:
- ✅ Header (muestra usuario actual)
- ✅ ProfileHeader (muestra perfil)
- ✅ Post (muestra avatar del autor)
- ✅ Todos los contextos que dependen de `user`
- ✅ Todas las páginas protegidas

---

### 2. **storageService** → Afecta 100% de la persistencia
**Ubicación**: `src/services/storageService.js`

**Consumidores**: TODOS los 32 contextos

**Métodos críticos**:
- `getPosts()`, `savePosts()` → Usado por PostsContext
- `getCurrentUser()`, `setCurrentUser()` → Usado por AuthContext
- `getFriends()`, `addFriend()` → Usado por FriendsContext
- `getNotifications()` → Usado por NotificationsContext

**Si cambias storageService, afecta**:
- ✅ Toda la persistencia de datos
- ✅ Sincronización entre pestañas
- ✅ Carga inicial de datos
- ✅ Todos los contextos

---

### 3. **Layout** → Afecta 100% de las páginas
**Ubicación**: `src/components/Layout/Layout.js`

**Componentes que incluye**:
- Header (visible en todas las páginas)
- Sidebar (visible en todas las páginas)
- RightSidebar (visible en la mayoría de páginas)

**Si cambias Layout, afecta**:
- ✅ Todas las páginas protegidas
- ✅ Estructura visual global
- ✅ Navegación

---

### 4. **Header** → Visible en todas las páginas
**Ubicación**: `src/components/Header/Header.js`

**Contextos que usa**:
- AuthContext (usuario actual)
- AppContext (darkMode, unreadMessages)
- NotificationsContext (unreadCount)

**Componentes que incluye**:
- NotificationsCenter
- MessagesDropdown
- ProfileDropdown
- SearchModal

**Si cambias Header, afecta**:
- ✅ Todas las páginas (siempre visible)
- ✅ Notificaciones globales
- ✅ Mensajes globales
- ✅ Perfil de usuario

---

### 5. **PostsContext** → Afecta 5+ páginas principales
**Ubicación**: `src/context/PostsContext.js`

**Páginas que lo usan**:
- Home (lista de posts)
- Timeline (posts del usuario)
- Feed (posts filtrados)
- NeighborhoodProfile (posts del vecindario)
- UserProfile (posts del usuario)

**Dependencias**:
- AuthContext (usuario actual)
- NotificationsContext (crear notificaciones)
- storageService (persistencia)

**Si cambias PostsContext, afecta**:
- ✅ Home
- ✅ Timeline
- ✅ Feed
- ✅ NeighborhoodProfile
- ✅ UserProfile
- ✅ Componente Post

---

### 6. **NotificationsContext** → Usado por múltiples contextos
**Ubicación**: `src/context/NotificationsContext.js`

**Contextos que lo usan**:
- FriendsContext (notificaciones de amistad)
- PostsContext (notificaciones de posts)
- VerificationContext (notificaciones de verificación)
- EventsContext (notificaciones de eventos)
- Y más...

**Componentes que lo usan**:
- Header (badge de notificaciones)
- NotificationsCenter (lista)

**Si cambias NotificationsContext, afecta**:
- ✅ Header (contador)
- ✅ NotificationsCenter
- ✅ Todos los contextos que crean notificaciones

---

## 🟡 COMPONENTES REUTILIZABLES

### **Post** → Usado en 5+ páginas
**Ubicación**: `src/components/Post/Post.js`

**Páginas que lo usan**:
- Home
- Timeline
- Feed
- NeighborhoodProfile
- UserProfile

**Contextos que usa**:
- AuthContext
- VerificationContext

**Componentes que incluye**:
- CommentsModal
- ShareModal
- ReactionsModal
- ReportModal
- VerifiedBadge

**Si cambias Post, afecta**:
- ✅ Todas las páginas que muestran posts
- ✅ Visualización de reacciones
- ✅ Comentarios
- ✅ Compartir

---

### **ProfileHeader** → Usado en 5+ páginas
**Ubicación**: `src/components/ProfileHeader/ProfileHeader.js`

**Páginas que lo usan**:
- Photos
- Timeline
- Friends
- About
- UserProfile

**Contextos que usa**:
- AuthContext
- VerificationContext

**Componentes que incluye**:
- EditProfileModal
- VerificationModal
- VerifiedBadge

**Si cambias ProfileHeader, afecta**:
- ✅ Todas las páginas de perfil
- ✅ Visualización de verificación
- ✅ Edición de perfil

---

### **VerifiedBadge** → Usado en múltiples componentes
**Ubicación**: `src/components/VerifiedBadge/VerifiedBadge.js`

**Componentes que lo usan**:
- Post
- ProfileHeader
- FriendCard
- Y más...

**Si cambias VerifiedBadge, afecta**:
- ✅ Visualización de verificación en toda la app

---

## 🟢 CONTEXTOS DE CARACTERÍSTICAS

### **FriendsContext**
**Páginas**: Friends, Messenger, DiscoverNeighbors, ProfileCard
**Dependencias**: AuthContext, NotificationsContext

### **ChatContext**
**Páginas**: Messenger, DirectMessages, ChatWindow
**Dependencias**: AuthContext

### **LocalNeedsContext**
**Páginas**: LocalNeeds, Feed
**Componentes**: NeedCard

### **CommunityActionsContext**
**Páginas**: CommunityActions, Feed
**Componentes**: ActionCard

### **GamificationContext** → Usado en 7+ páginas
**Páginas**: CommunityCalendar, HelpRequests, SharedResources, Projects, LocalBusinesses, Polls, Directory

---

## 📊 FLUJO DE PROPAGACIÓN DE CAMBIOS

### Ejemplo 1: Cambiar avatar del usuario

```
1. Usuario cambia avatar en Settings
   ↓
2. Settings llama a AuthContext.updateUser({ avatar: newAvatar })
   ↓
3. AuthContext actualiza user.avatar
   ↓
4. Se propaga automáticamente a:
   ├── Header (muestra nuevo avatar)
   ├── ProfileHeader (muestra nuevo avatar)
   ├── Post (muestra nuevo avatar en posts del usuario)
   ├── ProfileCard (muestra nuevo avatar)
   └── Todos los componentes que usan useAuth()
```

### Ejemplo 2: Crear un nuevo post

```
1. Usuario crea post en Home
   ↓
2. Home llama a PostsContext.createPost(postData)
   ↓
3. PostsContext:
   ├── Crea el post
   ├── Guarda en storageService
   ├── Crea notificación en NotificationsContext
   └── Actualiza estado de posts
   ↓
4. Se propaga automáticamente a:
   ├── Home (muestra nuevo post)
   ├── Timeline (si es del usuario)
   ├── Feed (si cumple filtros)
   ├── NeighborhoodProfile (si es del vecindario)
   └── UserProfile (si es del usuario)
   ↓
5. NotificationsContext actualiza:
   └── Header (incrementa contador de notificaciones)
```

### Ejemplo 3: Cambiar modo oscuro

```
1. Usuario hace clic en botón de modo oscuro en Header
   ↓
2. Header llama a AppContext.toggleDarkMode()
   ↓
3. AppContext actualiza darkMode
   ↓
4. Se propaga automáticamente a:
   └── Todas las páginas (cambia tema visual)
```

---

## 🔍 CÓDIGO DUPLICADO IDENTIFICADO

### 1. Modales de Creación (Patrón similar)
- CommunityCalendar: showCreateModal
- HelpRequests: showCreateModal, showOfferModal
- Polls: showCreateModal
- **Solución**: Crear componente genérico `<GenericModal>`

### 2. Filtros y Búsqueda (Patrón similar)
- Friends: searchQuery, filter
- Directory: searchQuery, filter
- LocalBusinesses: searchQuery, filter
- **Solución**: Crear componente `<SearchAndFilter>`

### 3. Notificaciones (Ya centralizado)
- Todas las páginas usan showSuccessToast/showErrorToast
- ✅ Ya centralizado en sweetalert.js

---

## ⚠️ RECOMENDACIONES

### Antes de hacer cambios:

1. **En AuthContext**:
   - Verifica qué componentes usan el campo específico
   - Prueba en Header, ProfileHeader, Post
   - Impacto: MUY ALTO

2. **En storageService**:
   - Revisa todos los contextos que lo usan
   - Prueba persistencia en localStorage
   - Impacto: CRÍTICO

3. **En componentes reutilizables (Post, ProfileHeader, Layout)**:
   - Identifica todas las páginas que los usan
   - Prueba en cada página
   - Impacto: ALTO

4. **En contextos de características**:
   - Revisa qué páginas los consumen
   - Prueba en cada página consumidora
   - Impacto: MEDIO-ALTO

### Herramientas de debugging:

```javascript
// Agregar en AuthContext para rastrear cambios
useEffect(() => {
  console.log('🔴 AuthContext - user changed:', user);
}, [user]);

// Agregar en PostsContext para rastrear cambios
useEffect(() => {
  console.log('🟡 PostsContext - posts changed:', posts.length);
}, [posts]);
```

---

## 📋 CHECKLIST ANTES DE HACER CAMBIOS

- [ ] Identificar el archivo a modificar
- [ ] Buscar en este documento qué componentes/páginas lo usan
- [ ] Verificar dependencias (contextos, servicios)
- [ ] Identificar propagación de cambios
- [ ] Probar en todas las páginas afectadas
- [ ] Verificar localStorage si aplica
- [ ] Verificar notificaciones si aplica

---

## 🎯 RESUMEN EJECUTIVO

**Por qué los cambios aparecen en múltiples lugares:**

1. **Context API**: Los contextos se propagan automáticamente a todos sus consumidores
2. **Componentes reutilizables**: Post, ProfileHeader, Layout se usan en múltiples páginas
3. **storageService**: Centraliza toda la persistencia
4. **AuthContext**: Centraliza el usuario actual
5. **NotificationsContext**: Usado por múltiples contextos para crear notificaciones

**Solución**: Este documento te ayuda a identificar ANTES de hacer cambios qué se verá afectado.
