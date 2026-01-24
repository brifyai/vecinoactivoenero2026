# Paso 6.2: Implementación de Real-time Subscriptions

## Objetivo

Implementar subscriptions de Supabase Realtime para actualizaciones en tiempo real de posts, mensajes y notificaciones.

---

## 🎯 Funcionalidades Real-time

### 1. Posts en Tiempo Real
- Nuevas publicaciones aparecen automáticamente
- Likes y comentarios se actualizan en vivo
- Eliminaciones se reflejan instantáneamente

### 2. Mensajes en Tiempo Real
- Nuevos mensajes llegan sin recargar
- Estado de "escribiendo..." en vivo
- Notificaciones de mensajes leídos

### 3. Notificaciones en Tiempo Real
- Notificaciones aparecen instantáneamente
- Contador de no leídas se actualiza
- Sonido/vibración opcional

---

## 📦 Componente: RealtimeManager

Crear un componente centralizado para manejar todas las subscriptions:

```javascript
// src/components/RealtimeManager/RealtimeManager.js
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../../config/supabase';
import { addNewPost } from '../../store/slices/postsSlice';
import { addNewMessage } from '../../store/slices/messagesSlice';
import { addNewNotification } from '../../store/slices/notificationsSlice';

const RealtimeManager = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const neighborhoodId = user?.neighborhoodId;

  useEffect(() => {
    if (!user || !neighborhoodId) return;

    // Subscription para Posts
    const postsChannel = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `neighborhood_id=eq.${neighborhoodId}`
        },
        (payload) => {
          console.log('New post:', payload.new);
          dispatch(addNewPost(payload.new));
        }
      )
      .subscribe();

    // Subscription para Mensajes
    const messagesChannel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New message:', payload.new);
          dispatch(addNewMessage({
            conversationId: payload.new.conversation_id,
            message: payload.new
          }));
        }
      )
      .subscribe();

    // Subscription para Notificaciones
    const notificationsChannel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification:', payload.new);
          dispatch(addNewNotification(payload.new));
          
          // Opcional: Mostrar notificación del navegador
          if (Notification.permission === 'granted') {
            new Notification('Vecino Activo', {
              body: payload.new.message,
              icon: '/logo192.png'
            });
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user, neighborhoodId, dispatch]);

  return null; // Este componente no renderiza nada
};

export default RealtimeManager;
```

---

## 🔌 Integración en App.js

```javascript
// src/App.js
import React from 'react';
import { useSelector } from 'react-redux';
import RealtimeManager from './components/RealtimeManager/RealtimeManager';
// ... otros imports

function App() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  return (
    <div className="App">
      {/* Solo activar real-time si el usuario está autenticado */}
      {isAuthenticated && <RealtimeManager />}
      
      {/* Resto de la aplicación */}
      <Routes>
        {/* ... rutas */}
      </Routes>
    </div>
  );
}

export default App;
```

---

## 💬 Real-time para Mensajes Específicos

Para conversaciones individuales, crear subscriptions específicas:

```javascript
// src/pages/DirectMessages/DirectMessages.js
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { supabase } from '../../config/supabase';
import { addNewMessage } from '../../store/slices/messagesSlice';

const DirectMessages = () => {
  const { conversationId } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!conversationId) return;

    // Subscription específica para esta conversación
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          dispatch(addNewMessage({
            conversationId,
            message: payload.new
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, dispatch]);

  // ... resto del componente
};
```

---

## 🔔 Notificaciones del Navegador

Solicitar permisos y mostrar notificaciones:

```javascript
// src/utils/notifications.js
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options
    });
  }
};

// Uso en RealtimeManager
import { showNotification } from '../../utils/notifications';

// Cuando llega una notificación
showNotification('Vecino Activo', {
  body: payload.new.message,
  tag: 'notification-' + payload.new.id,
  requireInteraction: false
});
```

---

## 👥 Presencia en Tiempo Real

Mostrar usuarios activos en línea:

```javascript
// src/hooks/usePresence.js
import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export const usePresence = (channelName, userId) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId
        }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).map(key => state[key][0]);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [channelName, userId]);

  return onlineUsers;
};

// Uso en componente
const onlineUsers = usePresence('neighborhood-presence', user.id);
```

---

## ⌨️ Indicador de "Escribiendo..."

