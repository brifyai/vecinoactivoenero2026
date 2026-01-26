# 🚀 Configuración del Sistema de Envío de Campañas

## ✅ Estado Actual

El sistema de envío de campañas está **completamente implementado** con los siguientes servicios:

- ✅ **Brevo** (Emails) - Implementado
- ✅ **Firebase Cloud Messaging** (Push) - Implementado
- ✅ **Twilio** (WhatsApp) - Implementado
- ✅ **Campaign Sender Service** (Orquestador) - Implementado
- ✅ **Integración con Redux** - Completada
- ✅ **Dependencias instaladas** - @sendinblue/client, twilio

---

## 📋 Pasos para Activar el Sistema

### 1️⃣ Configurar Brevo (Emails)

**a) Crear cuenta:**
1. Ir a https://www.brevo.com/
2. Registrarse (plan gratuito: 300 emails/día)
3. Verificar email

**b) Obtener API Key:**
1. Ir a **Settings** → **SMTP & API** → **API Keys**
2. Click en **Create a new API key**
3. Copiar la key (formato: `xkeysib-xxxxxxxxxxxxx`)

**c) Agregar a .env:**
```env
REACT_APP_BREVO_API_KEY=xkeysib-tu-api-key-aqui
```

---

### 2️⃣ Configurar Firebase (Push Notifications)

**a) Obtener VAPID Key:**
1. Ir a Firebase Console → Tu proyecto
2. **Project Settings** → **Cloud Messaging**
3. En **Web Push certificates**, click **Generate key pair**
4. Copiar la key generada

**b) Agregar a .env:**
```env
REACT_APP_FIREBASE_VAPID_KEY=tu-vapid-key-aqui
```

**c) Actualizar Service Worker:**
El archivo `public/firebase-messaging-sw.js` ya está configurado.

---

### 3️⃣ Configurar Twilio (WhatsApp)

**IMPORTANTE**: WhatsApp requiere un servidor backend ya que Twilio no puede ejecutarse en el navegador.

**a) Crear cuenta:**
1. Ir a https://www.twilio.com/
2. Registrarse (incluye $15 de crédito gratis)
3. Verificar teléfono

**b) Obtener credenciales:**
1. Ir a **Console** → **Account** → **API Keys & Tokens**
2. Copiar:
   - **Account SID**
   - **Auth Token**

**c) Activar WhatsApp Sandbox:**
1. Ir a **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Seguir instrucciones para unirse al sandbox
3. Enviar mensaje "join [sandbox-name]" al número de Twilio

**d) Agregar a .env (raíz del proyecto):**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu-auth-token-aqui
TWILIO_WHATSAPP_NUMBER=+14155238886
WHATSAPP_SERVER_PORT=3001
```

**e) Agregar a .env del frontend:**
```env
REACT_APP_BACKEND_URL=http://localhost:3001
```

**f) Instalar dependencias del servidor:**
```bash
cd server
npm install
```

**g) Iniciar servidor WhatsApp:**
```bash
cd server
npm run whatsapp
```

El servidor estará disponible en `http://localhost:3001`

---

### 4️⃣ Crear Tabla de Device Tokens (Opcional para Push)

Para push notifications, necesitas guardar los tokens de dispositivos:

```sql
-- Ejecutar en Supabase SQL Editor
CREATE TABLE IF NOT EXISTS user_device_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT, -- 'web', 'ios', 'android'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_user_device_tokens_user_id ON user_device_tokens(user_id);
```

---

### 5️⃣ Reiniciar el Servidor

Después de configurar las variables de entorno:

```bash
# Detener el servidor (Ctrl+C)
# Reiniciar
npm start
```

---

## 🧪 Probar el Sistema

### Test 1: Verificar Servicios

Crear un archivo de prueba `scripts/testing/test_campaign_services.js`:

```javascript
import emailService from '../src/services/emailService';
import pushNotificationService from '../src/services/pushNotificationService';
import whatsappService from '../src/services/whatsappService';

async function testServices() {
  console.log('🧪 Probando servicios de campaña...\n');
  
  // Test Email
  console.log('📧 Probando Email Service...');
  const emailStatus = await emailService.checkStatus();
  console.log('Email:', emailStatus);
  
  // Test Push
  console.log('\n🔔 Probando Push Service...');
  const pushStatus = await pushNotificationService.checkStatus();
  console.log('Push:', pushStatus);
  
  // Test WhatsApp
  console.log('\n💬 Probando WhatsApp Service...');
  const whatsappStatus = await whatsappService.checkStatus();
  console.log('WhatsApp:', whatsappStatus);
}

testServices();
```

### Test 2: Enviar Email de Prueba

