# Guía Paso a Paso: Configuración Firebase

## 📋 Checklist Rápido

- [ ] Paso 1: Acceder a Firebase Console
- [ ] Paso 2: Crear colecciones en Firestore
- [ ] Paso 3: Configurar reglas de seguridad
- [ ] Paso 4: Verificar Cloud Messaging
- [ ] Paso 5: Probar la configuración

---

## Paso 1: Acceder a Firebase Console

### 1.1 Abrir Firebase Console
1. Ve a: https://console.firebase.google.com/
2. Inicia sesión con tu cuenta de Google
3. Selecciona el proyecto: **stratega-ai-x**

### 1.2 Verificar que estás en el proyecto correcto
- En la parte superior deberías ver: "stratega-ai-x"
- Si no lo ves, haz clic en el selector de proyectos y búscalo

---

## Paso 2: Crear Colecciones en Firestore

### 2.1 Ir a Firestore Database
1. En el menú lateral izquierdo, busca **"Firestore Database"**
2. Haz clic en **"Firestore Database"**
3. Si es la primera vez, haz clic en **"Crear base de datos"**
4. Selecciona **"Modo de producción"** (cambiaremos las reglas después)
5. Elige la ubicación: **us-central** (o la más cercana a Chile: southamerica-east1)
6. Haz clic en **"Habilitar"**

### 2.2 Crear Colección: messages

1. Haz clic en **"Iniciar colección"**
2. ID de colección: `messages`
3. Haz clic en **"Siguiente"**
4. Crear primer documento (ejemplo):
   - ID del documento: `demo_message`
   - Campos:
     ```
     conversation_id: "demo_conv_001" (string)
     sender_id: "user_001" (string)
     content: "Hola, este es un mensaje de prueba" (string)
     created_at: [Timestamp actual] (timestamp)
     read: false (boolean)
     ```
5. Haz clic en **"Guardar"**

### 2.3 Crear Colección: notifications

1. Haz clic en **"Iniciar colección"** (botón + arriba)
2. ID de colección: `notifications`
3. Haz clic en **"Siguiente"**
4. Crear primer documento (ejemplo):
   - ID del documento: `demo_notification`
   - Campos:
     ```
     user_id: "user_001" (string)
     type: "message" (string)
     title: "Nuevo mensaje" (string)
     message: "Tienes un nuevo mensaje de tu vecino" (string)
     created_at: [Timestamp actual] (timestamp)
     read: false (boolean)
     data: {} (map - dejar vacío)
     ```
5. Haz clic en **"Guardar"**

### 2.4 Crear Colección: posts_realtime

1. Haz clic en **"Iniciar colección"**
2. ID de colección: `posts_realtime`
3. Haz clic en **"Siguiente"**
4. Crear primer documento (ejemplo):
   - ID del documento: `demo_post`
   - Campos:
     ```
     user_id: "user_001" (string)
     content: "¡Hola vecinos! Este es un post de prueba" (string)
     created_at: [Timestamp actual] (timestamp)
     likes_count: 0 (number)
     comments_count: 0 (number)
     ```
5. Haz clic en **"Guardar"**

✅ **Verificación**: Deberías ver 3 colecciones en el panel izquierdo:
- messages
- notifications
- posts_realtime

---

## Paso 3: Configurar Reglas de Seguridad

### 3.1 Ir a Reglas de Firestore
1. En Firestore Database, haz clic en la pestaña **"Reglas"** (arriba)
2. Verás un editor de código

### 3.2 Reemplazar las reglas

