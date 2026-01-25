# 🚀 Setup Completo: Firebase + Supabase

## 📋 PASO 1: Configurar Supabase (OBLIGATORIO)

### 1.1 Ejecutar esquema de base de datos
Ve a tu Supabase Dashboard: https://supabase.vecinoactivo.cl
- Accede al **SQL Editor**
- Ejecuta **TODO** el contenido de `database_schema.sql`
- Luego ejecuta `database_functions.sql`

### 1.2 Crear usuario administrador
Ejecuta uno de estos archivos en el SQL Editor:
```sql
-- Opción 1: Usuario básico
-- Contenido de create_admin_user.sql

-- Opción 2: Usuario completo
-- Contenido de crear_usuario_auth_admin.sql
```

### 1.3 Verificar tablas creadas
Deberías ver estas tablas en **Table Editor**:
- ✅ users, posts, comments, reactions
- ✅ notifications, friendships, conversations, messages
- ✅ events, groups, projects (con sus tablas relacionadas)
- ✅ local_businesses, help_requests, shared_resources, polls

## 📋 PASO 2: Configurar Firebase (OBLIGATORIO)

### 2.1 Crear proyecto Firebase
1. Ve a https://console.firebase.google.com
2. Crea nuevo proyecto: "vecino-activo"
3. Habilita Google Analytics (opcional)

### 2.2 Configurar Firestore
1. Ve a **Firestore Database**
2. Crear base de datos en modo **producción**
3. Selecciona región: **us-central1** (más barata)

### 2.3 Configurar Firebase Cloud Messaging
1. Ve a **Project Settings** > **Cloud Messaging**
2. Generar **Web Push certificates**
3. Copiar **VAPID key**

### 2.4 Obtener credenciales
En **Project Settings** > **General** > **Your apps**:
1. Agregar app web
2. Copiar configuración:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "vecino-activo.firebaseapp.com",
  projectId: "vecino-activo",
  storageBucket: "vecino-activo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 2.5 Actualizar variables de entorno
Edita tu archivo `.env`:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=tu-api-key-aqui
REACT_APP_FIREBASE_AUTH_DOMAIN=vecino-activo.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=vecino-activo
REACT_APP_FIREBASE_STORAGE_BUCKET=vecino-activo.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
REACT_APP_FIREBASE_APP_ID=tu-app-id
REACT_APP_FIREBASE_VAPID_KEY=tu-vapid-key
```

### 2.6 Configurar reglas de Firestore
En **Firestore** > **Rules**, pega estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Mensajes: solo participantes pueden leer/escribir
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid == resource.data.receiverId);
    }
    
    // Conversaciones: solo participantes
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Notificaciones: solo el usuario propietario
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Tokens FCM: solo el usuario propietario
    match /fcmTokens/{tokenId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 📋 PASO 3: Actualizar Service Worker

### 3.1 Actualizar firebase-messaging-sw.js
Edita `public/firebase-messaging-sw.js` con tus credenciales reales:

```javascript
const firebaseConfig = {
  apiKey: "tu-api-key-real",
  authDomain: "vecino-activo.firebaseapp.com",
  projectId: "vecino-activo",
  storageBucket: "vecino-activo.appspot.com",
  messagingSenderId: "tu-sender-id-real",
  appId: "tu-app-id-real"
};
```

## 📋 PASO 4: Testing

### 4.1 Verificar conexión Supabase
```bash
npm start
```
- Ve a http://localhost:3000
- Intenta hacer login con el usuario admin creado
- Verifica que puedes ver posts, eventos, etc.

### 4.2 Verificar conexión Firebase
Abre **Developer Tools** > **Console**
Deberías ver:
```
Firebase inicializado correctamente
FCM Token obtenido: [token]
Servicio de notificaciones inicializado
```

### 4.3 Test de mensajería
1. Crea dos usuarios diferentes
2. Envía mensaje entre ellos
3. Verifica que aparece instantáneamente
4. Verifica notificación push

## 📋 PASO 5: Despliegue

### 5.1 Variables de producción
Actualiza `.env.production`:

```env
REACT_APP_FIREBASE_API_KEY=tu-api-key-produccion
REACT_APP_FIREBASE_AUTH_DOMAIN=vecino-activo.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=vecino-activo
# ... resto de variables
```

### 5.2 Build y deploy
```bash
npm run build
# Subir a tu servidor
```

## 🔧 Troubleshooting

### Error: "Firebase not initialized"
- Verifica que las variables de entorno estén correctas
- Revisa la consola del navegador

### Error: "Firestore permission denied"
- Verifica las reglas de Firestore
- Asegúrate de que el usuario esté autenticado

### Error: "FCM token not generated"
- Verifica que el VAPID key esté correcto
- Asegúrate de que el service worker esté registrado

### Error: "Supabase connection failed"
- Verifica que el esquema de BD esté ejecutado
- Revisa las credenciales de Supabase

## ✅ Checklist Final

- [ ] Supabase: Esquema de BD ejecutado
- [ ] Supabase: Usuario admin creado
- [ ] Firebase: Proyecto creado
- [ ] Firebase: Firestore configurado
- [ ] Firebase: FCM configurado
- [ ] Variables de entorno actualizadas
- [ ] Service worker actualizado
- [ ] Reglas de Firestore configuradas
- [ ] Testing local exitoso
- [ ] Build de producción exitoso

## 🎯 Resultado Esperado

Una vez completado, tendrás:
- ✅ Mensajería instantánea (0 latencia)
- ✅ Notificaciones push nativas
- ✅ Base de datos completa en Supabase
- ✅ Tiempo real sin polling
- ✅ Arquitectura escalable y profesional

**Costo estimado: $5-15/mes para 1000 usuarios activos**