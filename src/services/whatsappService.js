/**
 * WhatsApp Service - Twilio
 * Servicio para envío de mensajes WhatsApp usando Twilio API
 * 
 * IMPORTANTE: Twilio requiere Node.js y no puede ejecutarse directamente en el navegador.
 * Este servicio debe usarse desde el backend o a través de una API proxy.
 */

class WhatsAppService {
  constructor() {
    this.initialized = false;
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  }

  initialize() {
    if (this.initialized) return;

    console.log('⚠️ WhatsApp Service: Debe ejecutarse desde el backend');
    console.log('📝 Ver docs/SETUP_CAMPAIGN_SENDING.md para configuración backend');
    
    this.initialized = true;
  }

  /**
   * Formatear número de teléfono al formato internacional
   */
  formatPhoneNumber(phone) {
    // Eliminar espacios y caracteres especiales
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Si no empieza con +, agregar código de país (Chile por defecto)
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('56')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('9')) {
        cleaned = '+56' + cleaned;
      } else {
        cleaned = '+56' + cleaned;
      }
    }
    
    return `whatsapp:${cleaned}`;
  }

  /**
   * Enviar mensaje WhatsApp a un número
   * Llama al backend para enviar el mensaje
   */
  async sendMessage(to, message) {
    this.initialize();

    try {
      const response = await fetch(`${this.backendUrl}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.formatPhoneNumber(to),
          message
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error enviando WhatsApp');
      }
      
      console.log('✅ WhatsApp enviado a:', to);
      return { 
        success: true, 
        messageSid: result.messageSid,
        status: result.status 
      };
      
    } catch (error) {
      console.error('❌ Error enviando WhatsApp:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar mensajes WhatsApp en lote
   * Llama al backend para enviar los mensajes
   */
  async sendBulkMessages({ recipients, message }) {
    this.initialize();

    console.log(`💬 Enviando ${recipients.length} mensajes WhatsApp...`);
    
    try {
      const response = await fetch(`${this.backendUrl}/api/whatsapp/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients: recipients.map(r => ({
            phone: this.formatPhoneNumber(r.phone),
            name: r.name,
            neighborhood: r.neighborhood
          })),
          message
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error en envío masivo');
      }
      
      console.log(`✅ WhatsApp enviados: ${result.sent}/${recipients.length}`);
      
      return { 
        success: true, 
        results: result.results || [],
        sent: result.sent || 0,
        failed: result.failed || 0
      };
      
    } catch (error) {
      console.error('❌ Error en envío masivo WhatsApp:', error);
      return { success: false, error: error.message, results: [] };
    }
  }

  /**
   * Personalizar mensaje con datos del destinatario
   */
  personalizeMessage(message, recipient) {
    return message
      .replace(/\{\{name\}\}/g, recipient.name || 'Vecino')
      .replace(/\{\{neighborhood\}\}/g, recipient.neighborhood || '');
  }

  /**
   * Enviar mensaje con media (imagen, documento, etc.)
   * Llama al backend para enviar el mensaje
   */
  async sendMediaMessage(to, message, mediaUrl) {
    this.initialize();

    try {
      const response = await fetch(`${this.backendUrl}/api/whatsapp/send-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.formatPhoneNumber(to),
          message,
          mediaUrl
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error enviando WhatsApp con media');
      }
      
      console.log('✅ WhatsApp con media enviado a:', to);
      return { 
        success: true, 
        messageSid: result.messageSid,
        status: result.status 
      };
      
    } catch (error) {
      console.error('❌ Error enviando WhatsApp con media:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar estado de un mensaje
   * Llama al backend para obtener el estado
   */
  async getMessageStatus(messageSid) {
    this.initialize();

    try {
      const response = await fetch(`${this.backendUrl}/api/whatsapp/status/${messageSid}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error obteniendo estado');
      }
      
      return { 
        success: true, 
        status: result.status,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage
      };
      
    } catch (error) {
      console.error('❌ Error obteniendo estado:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar estado del servicio
   * Verifica conectividad con el backend
   */
  async checkStatus() {
    this.initialize();

    try {
      const response = await fetch(`${this.backendUrl}/api/whatsapp/status`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Backend no disponible');
      }
      
      return { 
        available: true,
        backendUrl: this.backendUrl,
        ...result
      };
    } catch (error) {
      return { 
        available: false, 
        error: error.message,
        note: 'Requiere backend configurado. Ver docs/SETUP_CAMPAIGN_SENDING.md'
      };
    }
  }
}

export default new WhatsAppService();