**IMPORTANTE**: Copia y pega EXACTAMENTE este código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper para verificar autenticación
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Función helper para verificar si es el propietario
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // ========================================
    // COLECCIÓN: messages
    // ========================================
    match /messages/{messageId} {
      // Cualquier usuario autenticado puede leer mensajes
      allow read: if isSignedIn();
      
      // Cualquier usuario autenticado puede crear mensajes
      allow create: if isSignedIn() && 
                       request.resource.data.sender_id == request.auth.uid;
      
      // Solo el remitente puede actualizar su mensaje
      allow update: if isSignedIn() && 
                       resource.data.sender_id == request.auth.uid;
      
      // Solo el remitente puede eliminar su mensaje
      allow delete: if isSignedIn() && 
                       resource.data.sender_id == request.auth.uid;
    }
    
    // ========================================
    // COLECCIÓN: notifications
    // ========================================
    match /notifications/{notificationId} {
      // Solo el usuario puede leer sus propias notificaciones
      allow read: if isSignedIn() && 
                     resource.data.user_id == request.auth.uid;
      
      // Cualquier usuario autenticado puede crear notificaciones
      allow create: if isSignedIn();
      
      // Solo el usuario puede actualizar sus notificaciones (marcar como leída)
      allow update: if isSignedIn() && 
                       resource.data.user_id == request.auth.uid;
      
      // Solo el usuario puede eliminar sus notificaciones
      allow delete: if isSignedIn() && 
                       resource.data.user_id == request.auth.uid;
    }
    
    // ========================================
    // COLECCIÓN: posts_realtime
    // ========================================
    match /posts_realtime/{postId} {
      // Todos pueden leer posts (incluso no autenticados)
      allow read: if true;
      
      // Solo usuarios autenticados pueden crear posts
      allow create: if isSignedIn() && 
                       request.resource.data.user_id == request.auth.uid;
      
      // Solo el autor puede actualizar su post
      allow update: if isSignedIn() && 
                       resource.data.user_id == request.auth.uid;
      
      // Solo el autor puede eliminar su post
      allow delete: if isSignedIn() && 
                       resource.data.user_id == request.auth.uid;
    }
    
    // ========================================
    // COLECCIÓN: presence (estado de usuarios)
    // ========================================
    match /presence/{userId} {
      // Todos pueden leer el estado de presencia
      allow read: if true;
      
      // Solo el usuario puede actualizar su propio estado
      allow write: if isSignedIn() && userId == request.auth.uid;
    }
  }
}
```

### 3.3 Publicar las reglas
1. Haz clic en **"Publicar"** (botón azul arriba a la derecha)
2. Espera la confirmación: "Reglas publicadas correctamente"

✅ **Verificación**: Las reglas deberían estar activas sin errores

---

## Paso 4: Verificar Cloud Messaging

### 4.1 Ir a Cloud Messaging
1. En el menú lateral, busca **"Messaging"** o **"Cloud Messaging"**
2. Si no lo ves, ve a **"Configuración del proyecto"** (ícono de engranaje arriba)
3. Haz clic en la pestaña **"Cloud Messaging"**

### 4.2 Verificar VAPID Key
1. Busca la sección **"Certificados push web"** o **"Web Push certificates"**
2. Deberías ver un par de claves
3. Copia la **"Clave pública"** (Key pair)
4. Verifica que coincida con la que tienes en `.env`:
   ```
   REACT_APP_FIREBASE_VAPID_KEY=BDlLK81WO-7eNQKen14UupcCbm9pObrlN2YJqtQAHLA_yRUi0rjLS2AS_AMdD_r8xnNIGJ_nHhfH5HrX2khoZBA
   ```

### 4.3 Si no existe VAPID Key
1. Haz clic en **"Generar par de claves"**
2. Copia la clave generada
3. Actualiza tu archivo `.env` con la nueva clave

✅ **Verificación**: Deberías tener una VAPID key válida

---

## Paso 5: Probar la Configuración

### 5.1 Crear script de prueba

Crea un archivo `scripts/test-firebase-setup.js`:

```javascript
const admin = require('firebase-admin');

