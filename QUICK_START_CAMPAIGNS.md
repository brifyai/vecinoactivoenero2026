# 🚀 Quick Start - Sistema de Envío de Campañas

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Instalar Dependencias del Backend
```bash
cd server
npm install
cd ..
```

### 2️⃣ Configurar API Keys

Crear archivo `.env` en la raíz del proyecto:

```env
# Brevo (Emails) - Obtener en https://www.brevo.com/
BREVO_API_KEY=xkeysib-tu-api-key-aqui

# Twilio (WhatsApp) - Obtener en https://www.twilio.com/
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu-auth-token-aqui
TWILIO_WHATSAPP_NUMBER=+14155238886

# Puerto del servidor
CAMPAIGN_SERVER_PORT=3001
```

Agregar al `.env` del frontend (o crear `.env.local`):

```env
# URL del backend
REACT_APP_BACKEND_URL=http://localhost:3001

# Firebase VAPID Key (para push notifications)
REACT_APP_FIREBASE_VAPID_KEY=tu-vapid-key-aqui
```

### 3️⃣ Iniciar Servidores

**Terminal 1 - Backend:**
```bash
cd server
npm run campaigns
```

Deberías ver:
```
🚀 Campaign Server corriendo en puerto 3001
📧 Email (Brevo): ✅ Activo
📱 WhatsApp (Twilio): ✅ Activo
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### 4️⃣ Probar el Sistema

1. Abrir http://localhost:3000
2. Iniciar sesión como admin (admin@vecinoactivo.cl / admin123)
3. Ir a Dashboard → Campañas
4. Click en "Nueva Campaña"
5. Completar:
   - Título: "Prueba de Sistema"
   - Tipo: Email
   - Mensaje: "Hola {{name}}, esto es una prueba"
   - Audiencia: Todos
6. Click en "Enviar Ahora"
7. Ver resultado: "✅ X/Y mensajes enviados"

---

## 📋 Obtener API Keys

### Brevo (Emails)
1. Ir a https://www.brevo.com/
2. Crear cuenta (300 emails/día gratis)
3. Settings → SMTP & API → API Keys
4. Crear nueva key
5. Copiar (formato: `xkeysib-xxxxx`)

### Twilio (WhatsApp)
1. Ir a https://www.twilio.com/
2. Crear cuenta ($15 crédito gratis)
3. Console → Account → API Keys & Tokens
4. Copiar Account SID y Auth Token
5. Messaging → Try it out → WhatsApp
6. Seguir instrucciones del sandbox

### Firebase (Push)
1. Ir a Firebase Console
2. Project Settings → Cloud Messaging
3. Web Push certificates → Generate key pair
4. Copiar la key

---

## 🧪 Verificar que Funciona

### Test 1: Verificar Backend
```bash
curl http://localhost:3001/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "services": {
    "email": true,
    "whatsapp": true
  }
}
```

### Test 2: Enviar Email de Prueba
```bash
curl -X POST http://localhost:3001/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "tu-email@test.com",
    "subject": "Test",
    "html": "<h1>Funciona!</h1>"
  }'
```

### Test 3: Enviar WhatsApp de Prueba
```bash
curl -X POST http://localhost:3001/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "whatsapp:+56912345678",
    "message": "Test desde Vecino Activo"
  }'
```

---

## 🆘 Problemas Comunes

### Backend no inicia
**Error**: `Cannot find module 'express'`
**Solución**: `cd server && npm install`

### Email no se envía
**Error**: `Email service not configured`
**Solución**: Verificar que `BREVO_API_KEY` esté en `.env` y sea válida

### WhatsApp no llega
**Error**: Mensaje no recibido
**Solución**: 
1. Unirse al sandbox de Twilio
2. Enviar "join [sandbox-name]" al número de Twilio
3. Verificar formato: `whatsapp:+56912345678`

### Frontend no conecta con backend
**Error**: `Failed to fetch`
**Solución**: 
1. Verificar que backend esté corriendo en puerto 3001
2. Verificar `REACT_APP_BACKEND_URL=http://localhost:3001` en `.env`

---

## 📚 Documentación Completa

- **Setup detallado**: `docs/SETUP_CAMPAIGN_SENDING.md`
- **Guía de implementación**: `docs/GUIA_IMPLEMENTACION_ENVIOS.md`
- **Resumen técnico**: `SISTEMA_ENVIO_CAMPANAS_IMPLEMENTADO.md`

---

## ✅ Checklist

- [ ] Instalar dependencias backend (`cd server && npm install`)
- [ ] Crear cuenta Brevo
- [ ] Crear cuenta Twilio
- [ ] Obtener Firebase VAPID key
- [ ] Configurar `.env` con API keys
- [ ] Iniciar backend (`cd server && npm run campaigns`)
- [ ] Iniciar frontend (`npm start`)
- [ ] Probar envío de campaña
- [ ] Verificar logs en consola del backend

---

¿Listo? ¡Empieza a enviar campañas! 🚀
