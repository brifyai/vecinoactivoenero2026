# ✅ Checklist: Activar Firebase Realtime

## 📋 VERIFICACIÓN INICIAL

Ejecuta este comando para verificar que todo el código está listo:

```bash
node scripts/testing/verify-firebase-status.js
```

**Resultado esperado:**
```
✅ TODO EL CÓDIGO DE FIREBASE ESTÁ LISTO ✨
```

---

## 🔥 CONFIGURACIÓN EN FIREBASE CONSOLE

### Paso 1: Crear Colecciones en Firestore (5 min)

- [ ] Abrir Firebase Console: https://console.firebase.google.com/project/stratega-ai-x/firestore
- [ ] Crear base de datos (si es primera vez)
  - [ ] Modo: Producción
  - [ ] Ubicación: southamerica-east1
- [ ] Crear colección: `messages`
  - [ ] Crear documento de ejemplo con campos:
    - [ ] conversationId (string)
    - [ ] senderId (string)
    - [ ] content (string)
    - [ ] timestamp (timestamp)
    - [ ] read (boolean)
- [ ] Crear colección: `notifications`
  - [ ] Crear documento de ejemplo con campos:
    - [ ] userId (string)
    - [ ] type (string)
    - [ ] title (string)
    - [ ] message (string)
    - [ ] timestamp (timestamp)
    - [ ] read (boolean)
- [ ] Crear colección: `posts_realtime`
  - [ ] Crear documento de ejemplo con campos:
    - [ ] userId (string)
    - [ ] content (string)
    - [ ] timestamp (timestamp)
    - [ ] likes_count (number)

**Verificación:** Deberías ver 3 colecciones en el panel izquierdo

---

### Paso 2: Configurar Reglas de Seguridad (2 min)

- [ ] Ir a Firestore > Reglas
- [ ] Copiar reglas de `INSTRUCCIONES_FIREBASE_FINAL.md` (sección Paso 2)
- [ ] Pegar en el editor
- [ ] Hacer clic en "Publicar"
- [ ] Esperar confirmación

**Verificación:** Deberías ver "Reglas publicadas correctamente"

---

### Paso 3: Verificar Cloud Messaging (3 min)

- [ ] Ir a: https://console.firebase.google.com/project/stratega-ai-x/settings/cloudmessaging
- [ ] Buscar sección "Certificados push web"
- [ ] Verificar que existe VAPID key
- [ ] Copiar la clave pública
- [ ] Comparar con `.env`:
  ```
  REACT_APP_FIREBASE_VAPID_KEY=BDlLK81WO-7eNQKen14UupcCbm9pObrlN2YJqtQAHLA_yRUi0rjLS2AS_AMdD_r8xnNIGJ_nHhfH5HrX2khoZBA
  ```
- [ ] Si no coincide, actualizar `.env` y reiniciar servidor

**Verificación:** VAPID key debe existir y coincidir con `.env`

---

## 🧪 TESTING

### Test 1: Iniciar la App

- [ ] Ejecutar: `npm start`
- [ ] Abrir: http://localhost:3000
- [ ] Hacer login

**Verificación:** La app debe iniciar sin errores

---

### Test 2: Verificar Logs en Consola

Abrir consola del navegador (F12) y verificar estos logs:

- [ ] `🔥 Inicializando Firebase con proyecto: stratega-ai-x`
- [ ] `✅ Firebase Messaging inicializado`
- [ ] `🔥 Inicializando Firebase para usuario: [user-id]`
- [ ] `✅ Permisos de notificación concedidos` (o popup pidiendo permisos)
- [ ] `✅ FCM Token obtenido`
- [ ] `🚀 Firebase inicializado completamente`
- [ ] `🎉 Firebase completamente inicializado y listo`

**Verificación:** Todos los logs deben aparecer sin errores

---

### Test 3: Verificar Service Worker

En consola del navegador, ejecutar:

```javascript
navigator.serviceWorker.getRegistrations().then(r => console.log(r))
```

- [ ] Debe aparecer `firebase-messaging-sw.js` en la lista

**Verificación:** Service Worker debe estar registrado

---

### Test 4: Probar Notificaciones

En consola del navegador, ejecutar:

```javascript
Notification.requestPermission()
```

- [ ] Debe aparecer popup pidiendo permisos
- [ ] Hacer clic en "Permitir"
- [ ] Verificar que `Notification.permission === "granted"`

**Verificación:** Permisos de notificación concedidos

---

### Test 5: Página de Testing Firebase

- [ ] Ir a: http://localhost:3000/app/firebase-test
- [ ] Probar enviar mensaje de prueba
- [ ] Probar crear notificación de prueba
- [ ] Verificar que aparecen en Firebase Console

**Verificación:** Mensajes y notificaciones deben crearse en Firestore

---

## 🎯 RESULTADO FINAL

Si todos los checkboxes están marcados:

✅ **Firebase está 100% configurado y funcionando**

Ahora tienes:
- ✅ Mensajes en tiempo real
- ✅ Notificaciones en tiempo real
- ✅ Push notifications
- ✅ Arquitectura híbrida Supabase + Firebase

---

## ⚠️ SI HAY PROBLEMAS

### Error: "Firebase Messaging no disponible"
- Verificar que estás en `localhost` o HTTPS
- Verificar que el navegador soporta service workers

### Error: "No se pudo obtener el token FCM"
- Verificar permisos de notificaciones en el navegador
- Verificar que VAPID key es correcta en `.env`
- Reiniciar servidor después de cambiar `.env`

### Error: "Missing or insufficient permissions"
- Verificar que las reglas de Firestore están publicadas
- Verificar que copiaste las reglas correctamente

### Las colecciones no aparecen
- Verificar que creaste al menos un documento en cada colección
- Refrescar Firebase Console

---

## 📞 DOCUMENTACIÓN

Si necesitas más detalles:

- **Guía paso a paso:** `INSTRUCCIONES_FIREBASE_FINAL.md`
- **Resumen ejecutivo:** `RESUMEN_FIREBASE.md`
- **Arquitectura completa:** `ARQUITECTURA_HIBRIDA_SUPABASE_FIREBASE.md`
- **Estado actual:** `ESTADO_FIREBASE_ACTUAL.md`
- **Trabajo completado:** `TRABAJO_COMPLETADO_FIREBASE.md`

---

**Tiempo estimado total:** 10-15 minutos  
**Última actualización:** Enero 2026
