# Configuración Firebase - Vecino Activo

## ✅ Estado Actual

### Variables de Entorno Configuradas
Todas las variables de Firebase están correctamente configuradas en `.env`:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSyBZQYW7aRY1o07IW3NwCXY-v6Q85mMCCNU
REACT_APP_FIREBASE_AUTH_DOMAIN=stratega-ai-x.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://stratega-ai-x-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=stratega-ai-x
REACT_APP_FIREBASE_STORAGE_BUCKET=stratega-ai-x.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=777409222994
REACT_APP_FIREBASE_APP_ID=1:777409222994:web:4b23f04e44e4a38aca428b
REACT_APP_FIREBASE_VAPID_KEY=BDlLK81WO-7eNQKen14UupcCbm9pObrlN2YJqtQAHLA_yRUi0rjLS2AS_AMdD_r8xnNIGJ_nHhfH5HrX2khoZBA
```

### Archivos Configurados

1. **`src/config/firebase.js`** ✅
   - Inicializa Firebase con las variables de entorno
   - Configura Firestore, Auth y Messaging
   - Exporta funciones para FCM tokens

2. **`public/firebase-messaging-sw.js`** ✅
   - Service Worker para notificaciones en background
   - Maneja clicks en notificaciones
   - Logs mejorados para debugging

3. **`.env`** ✅
   - Todas las variables necesarias configuradas
   - Proyecto: `stratega-ai-x`

## 🔧 Próximos Pasos para Activar Realtime

### 1. Configurar Firestore en Firebase Console

Ve a [Firebase Console](https://console.firebase.google.com/project/stratega-ai-x/firestore) y crea estas colecciones:

#### Colección: `messages`
```javascript
{
  id: string,
  conversation_id: string,
  sender_id: string,
  content: string,
  created_at: timestamp,
  read: boolean
}
```

#### Colección: `notifications`
```javascript
{
  id: string,
  user_id: string,
  type: string,
  title: string,
  message: string,
  created_at: timestamp,
  read: boolean,
  data: object
}
```

#### Colección: `posts_realtime`
```javascript
{
  id: string,
  user_id: string,
  content: string,
  created_at: timestamp,
  likes_count: number,
  comments_count: number
}
```

### 2. Configurar Reglas de Seguridad en Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Mensajes - solo el remitente y destinatario pueden leer
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Notificaciones - solo el usuario puede leer sus notificaciones
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
                     resource.data.user_id == request.auth.uid;
      allow write: if request.auth != null;
    }
    
    // Posts - todos pueden leer, solo autenticados pueden escribir
    match /posts_realtime/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Habilitar Cloud Messaging en Firebase Console

1. Ve a [Cloud Messaging](https://console.firebase.google.com/project/stratega-ai-x/settings/cloudmessaging)
2. Verifica que el VAPID key esté configurado
3. Si no existe, genera uno nuevo y actualiza `.env`

### 4. Probar Notificaciones

Abre la consola del navegador y ejecuta:

```javascript
// Solicitar permisos de notificación
Notification.requestPermission().then(permission => {
  console.log('Permiso de notificaciones:', permission);
});

// Obtener FCM token
import { getFCMToken } from './config/firebase';
getFCMToken().then(token => {
  console.log('FCM Token:', token);
});
```

## 📊 Verificación

### Logs Esperados en Consola

Cuando la app inicia correctamente, deberías ver:

```
🔥 Inicializando Firebase con proyecto: stratega-ai-x
✅ Firebase Messaging inicializado
✅ FCM Token obtenido
```

### Service Worker

Verifica que el service worker esté registrado:

```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

Deberías ver `firebase-messaging-sw.js` en la lista.

## 🐛 Troubleshooting

### Error: "Firebase Messaging no disponible"
**Solución**: Verifica que estés en HTTPS o localhost

### Error: "No se pudo obtener el token FCM"
**Solución**: 
1. Verifica permisos de notificaciones en el navegador
2. Verifica que el VAPID key sea correcto
3. Verifica que el service worker esté registrado

### Error: "Notification permission denied"
**Solución**: 
1. Ve a configuración del navegador
2. Busca el sitio en permisos
3. Habilita notificaciones

## 🔄 Sincronización Supabase ↔ Firebase

Actualmente la sincronización NO está implementada. Opciones:

### Opción A: Sincronización en Frontend (Recomendado para MVP)
Cuando creas un post/mensaje en Supabase, también lo creas en Firebase:

```javascript
// Crear en Supabase
const { data } = await supabase.from('posts').insert(post);

// Sincronizar a Firebase
await addDoc(collection(db, 'posts_realtime'), {
  ...data,
  synced_at: serverTimestamp()
});
```

### Opción B: Cloud Functions (Producción)
Crear Firebase Cloud Functions que escuchen cambios en Supabase y sincronicen automáticamente.

### Opción C: Webhooks
Configurar webhooks en Supabase que llamen a Firebase cuando hay cambios.

## 📝 Notas

- Firebase está configurado para el proyecto `stratega-ai-x`
- El service worker maneja notificaciones en background
- Las credenciales están en `.env` y NO deben subirse a Git público
- El VAPID key es necesario para push notifications

## ✅ Checklist de Configuración

- [x] Variables de entorno configuradas
- [x] Firebase inicializado en el código
- [x] Service Worker configurado
- [ ] Colecciones creadas en Firestore
- [ ] Reglas de seguridad configuradas
- [ ] Cloud Messaging habilitado
- [ ] Permisos de notificaciones solicitados
- [ ] Sincronización Supabase ↔ Firebase implementada

---

**Última actualización**: Enero 2026
**Proyecto Firebase**: stratega-ai-x