```javascript
import emailService from '../src/services/emailService';

async function testEmail() {
  const result = await emailService.sendEmail({
    to: 'tu-email@test.com',
    subject: 'Test desde Vecino Activo',
    html: '<h1>¡Funciona!</h1><p>El sistema de emails está operativo.</p>'
  });
  
  console.log('Resultado:', result);
}

testEmail();
```

### Test 3: Enviar WhatsApp de Prueba

```javascript
import whatsappService from '../src/services/whatsappService';

async function testWhatsApp() {
  const result = await whatsappService.sendMessage(
    '+56912345678', // Tu número
    'Test desde Vecino Activo - Sistema operativo ✅'
  );
  
  console.log('Resultado:', result);
}

testWhatsApp();
```

---

## 📊 Flujo de Envío Completo

```
1. Admin crea campaña en UI
   ↓
2. Modal: Selecciona tipo (email/push/whatsapp)
   ↓
3. Click "Enviar Ahora" o "Programar"
   ↓
4. Redux: createCampaign() → Guarda en DB
   ↓
5. Si status='sent': sendCampaign()
   ↓
6. campaignSenderService.sendCampaign()
   ├─ Obtiene destinatarios de DB
   ├─ Según tipo:
   │  ├─ email → emailService.sendBulkEmails()
   │  ├─ push → pushService.sendToMultiple()
   │  └─ whatsapp → whatsappService.sendBulkMessages()
   └─ Guarda logs en campaign_logs
   ↓
7. Actualiza stats en DB
   ↓
8. UI muestra resultado: "✅ 45/50 enviados"
```

---

## 💰 Costos Estimados

### Tier Gratuito:
- **Brevo**: 300 emails/día = 9,000/mes
- **Firebase**: Ilimitado
- **Twilio**: $15 crédito inicial

### Pagando:
- **Brevo**: $25/mes = 20,000 emails
- **Firebase**: Gratis
- **Twilio**: $0.005/mensaje WhatsApp

**Total mensual**: ~$25-50 para 20,000 emails + 1,000 WhatsApp

---

## 🔒 Seguridad y Mejores Prácticas

### Rate Limiting
Los servicios ya implementan rate limiting:
- **Emails**: Lotes de 50, pausa de 1s entre lotes
- **WhatsApp**: Lotes de 10, pausa de 1s entre lotes

### Validación
- Emails: Verifica formato válido
- WhatsApp: Formatea números automáticamente (+56...)
- Push: Verifica tokens de dispositivos

### Logs
Todos los envíos se registran en `campaign_logs`:
- Estado (sent/failed)
- Timestamp
- Error messages
- Destinatario

---

## 🆘 Troubleshooting

### Error: "EmailService no inicializado"
**Solución**: Verificar que `REACT_APP_BREVO_API_KEY` esté en `.env` y reiniciar servidor.

### Error: "Invalid API key"
**Solución**: Verificar que la API key sea correcta y esté activa en Brevo/Twilio.

### WhatsApp no llega
**Solución**: 
1. Verificar que el número esté en el Sandbox de Twilio
2. Enviar "join [sandbox-name]" al número de Twilio primero
3. Verificar formato de número: +56912345678

### Push notifications no funcionan
**Solución**:
1. Verificar que el usuario haya dado permiso de notificaciones
2. Verificar que el token esté guardado en `user_device_tokens`
3. Push debe enviarse desde backend con Firebase Admin SDK

---

## 📝 Próximos Pasos Opcionales

### 1. Implementar Backend para Push
Las push notifications deben enviarse desde el backend con Firebase Admin SDK:

```javascript
// backend/services/pushService.js
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function sendPush(tokens, notification) {
  const message = {
    notification: {
      title: notification.title,
      body: notification.body
    },
    tokens: tokens
  };
  
  const response = await admin.messaging().sendMulticast(message);
  return response;
}
```

### 2. Configurar Webhooks
Para tracking de emails (abiertos, clicks):

**Brevo Webhooks:**
1. Ir a **Settings** → **Webhooks**
2. Agregar URL: `https://tu-dominio.com/api/webhooks/brevo`
3. Seleccionar eventos: opened, clicked, delivered

### 3. Programación de Envíos
Usar Supabase Edge Functions o cron jobs para envíos programados.

---

## ✅ Checklist de Implementación

- [x] Instalar dependencias (@sendinblue/client, twilio)
- [x] Crear servicios (emailService, pushService, whatsappService)
- [x] Crear orquestador (campaignSenderService)
- [x] Integrar con Redux (campaignsSlice)
- [x] Actualizar UI (CampaignsManagement)
- [ ] Configurar API keys en .env
- [ ] Crear tabla user_device_tokens
- [ ] Probar envío de emails
- [ ] Probar envío de WhatsApp
- [ ] Configurar webhooks (opcional)
- [ ] Implementar backend para push (opcional)

---

¿Listo para empezar a enviar campañas? 🚀