// Inicializar Firebase Admin (necesitas el service account key)
// Descárgalo desde: Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testFirebaseSetup() {
  console.log('🧪 Probando configuración de Firebase...\n');
  
  try {
    // Test 1: Leer colecciones
    console.log('📚 Test 1: Verificando colecciones...');
    
    const collections = ['messages', 'notifications', 'posts_realtime'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).limit(1).get();
      console.log(`  ✅ ${collectionName}: ${snapshot.size} documentos`);
    }
    
    // Test 2: Crear documento de prueba
    console.log('\n📝 Test 2: Creando documento de prueba...');
    
    const testDoc = await db.collection('posts_realtime').add({
      user_id: 'test_user',
      content: 'Post de prueba desde script',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      likes_count: 0,
      comments_count: 0
    });
    
    console.log(`  ✅ Documento creado: ${testDoc.id}`);
    
    // Test 3: Leer documento
    console.log('\n📖 Test 3: Leyendo documento...');
    
    const doc = await testDoc.get();
    console.log(`  ✅ Documento leído:`, doc.data());
    
    // Test 4: Eliminar documento de prueba
    console.log('\n🗑️  Test 4: Eliminando documento de prueba...');
    
    await testDoc.delete();
    console.log(`  ✅ Documento eliminado`);
    
    console.log('\n✅ ¡Todos los tests pasaron! Firebase está configurado correctamente.\n');
    
  } catch (error) {
    console.error('\n❌ Error en los tests:', error);
  }
  
  process.exit(0);
}

testFirebaseSetup();
```

### 5.2 Descargar Service Account Key

1. Ve a **Configuración del proyecto** (engranaje arriba)
2. Pestaña **"Cuentas de servicio"**
3. Haz clic en **"Generar nueva clave privada"**
4. Se descargará un archivo JSON
5. Guárdalo como `scripts/serviceAccountKey.json`
6. **IMPORTANTE**: Agrega este archivo a `.gitignore`

### 5.3 Ejecutar el script

```bash
cd scripts
npm install firebase-admin
node test-firebase-setup.js
```

✅ **Resultado esperado**:
```
🧪 Probando configuración de Firebase...

📚 Test 1: Verificando colecciones...
  ✅ messages: 1 documentos
  ✅ notifications: 1 documentos
  ✅ posts_realtime: 1 documentos

📝 Test 2: Creando documento de prueba...
  ✅ Documento creado: abc123xyz

📖 Test 3: Leyendo documento...
  ✅ Documento leído: { user_id: 'test_user', content: '...', ... }

🗑️  Test 4: Eliminando documento de prueba...
  ✅ Documento eliminado

✅ ¡Todos los tests pasaron! Firebase está configurado correctamente.
```

---

## 🎉 ¡Configuración Completa!

Si llegaste hasta aquí y todos los tests pasaron, tu Firebase está 100% configurado.

### Próximos pasos:

1. **Probar en la app**:
   ```bash
   npm start
   ```

2. **Verificar en consola del navegador**:
   - Deberías ver: `🔥 Inicializando Firebase con proyecto: stratega-ai-x`
   - Deberías ver: `✅ Firebase Messaging inicializado`

3. **Solicitar permisos de notificaciones**:
   - La app debería pedir permisos automáticamente
   - Si no, abre la consola y ejecuta:
     ```javascript
     Notification.requestPermission()
     ```

4. **Verificar FCM Token**:
   - En la consola debería aparecer: `✅ FCM Token obtenido`

---

## 🐛 Solución de Problemas

### Error: "Missing or insufficient permissions"
**Causa**: Las reglas de Firestore están muy restrictivas
**Solución**: Verifica que copiaste las reglas correctamente en el Paso 3

### Error: "Firebase Messaging is not supported"
**Causa**: Estás en HTTP (no HTTPS) o el navegador no soporta service workers
**Solución**: Usa `localhost` o HTTPS

### Error: "Failed to register service worker"
**Causa**: El service worker no está en la carpeta `public`
**Solución**: Verifica que `public/firebase-messaging-sw.js` existe

### Las colecciones no aparecen
**Causa**: No se crearon correctamente
**Solución**: Repite el Paso 2, asegúrate de crear al menos un documento en cada colección

---

## 📞 Soporte

Si tienes problemas:
1. Verifica los logs en la consola del navegador
2. Verifica los logs en Firebase Console > Firestore > Uso
3. Revisa el archivo `CONFIGURACION_FIREBASE_COMPLETA.md`

---

**Última actualización**: Enero 2026
**Tiempo estimado**: 15-20 minutos
