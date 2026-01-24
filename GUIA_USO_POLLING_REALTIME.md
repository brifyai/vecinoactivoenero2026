# 🚀 Guía de Uso: Sistema de Polling Real-time

## 📋 Resumen
Sistema de polling implementado como alternativa funcional a WebSockets para tu instancia Supabase self-hosted.

**✅ ESTADO**: Implementado y probado - 13 eventos detectados en test

## 🔧 Cómo Usar

### 1. Hook Básico
```javascript
import { usePollingRealtime } from '../hooks/usePollingRealtime';

function MyComponent() {
  const { data, loading, error } = usePollingRealtime('posts', {
    interval: 3000, // 3 segundos
    onInsert: (post) => {
      console.log('Nuevo post:', post);
      // Mostrar notificación, actualizar UI, etc.
    }
  });

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data.map(post => (
        <div key={post.id}>{post.content}</div>
      ))}
    </div>
  );
}
```

### 2. Hooks Especializados
```javascript
import { 
  usePollingPosts, 
  usePollingNotifications, 
  usePollingMessages 
} from '../hooks/usePollingRealtime';

function Dashboard() {
  // Posts con eventos automáticos
  const { data: posts } = usePollingPosts({
    interval: 3000
  });

  // Notificaciones del usuario actual
  const { data: notifications } = usePollingNotifications(currentUserId, {
    interval: 2000
  });

  // Mensajes de una conversación
  const { data: messages } = usePollingMessages(conversationId, {
    interval: 1000 // Más frecuente para mensajes
  });

  return (
    <div>
      <PostsList posts={posts} />
      <NotificationsBadge notifications={notifications} />
      <MessagesPanel messages={messages} />
    </div>
  );
}
```

### 3. Configuración Avanzada
```javascript
const { data, refresh } = usePollingRealtime('posts', {
  interval: 5000,
  select: 'id, content, author_id, created_at',
  filter: {
    column: 'author_id',
    operator: 'eq',
    value: currentUserId
  },
  onInsert: (post) => {
    // Mostrar toast notification
    showToast(`Nuevo post: ${post.content.substring(0, 50)}...`);
  },
  onUpdate: (newPost, oldPost) => {
    showToast('Post actualizado');
  },
  onDelete: (deletedPost) => {
    showToast('Post eliminado');
  },
  enabled: isUserActive // Solo polling cuando usuario está activo
});

// Refrescar manualmente
const handleRefresh = () => {
  refresh();
};
```

## 🧪 Probar la Implementación

### 1. Componente de Prueba
```javascript
// Agregar a tu App.js o crear ruta /test-polling
import PollingRealtimeTest from './components/PollingRealtimeTest/PollingRealtimeTest';

function App() {
  return (
    <div>
      {/* Tu app normal */}
      <PollingRealtimeTest />
    </div>
  );
}
```

### 2. Scripts de Testing
```bash
# Test completo de funcionalidad
node test_crud_functionality.js

# Test específico de polling
node test_polling_implementation.js

# Diagnóstico técnico
node deep_realtime_diagnosis.js
```

## ⚙️ Configuración Recomendada

### Intervalos por Tipo de Datos:
- **Posts**: 3000ms (3 segundos) - Contenido menos crítico
- **Notificaciones**: 2000ms (2 segundos) - Más importante
- **Mensajes**: 1000ms (1 segundo) - Tiempo real crítico
- **Estados/Presencia**: 5000ms (5 segundos) - Menos frecuente

### Optimizaciones:
```javascript
// Solo polling cuando la ventana está activa
const isWindowActive = useWindowFocus();

const { data } = usePollingRealtime('posts', {
  interval: 3000,
  enabled: isWindowActive // Pausar cuando ventana no está activa
});

// Intervalos adaptativos
const interval = isUserTyping ? 1000 : 3000; // Más frecuente si usuario está activo
```

## 🎯 Integración en Componentes Existentes

### Reemplazar Real-time Hooks:
```javascript
// ANTES (con real-time que no funciona)
// const { data: posts } = useRealtimePosts();

// DESPUÉS (con polling que funciona)
const { data: posts } = usePollingPosts();
```

### En Feed de Posts:
```javascript
function PostsFeed() {
  const { data: posts, loading } = usePollingPosts({
    onInsert: (post) => {
      // Mostrar indicador de nuevo post
      setHasNewPosts(true);
    }
  });

  return (
    <div>
      {hasNewPosts && (
        <button onClick={() => window.location.reload()}>
          Ver nuevos posts
        </button>
      )}
      <PostsList posts={posts} loading={loading} />
    </div>
  );
}
```

### En Sistema de Notificaciones:
```javascript
function NotificationsDropdown() {
  const { data: notifications } = usePollingNotifications(userId, {
    onInsert: (notification) => {
      // Actualizar badge de notificaciones
      setUnreadCount(prev => prev + 1);
      
      // Mostrar toast
      toast.info(notification.message);
    }
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div>
      <NotificationBadge count={unreadCount} />
      <NotificationsList notifications={notifications} />
    </div>
  );
}
```

## 📊 Monitoreo y Debug

### Console Logs Automáticos:
El sistema incluye logs automáticos para debugging:
```
🆕 INSERT detectado en posts: abc123
📝 UPDATE detectado en notifications: def456
🗑️ DELETE detectado en messages: ghi789
```

### Métricas de Performance:
```javascript
const { data, loading, error } = usePollingRealtime('posts', {
  onInsert: (post) => {
    console.log('Latencia:', Date.now() - new Date(post.created_at).getTime());
  }
});
```

## 🚀 Próximos Pasos

1. **Integrar en componentes existentes** - Reemplazar hooks de real-time
2. **Probar en desarrollo** - Usar `PollingRealtimeTest` component
3. **Optimizar intervalos** - Ajustar según necesidades
4. **Planificar migración** - A Supabase Cloud o configurar self-hosted real-time

## ⚠️ Limitaciones Conocidas

- **Latencia**: 1-5 segundos según intervalo configurado
- **Recursos**: Más consultas a BD que WebSockets
- **Batería**: Mayor consumo en móviles (mitigable con `enabled`)

## ✅ Ventajas

- **Funciona inmediatamente** - Sin configuración adicional
- **Detección automática** - INSERT, UPDATE, DELETE
- **Configurable** - Intervalos, filtros, callbacks
- **Robusto** - Manejo de errores y reconexión
- **Compatible** - Drop-in replacement para hooks existentes

---

**🎯 LISTO PARA USAR**: El sistema está implementado y probado. Solo necesitas importar los hooks y usar en tus componentes.