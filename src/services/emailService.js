/**
 * Email Service - Brevo (ex-Sendinblue)
 * Servicio para envío de emails usando Brevo API
 * 
 * IMPORTANTE: Brevo SDK requiere Node.js y no puede ejecutarse directamente en el navegador.
 * Este servicio debe usarse desde el backend o a través de una API proxy.
 */

class EmailService {
  constructor() {
    this.initialized = false;
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  }

  initialize() {
    if (this.initialized) return;

    console.log('⚠️ Email Service: Debe ejecutarse desde el backend');
    console.log('📝 Ver docs/SETUP_CAMPAIGN_SENDING.md para configuración backend');
    
    this.initialized = true;
  }

  /**
   * Enviar un email individual
   * Llama al backend para enviar el email
   */
  async sendEmail({ to, subject, html, text, from = null }) {
    this.initialize();

    try {
      const response = await fetch(`${this.backendUrl}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          html,
          text,
          from
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error enviando email');
      }
      
      console.log('✅ Email enviado a:', to);
      return { success: true, messageId: result.messageId };
      
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar emails en lote
   * Llama al backend para enviar los emails
   */
  async sendBulkEmails({ recipients, subject, html, text, from = null }) {
    this.initialize();

    console.log(`📧 Enviando ${recipients.length} emails...`);
    
    try {
      const response = await fetch(`${this.backendUrl}/api/email/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipients,
          subject,
          html,
          text,
          from
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Error en envío masivo');
      }
      
      console.log(`✅ Emails enviados: ${result.sent}/${recipients.length}`);
      
      return { 
        success: true, 
        results: result.results || [],
        sent: result.sent || 0,
        failed: result.failed || 0
      };
      
    } catch (error) {
      console.error('❌ Error en envío masivo:', error);
      return { success: false, error: error.message, results: [] };
    }
  }

  /**
   * Personalizar contenido con datos del destinatario
   */
  personalizeContent(content, recipient) {
    return content
      .replace(/\{\{name\}\}/g, recipient.name || 'Vecino')
      .replace(/\{\{email\}\}/g, recipient.email || '')
      .replace(/\{\{neighborhood\}\}/g, recipient.neighborhood || '');
  }

  /**
   * Verificar estado del servicio
   * Verifica conectividad con el backend
   */
  async checkStatus() {
    this.initialize();

    try {
      const response = await fetch(`${this.backendUrl}/api/email/status`);
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

export default new EmailService();
