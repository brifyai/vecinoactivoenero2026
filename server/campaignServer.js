/**
 * Campaign Server - Backend unificado para envío de campañas
 * Maneja emails (Brevo) y WhatsApp (Twilio)
 */

const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const SibApiV3Sdk = require('@sendinblue/client');
require('dotenv').config();

const app = express();
const PORT = process.env.CAMPAIGN_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// =====================================================
// INICIALIZAR SERVICIOS
// =====================================================

// Twilio (WhatsApp)
let twilioClient = null;
let whatsappNumber = null;

const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER;

if (twilioSid && twilioToken && twilioWhatsApp) {
  twilioClient = twilio(twilioSid, twilioToken);
  whatsappNumber = `whatsapp:${twilioWhatsApp}`;
  console.log('✅ Twilio (WhatsApp) inicializado');
} else {
  console.warn('⚠️ Twilio no configurado. WhatsApp no disponible.');
}

// Brevo (Email)
let brevoApi = null;

const brevoKey = process.env.BREVO_API_KEY;

if (brevoKey) {
  brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();
  const apiKeyInstance = SibApiV3Sdk.ApiClient.instance.authentications['api-key'];
  apiKeyInstance.apiKey = brevoKey;
  console.log('✅ Brevo (Email) inicializado');
} else {
  console.warn('⚠️ Brevo no configurado. Emails no disponibles.');
}

// =====================================================
// ENDPOINTS - EMAIL
// =====================================================

app.get('/api/email/status', (req, res) => {
  res.json({
    status: brevoApi ? 'ok' : 'not_configured',
    service: 'Email Service (Brevo)',
    available: !!brevoApi
  });
});

app.post('/api/email/send', async (req, res) => {
  if (!brevoApi) {
    return res.status(503).json({ error: 'Email service not configured' });
  }

  try {
    const { to, subject, html, text, from } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing parameters: to, subject, html' });
    }
    
    console.log(`📧 Enviando email a: ${to}`);
    
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = from || { email: 'noreply@vecinoactivo.cl', name: 'Vecino Activo' };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    if (text) sendSmtpEmail.textContent = text;
    
    const result = await brevoApi.sendTransacEmail(sendSmtpEmail);
    
    console.log(`✅ Email enviado: ${result.messageId}`);
    
    res.json({
      success: true,
      messageId: result.messageId
    });
    
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/email/send-bulk', async (req, res) => {
  if (!brevoApi) {
    return res.status(503).json({ error: 'Email service not configured' });
  }

  try {
    const { recipients, subject, html, text, from } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || !subject || !html) {
      return res.status(400).json({ error: 'Missing parameters: recipients (array), subject, html' });
    }
    
    console.log(`📧 Enviando ${recipients.length} emails...`);
    
    const results = [];
    const batchSize = 50;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          // Personalizar contenido
          const personalizedHtml = html
            .replace(/\{\{name\}\}/g, recipient.name || 'Vecino')
            .replace(/\{\{email\}\}/g, recipient.email || '')
            .replace(/\{\{neighborhood\}\}/g, recipient.neighborhood || '');
          
          const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
          sendSmtpEmail.sender = from || { email: 'noreply@vecinoactivo.cl', name: 'Vecino Activo' };
          sendSmtpEmail.to = [{ email: recipient.email }];
          sendSmtpEmail.subject = subject;
          sendSmtpEmail.htmlContent = personalizedHtml;
          if (text) {
            const personalizedText = text
              .replace(/\{\{name\}\}/g, recipient.name || 'Vecino')
              .replace(/\{\{email\}\}/g, recipient.email || '')
              .replace(/\{\{neighborhood\}\}/g, recipient.neighborhood || '');
            sendSmtpEmail.textContent = personalizedText;
          }
          
          const result = await brevoApi.sendTransacEmail(sendSmtpEmail);
          
          return {
            email: recipient.email,
            success: true,
            messageId: result.messageId,
            error: null
          };
        } catch (error) {
          return {
            email: recipient.email,
            success: false,
            messageId: null,
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
    console.log(`✅ Emails enviados: ${successCount}/${recipients.length}`);
    
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

// =====================================================
// ENDPOINTS - WHATSAPP
// =====================================================

app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    status: twilioClient ? 'ok' : 'not_configured',
    service: 'WhatsApp Service (Twilio)',
    available: !!twilioClient,
    fromNumber: twilioWhatsApp
  });
});

app.post('/api/whatsapp/send', async (req, res) => {
  if (!twilioClient) {
    return res.status(503).json({ error: 'WhatsApp service not configured' });
  }

  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing parameters: to, message' });
    }
    
    console.log(`📱 Enviando WhatsApp a: ${to}`);
    
    const result = await twilioClient.messages.create({
      from: whatsappNumber,
      to: to,
      body: message
    });
    
    console.log(`✅ WhatsApp enviado: ${result.sid}`);
    
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

app.post('/api/whatsapp/send-bulk', async (req, res) => {
  if (!twilioClient) {
    return res.status(503).json({ error: 'WhatsApp service not configured' });
  }

  try {
    const { recipients, message } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || !message) {
      return res.status(400).json({ error: 'Missing parameters: recipients (array), message' });
    }
    
    console.log(`📱 Enviando ${recipients.length} mensajes WhatsApp...`);
    
    const results = [];
    const batchSize = 10;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          // Personalizar mensaje
          const personalizedMessage = message
            .replace(/\{\{name\}\}/g, recipient.name || 'Vecino')
            .replace(/\{\{neighborhood\}\}/g, recipient.neighborhood || '');
          
          const result = await twilioClient.messages.create({
            from: whatsappNumber,
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
    console.log(`✅ WhatsApp enviados: ${successCount}/${recipients.length}`);
    
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

app.get('/api/whatsapp/status/:messageSid', async (req, res) => {
  if (!twilioClient) {
    return res.status(503).json({ error: 'WhatsApp service not configured' });
  }

  try {
    const { messageSid } = req.params;
    const message = await twilioClient.messages(messageSid).fetch();
    
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
// HEALTH CHECK
// =====================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    services: {
      email: !!brevoApi,
      whatsapp: !!twilioClient
    }
  });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Campaign Server corriendo en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`\nServicios disponibles:`);
  console.log(`  📧 Email (Brevo): ${brevoApi ? '✅ Activo' : '❌ No configurado'}`);
  console.log(`  📱 WhatsApp (Twilio): ${twilioClient ? '✅ Activo' : '❌ No configurado'}`);
  console.log(`${'='.repeat(60)}\n`);
});

// Manejo de errores
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error);
});
