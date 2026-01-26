# 🔥 GUÍA PASO A PASO: CONFIGURAR FIREBASE

## 📋 PASO 1: ACCEDER A FIREBASE CONSOLE

1. **Abre tu navegador** y ve a: https://console.firebase.google.com
2. **Inicia sesión** con tu cuenta de Google
3. Verás la pantalla principal de Firebase Console

---

## 🆕 PASO 2: CREAR O SELECCIONAR PROYECTO

### **Opción A: Crear Nuevo Proyecto**
1. Haz clic en **"Crear un proyecto"** (botón azul grande)
2. **Nombre del proyecto**: `vecino-activo` (o el nombre que prefieras)
3. Haz clic en **"Continuar"**
4. **Google Analytics**: Puedes deshabilitarlo por ahora (opcional)
5. Haz clic en **"Crear proyecto"**
6. Espera a que se cree (1-2 minutos)
7. Haz clic en **"Continuar"**

### **Opción B: Usar Proyecto Existente**
1. Haz clic en el proyecto que quieras usar
2. Serás llevado al dashboard del proyecto

---

## 🔧 PASO 3: CONFIGURAR FIRESTORE DATABASE

1. **En el menú lateral izquierdo**, busca **"Firestore Database"**
2. Haz clic en **"Firestore Database"**
3. Haz clic en **"Crear base de datos"**
4. **Modo de seguridad**: Selecciona **"Comenzar en modo de prueba"**
   ```
   ⚠️ IMPORTANTE: Esto permite lectura/escritura por 30 días
   ```
5. **Ubicación**: Selecciona la más cercana (ej: `us-central1`)
6. Haz clic en **"Listo"**
7. Espera a que se cree la base de datos

---

## 📱 PASO 4: CONFIGURAR CLOUD MESSAGING

1. **En el menú lateral izquierdo**, busca **"Messaging"**
2. Haz clic en **"Messaging"**
3. Si es la primera vez, verás **"Comenzar"**
4. Haz clic en **"Comenzar"**
5. **Acepta los términos** si aparecen
6. Ya tienes Cloud Messaging habilitado ✅

---

## 🔑 PASO 5: OBTENER CREDENCIALES DEL PROYECTO

1. **En el menú lateral izquierdo**, haz clic en **⚙️ "Configuración del proyecto"**
2. En la pestaña **"General"**, baja hasta **"Tus aplicaciones"**
3. Haz clic en **"</> Web"** (ícono de código)
4. **Nombre de la aplicación**: `vecino-activo-web`
5. **NO marques** "También configura Firebase Hosting"
6. Haz clic en **"Registrar aplicación"**
7. **COPIA EL CÓDIGO** que aparece, se ve así:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "tu-proyecto.firebaseapp.com",
     projectId: "tu-proyecto",
     storageBucket: "tu-proyecto.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
8. Haz clic en **"Continuar a la consola"**

---

## 🔔 PASO 6: GENERAR VAPID KEY (PARA PUSH NOTIFICATIONS)

1. **Todavía en "Configuración del proyecto"**
2. Ve a la pestaña **"Cloud Messaging"**
3. Baja hasta **"Configuración web"**
4. En **"Certificados de clave web push"**, haz clic en **"Generar par de claves"**
5. **COPIA LA CLAVE** que aparece (empieza con `B...`)
6. Esta es tu **VAPID KEY**

---

## 📝 PASO 7: ACTUALIZAR .env.local

Ahora actualiza tu archivo `.env.local` con los valores reales:

```env
# Firebase Configuration (REEMPLAZA CON TUS VALORES REALES)
REACT_APP_FIREBASE_API_KEY=AIzaSyC_tu_api_key_aqui
REACT_APP_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=tu-proyecto-id
REACT_APP_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123def456
REACT_APP_FIREBASE_VAPID_KEY=BNdJ5v4GahTuJ0Ak1rNX...tu_vapid_key_aqui

# El resto mantenerlo igual
REACT_APP_USE_HYBRID_REALTIME=true
REACT_APP_ENABLE_FIREBASE_SYNC=true
REACT_APP_ENABLE_POLLING_FALLBACK=true
```

---

## 🔍 DÓNDE ENCONTRAR CADA OPCIÓN

### **Si no encuentras "Firestore Database":**
- Busca en el menú lateral: **"Build"** → **"Firestore Database"**
- O busca: **"Crear"** → **"Firestore Database"**

### **Si no encuentras "Messaging":**
- Busca en el menú lateral: **"Engage"** → **"Messaging"**
- O busca: **"Participación"** → **"Messaging"**

### **Si no encuentras "Configuración del proyecto":**
- Busca el ícono de **engranaje ⚙️** en el menú lateral
- Está generalmente en la parte superior del menú

### **Si no ves "Cloud Messaging" en configuración:**
- Asegúrate de estar en la pestaña **"Cloud Messaging"**
- Si no aparece, ve primero a **"Messaging"** en el menú lateral

---

## ✅ VERIFICAR QUE TODO ESTÉ CONFIGURADO

### **Checklist:**
- [ ] Proyecto creado en Firebase
- [ ] Firestore Database creado (modo prueba)
- [ ] Cloud Messaging habilitado
- [ ] Aplicación web registrada
- [ ] Credenciales copiadas
- [ ] VAPID Key generada
- [ ] .env.local actualizado

### **Probar configuración:**
```bash
# Reiniciar aplicación
npm start

# Ir a pruebas híbridas
# http://localhost:3000/hybrid-test

# Debe mostrar: "🟢 Conectado" en lugar de "🔴 Error"
```

---

## 🚨 PROBLEMAS COMUNES

### **"No puedo crear Firestore Database"**
- Asegúrate de que el proyecto esté completamente creado
- Espera 1-2 minutos después de crear el proyecto
- Refresca la página

### **"No aparece Cloud Messaging"**
- Ve primero a "Messaging" en el menú lateral
- Haz clic en "Comenzar" si aparece
- Luego ve a Configuración del proyecto

### **"No puedo generar VAPID Key"**
- Asegúrate de haber registrado una aplicación web primero
- Ve a Configuración → Cloud Messaging
- Busca "Certificados de clave web push"

### **"Las credenciales no funcionan"**
- Verifica que copiaste TODO el objeto firebaseConfig
- Asegúrate de no tener espacios extra
- Verifica que el VAPID Key esté completo

---

## 📞 ¿NECESITAS AYUDA?

Si sigues teniendo problemas:

1. **Toma una captura de pantalla** de lo que ves en Firebase Console
2. **Dime exactamente** en qué paso te quedaste
3. **Comparte el error** que aparece (si hay alguno)

**¡Te ayudo a resolverlo paso a paso!**

---

*Guía actualizada: Enero 2026*