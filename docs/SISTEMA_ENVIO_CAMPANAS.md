# Sistema de Envío de Campañas - Vecino Activo

## 📋 Estado Actual

Actualmente el sistema:
- ✅ Guarda campañas en la base de datos
- ✅ Interfaz completa para crear campañas
- ❌ **NO envía emails, notificaciones push ni WhatsApp reales**

## 🔧 Opciones de Implementación

### 1. 📧 EMAIL

#### Opción A: Supabase Edge Functions + Resend (Recomendado)
**Costo**: Gratis hasta 3,000 emails/mes, luego $1 por 1,000 emails
```javascript
// Supabase Edge Function
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@vecinoactivo.cl',
  to: recipients,
  subject: campaign.title,
  html: campaign.message
});
```

#### Opción B: SendGrid
**Costo**: Gratis hasta 100 emails/día, luego desde $19.95/mes
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.sendMultiple({
  to: recipients,
  from: 'noreply@vecinoactivo.cl',
  subject: campaign.title,
  html: campaign.message
});
```

#### Opción C: Nodemailer + SMTP
**Costo**: Gratis (usa tu propio servidor SMTP)
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

await transporter.sendMail({
  from: 'noreply@vecinoactivo.cl',
  to: recipients,
  subject: campaign.title,
  html: campaign.message
});
```

### 2. 🔔 NOTIFICACIONES PUSH

#### Opción A: Firebase Cloud Messaging (Recomendado)
**Costo**: Gratis
```javascript
import admin from 'firebase-admin';

await admin.messaging().sendMulticast({
  tokens: deviceTokens,
  notification: {
    title: campaign.title,
    body: campaign.message
  }
});
```

#### Opción B: OneSignal
**Costo**: Gratis hasta 10,000 suscriptores
```javascript
const OneSignal = require('onesignal-node');

const client = new OneSignal.Client({
  userAuthKey: process.env.ONESIGNAL_USER_AUTH_KEY,
  app: { appAuthKey: process.env.ONESIGNAL_APP_AUTH_KEY, appId: process.env.ONESIGNAL_APP_ID }
});

await client.createNotification({
  contents: { en: campaign.message },
  headings: { en: campaign.title },
  included_segments: ['All']
});
```

### 3. 💬 WHATSAPP

#### Opción A: Twilio WhatsApp API
**Costo**: $0.005 por mensaje
```javascript
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  from: 'whatsapp:+14155238886',
  to: `whatsapp:${phoneNumber}`,
  body: campaign.message
});
```

#### Opción B: WhatsApp Business API
**Costo**: Variable según proveedor
- Requiere aprobación de Meta
- Más complejo de configurar
- Mejor para volúmenes altos

#### Opción C: Baileys (No oficial)
**Costo**: Gratis pero riesgoso
- No recomendado para producción
- Puede resultar en ban de WhatsApp

## 🎯 Recomendación de Stack

### Para Empezar (Mínimo Viable):
1. **Email**: Resend (3,000 gratis/mes)
2. **Push**: Firebase Cloud Messaging (gratis)
3. **WhatsApp**: Twilio (pago por uso)

### Costo Estimado Mensual:
- 0-3,000 emails: **$0**
- Push notifications: **$0**
- 1,000 WhatsApp: **$5**
- **Total: ~$5/mes** para empezar

## 📦 Implementación Recomendada

### Arquitectura:
```
Frontend (React)
    ↓
Redux Action (createCampaign)
    ↓
Supabase Database (guarda campaña)
    ↓
Supabase Edge Function (procesa envío)
    ↓
APIs Externas (Resend, FCM, Twilio)
    ↓
Usuarios Finales
```

### Flujo:
1. Admin crea campaña en UI
2. Se guarda en DB con status='pending'
3. Trigger de Supabase activa Edge Function
4. Edge Function lee destinatarios
5. Envía según tipo (email/push/whatsapp)
6. Actualiza status='sent' y métricas

## 🚀 Siguiente Paso

¿Quieres que implemente la solución básica con:
- **Resend** para emails
- **Firebase** para push (ya lo tienes configurado)
- **Twilio** para WhatsApp

O prefieres otra combinación?