```javascript
// src/hooks/useTypingIndicator.js
import { useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

export const useTypingIndicator = (conversationId, userId) => {
  const [typingUsers, setTypingUsers] = useState([]);

  const sendTypingIndicator = useCallback(() => {
    if (!conversationId || !userId) return;

    const channel = supabase.channel(`typing-${conversationId}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: userId, typing: true }
    });

    // Auto-clear después de 3 segundos
    setTimeout(() => {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: userId, typing: false }
      });
    }, 3000);
  }, [conversationId, userId]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`typing-${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, typing } = payload.payload;
        
        if (typing) {
          setTypingUsers(prev => [...new Set([...prev, user_id])]);
        } else {
          setTypingUsers(prev => prev.filter(id => id !== user_id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { typingUsers, sendTypingIndicator };
};

// Uso en componente de chat
const { typingUsers, sendTypingIndicator } = useTypingIndicator(conversationId, user.id);

<input
  type="text"
  onChange={(e) => {
    sendTypingIndicator();
    // ... resto del onChange
  }}
/>

{typingUsers.length > 0 && (
  <div className="typing-indicator">
    {typingUsers.length === 1 ? 'Alguien' : `${typingUsers.length} personas`} escribiendo...
  </div>
)}
```

---

## 🎨 Animaciones para Nuevos Items

```javascript
// src/components/Post/Post.js
import { motion } from 'framer-motion';

const Post = ({ post, isNew }) => {
  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: -20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="post"
    >
      {/* Contenido del post */}
    </motion.div>
  );
};
```

---

## 🔊 Sonidos de Notificación

```javascript
// src/utils/sounds.js
export const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(err => console.log('Error playing sound:', err));
};

// Uso en RealtimeManager
import { playNotificationSound } from '../../utils/sounds';

// Cuando llega una notificación
dispatch(addNewNotification(payload.new));
playNotificationSound();
```

---

## 📊 Monitoreo de Conexión

```javascript
// src/hooks/useRealtimeStatus.js
import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

export const useRealtimeStatus = () => {
  const [status, setStatus] = useState('DISCONNECTED');

  useEffect(() => {
    const channel = supabase.channel('status-check');
    
    channel
      .on('system', {}, (payload) => {
        setStatus(payload.status);
      })
      .subscribe((status) => {
        setStatus(status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return status;
};

// Uso en componente
const realtimeStatus = useRealtimeStatus();

{realtimeStatus !== 'SUBSCRIBED' && (
  <div className="connection-warning">
    Reconectando...
  </div>
)}
```

---

## ⚡ Optimizaciones

### 1. Debounce para Typing Indicator

```javascript
import { debounce } from 'lodash';

const sendTypingIndicator = debounce(() => {
  // ... código de typing indicator
}, 500);
```

### 2. Throttle para Presencia

```javascript
import { throttle } from 'lodash';

const updatePresence = throttle(() => {
  channel.track({ online_at: new Date().toISOString() });
}, 30000); // Cada 30 segundos
```

### 3. Cleanup Automático

```javascript
// Limpiar subscriptions cuando el usuario sale
window.addEventListener('beforeunload', () => {
  supabase.removeAllChannels();
});
```

---

## 🧪 Testing

### Test de Subscriptions

```javascript
describe('Realtime Subscriptions', () => {
  it('should receive new posts', (done) => {
    const channel = supabase
      .channel('test-posts')
      .on('postgres_changes', { event: 'INSERT', table: 'posts' }, (payload) => {
        expect(payload.new).toBeDefined();
        done();
      })
      .subscribe();

    // Crear un post de prueba
    supabasePostsService.createPost({...});
  });
});
```

---

## ✅ Checklist de Implementación

- [ ] Crear componente RealtimeManager
- [ ] Integrar en App.js
- [ ] Implementar subscription de posts
- [ ] Implementar subscription de mensajes
- [ ] Implementar subscription de notificaciones
- [ ] Solicitar permisos de notificaciones del navegador
- [ ] Implementar notificaciones del navegador
- [ ] Implementar presencia (usuarios en línea)
- [ ] Implementar typing indicator
- [ ] Agregar animaciones para nuevos items
- [ ] Agregar sonidos de notificación
- [ ] Implementar monitoreo de conexión
- [ ] Optimizar con debounce/throttle
- [ ] Testing de subscriptions
- [ ] Documentar uso

---

## 🚨 Troubleshooting

### Subscriptions no funcionan
**Solución:** Verificar que Realtime esté habilitado en Supabase Dashboard

### Múltiples notificaciones duplicadas
**Solución:** Usar `tag` en notificaciones del navegador para evitar duplicados

### Alto consumo de recursos
**Solución:** Implementar throttle y cleanup adecuado

### Conexión se pierde
**Solución:** Implementar reconexión automática

---

**Siguiente:** Paso 6.3 - Testing y Validación
