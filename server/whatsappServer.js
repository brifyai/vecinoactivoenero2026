/**
 * Backend Server para WhatsApp con Twilio
 * Este servidor maneja los envíos de WhatsApp ya que Twilio requiere Node.js
 */

const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const PORT = process.env.WHATSAPP_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Inicializar Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

if (!accountSid || !authToken || !whatsappNumber) {
  console.error('❌ Faltan credenciales de Twilio en .env');
  console.error('Requerido: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER');
  process.exit(1);
}

const client = twilio(accountSid, authToken);
const fromNumber = `whatsapp:${whatsappNumber}`;

console.log('✅ Twilio inicializado correctamente');
console.log(`📱 Número WhatsApp: ${whatsappNumber}`);

// =====================================================
// ENDPOINTS
// =====================================================

// Health check
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    status: 'ok',
    service: 'WhatsApp Server',
    fromNumber: whatsappNumber
  });
});

// Enviar mensaje individual
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Faltan parámetros: to, message' });
    }
    
    console.log(`📤 Enviando WhatsApp a: ${to}`);
    
    const result = await client.messages.create({
      from: fromNumber,
      to: to,
      body: message
    });
    
    console.log(`✅ Mensaje enviado: ${result.sid}`);
    
    res.json({
      success: true,
      messageSid: result.sid,
      status: result.status
    });
    
  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error);
    res.status(500).json({ error: error.message });
  }
});

// Enviar mensaje con media
app.post('/api/whatsapp/send-media', async (req, res) => {
  try {
    const { to, message, mediaUrl } = req.body;
    
    if (!to || !message || !mediaUrl) {
      return res.status(400).json({ error: 'Faltan parámetros: to, message, mediaUrl' });
    }
    
    console.log(`📤 Enviando WhatsApp con media a: ${to}`);
    
    const result = await client.messages.create({
      from: fromNumber,
      to: to,
      body: message,
      mediaUrl: [mediaUrl]
    });
    
    console.log(`✅ Mensaje con media enviado: ${result.sid}`);
    
    res.json({
      success: true,
      messageSid: result.sid,
      status: result.status
    });
    
  } catch (error) {
    console.error('❌ Error enviando WhatsApp con media:', error);
    res.status(500).json({ error: error.message });
  }
});

// Envío masivo
app.post('/api/whatsapp/send-bulk', async (req, res) => {
  try {
    const { recipients, message } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || !message) {
      return res.status(400).json({ error: 'Faltan parámetros: recipients (array), message' });
    }
    
    console.log(`📤 Enviando ${recipients.length} mensajes WhatsApp...`);
    
    const results = [];
    const batchSize = 10; // Rate limiting
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          // Personalizar mensaje
          const personalizedMessage = message
            .replace(/\{\{name\}\}/g, recipient.name || 'Vecino')
            .replace(/\{\{neighborhood\}\}/g, recipient.neighborhood || '');
          
          const result = await client.messages.create({
            from: fromNumber,
            to: recipient.phone,
            body: personalizedMessage
          });
          
          return {
            phone: recipient.phone,
            success: true,
            messageSid: result.sid,
            error: null
          };
        } catch (error) {
          return {
            phone: recipient.phone,
            success: false,
            messageSid: null,
            error: error.message
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Pausa entre lotes
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ Enviados: ${successCount}/${recipients.length}`);
    
    res.json({
      success: true,
      results,
      sent: successCount,
      failed: recipients.length - successCount
    });
    
  } catch (error) {
    console.error('❌ Error en envío masivo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener estado de mensaje
app.get('/api/whatsapp/status/:messageSid', async (req, res) => {
  try {
    const { messageSid } = req.params;
    
    const message = await client.messages(messageSid).fetch();
    
    res.json({
      success: true,
      status: message.status,
      errorCode: message.errorCode,
      errorMessage: message.errorMessage
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo estado:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 WhatsApp Server corriendo en puerto ${PORT}`);
  console.log(`📱 Número: ${whatsappNumber}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`${'='.repeat(50)}\n`);
});

// Manejo de errores
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error);
});
