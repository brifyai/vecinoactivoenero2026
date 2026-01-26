/**
 * Campaign Sender Service - Orquestador Principal
 * Coordina el envío de campañas a través de múltiples canales
 */

import emailService from './emailService';
import pushNotificationService from './pushNotificationService';
import whatsappService from './whatsappService';
import supabaseCampaignsService from './supabaseCampaignsService';
import { supabase } from '../config/supabase';

class CampaignSenderService {
  
  /**
   * Enviar campaña completa
   */
  async sendCampaign(campaignId) {
    console.log('🚀 Iniciando envío de campaña:', campaignId);
    
    try {
      // 1. Obtener datos de la campaña
      const campaignResult = await supabaseCampaignsService.getCampaignById(campaignId);
      
      if (!campaignResult.success) {
        throw new Error('No se pudo obtener la campaña');
      }
      
      const campaign = campaignResult.data;
      
      // 2. Validar estado de la campaña
      if (!['draft', 'scheduled'].includes(campaign.status)) {
        throw new Error(`La campaña no puede enviarse en estado: ${campaign.status}`);
      }
      
      // 3. Obtener destinatarios
      const recipientsResult = await this.getRecipients(campaign);
      
      if (!recipientsResult.success) {
        throw new Error('No se pudieron obtener los destinatarios');
      }
      
      const recipients = recipientsResult.data;
      
      if (recipients.length === 0) {
        throw new Error('No hay destinatarios para esta campaña');
      }
      
      console.log(`📊 Enviando a ${recipients.length} destinatarios`);
      
      // 4. Actualizar estado a "sending"
      await supabaseCampaignsService.updateCampaign(campaignId, {
        status: 'sending',
        sent_at: new Date().toISOString()
      });
      
      // 5. Enviar según el tipo de campaña
      let sendResult;
      
      switch (campaign.campaign_type) {
        case 'email':
          sendResult = await this.sendEmailCampaign(campaign, recipients);
          break;
        case 'push':
          sendResult = await this.sendPushCampaign(campaign, recipients);
          break;
        case 'whatsapp':
          sendResult = await this.sendWhatsAppCampaign(campaign, recipients);
          break;
        default:
          throw new Error(`Tipo de campaña no soportado: ${campaign.campaign_type}`);
      }
      
      // 6. Guardar logs de envío
      await this.saveCampaignLogs(campaignId, sendResult.logs);
      
      // 7. Actualizar estadísticas de la campaña
      await supabaseCampaignsService.updateCampaign(campaignId, {
        status: 'sent',
        stats: {
          sent: sendResult.sent,
          delivered: sendResult.delivered,
          failed: sendResult.failed,
          opened: 0,
          clicked: 0
        }
      });
      
      console.log(`✅ Campaña enviada: ${sendResult.sent}/${recipients.length} exitosos`);
      
      return {
        success: true,
        sent: sendResult.sent,
        failed: sendResult.failed,
        total: recipients.length
      };
      
    } catch (error) {
      console.error('❌ Error enviando campaña:', error);
      
      // Actualizar estado a failed
      await supabaseCampaignsService.updateCampaign(campaignId, {
        status: 'failed'
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Obtener destinatarios de la campaña
   */
  async getRecipients(campaign) {
    try {
      let query = supabase
        .from('users')
        .select('id, email, name, phone, neighborhood_id');
      
      // Filtrar por unidad vecinal
      if (campaign.neighborhood_id) {
        query = query.eq('neighborhood_id', campaign.neighborhood_id);
      }
      
      // Aplicar filtros de audiencia
      const targetAudience = campaign.target_audience || {};
      
      if (targetAudience === 'verified' || targetAudience.verified_only) {
        query = query.eq('verified', true);
      }
      
      if (targetAudience === 'active' || targetAudience.active_only) {
        // Usuarios activos en los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        query = query.gte('last_login', thirtyDaysAgo.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Filtrar según el tipo de campaña
      let filteredRecipients = data || [];
      
      if (campaign.campaign_type === 'email') {
        filteredRecipients = filteredRecipients.filter(r => r.email);
      } else if (campaign.campaign_type === 'whatsapp') {
        filteredRecipients = filteredRecipients.filter(r => r.phone);
      }
      
      return { success: true, data: filteredRecipients };
      
    } catch (error) {
      console.error('❌ Error obteniendo destinatarios:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  /**
   * Enviar campaña por email
   */
  async sendEmailCampaign(campaign, recipients) {
    console.log('📧 Enviando campaña por email...');
    
    const emailRecipients = recipients.map(r => ({
      email: r.email,
      name: r.name,
      neighborhood: r.neighborhood_id
    }));
    
    const result = await emailService.sendBulkEmails({
      recipients: emailRecipients,
      subject: campaign.name,
      html: campaign.message,
      text: campaign.message.replace(/<[^>]*>/g, '') // Strip HTML tags
    });
    
    // Convertir resultados a formato de logs
    const logs = result.results.map(r => ({
      recipient_email: r.email,
      channel: 'email',
      status: r.success ? 'sent' : 'failed',
      error_message: r.error || null,
      sent_at: new Date().toISOString(),
      delivered_at: r.success ? new Date().toISOString() : null
    }));
    
    return {
      sent: result.sent || 0,
      delivered: result.sent || 0,
      failed: result.failed || 0,
      logs
    };
  }
  
  /**
   * Enviar campaña por push notification
   */
  async sendPushCampaign(campaign, recipients) {
    console.log('🔔 Enviando campaña por push notification...');
    
    // Obtener tokens de dispositivos de los usuarios
    const { data: deviceTokens, error } = await supabase
      .from('user_device_tokens')
      .select('user_id, token')
      .in('user_id', recipients.map(r => r.id));
    
    if (error || !deviceTokens || deviceTokens.length === 0) {
      console.warn('⚠️ No se encontraron tokens de dispositivos');
      return {
        sent: 0,
        delivered: 0,
        failed: recipients.length,
        logs: recipients.map(r => ({
          recipient_email: r.email,
          channel: 'push',
          status: 'failed',
          error_message: 'No device token found',
          sent_at: new Date().toISOString()
        }))
      };
    }
    
    // NOTA: El envío real debe hacerse desde el backend con Firebase Admin SDK
    // Por ahora, simular el envío
    console.warn('⚠️ Push notifications deben enviarse desde el backend con Firebase Admin SDK');
    
    const logs = deviceTokens.map(dt => ({
      recipient_email: recipients.find(r => r.id === dt.user_id)?.email,
      channel: 'push',
      status: 'pending',
      error_message: 'Requiere implementación backend',
      sent_at: new Date().toISOString()
    }));
    
    return {
      sent: 0,
      delivered: 0,
      failed: deviceTokens.length,
      logs
    };
  }
  
  /**
   * Enviar campaña por WhatsApp
   */
  async sendWhatsAppCampaign(campaign, recipients) {
    console.log('💬 Enviando campaña por WhatsApp...');
    
    const whatsappRecipients = recipients.map(r => ({
      phone: r.phone,
      name: r.name,
      neighborhood: r.neighborhood_id
    }));
    
    const result = await whatsappService.sendBulkMessages({
      recipients: whatsappRecipients,
      message: campaign.message
    });
    
    // Convertir resultados a formato de logs
    const logs = result.results.map(r => ({
      recipient_phone: r.phone,
      channel: 'whatsapp',
      status: r.success ? 'sent' : 'failed',
      error_message: r.error || null,
      sent_at: new Date().toISOString(),
      delivered_at: r.success ? new Date().toISOString() : null
    }));
    
    return {
      sent: result.sent || 0,
      delivered: result.sent || 0,
      failed: result.failed || 0,
      logs
    };
  }
  
  /**
   * Guardar logs de envío en la base de datos
   */
  async saveCampaignLogs(campaignId, logs) {
    try {
      const logsWithCampaignId = logs.map(log => ({
        ...log,
        campaign_id: campaignId
      }));
      
      const { error } = await supabase
        .from('campaign_logs')
        .insert(logsWithCampaignId);
      
      if (error) throw error;
      
      console.log(`✅ ${logs.length} logs guardados`);
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error guardando logs:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Verificar estado de los servicios
   */
  async checkServicesStatus() {
    const [emailStatus, pushStatus, whatsappStatus] = await Promise.all([
      emailService.checkStatus(),
      pushNotificationService.checkStatus(),
      whatsappService.checkStatus()
    ]);
    
    return {
      email: emailStatus,
      push: pushStatus,
      whatsapp: whatsappStatus
    };
  }
}

export default new CampaignSenderService();
