/**
 * Servicio de Campañas de Comunicación para Dashboard Administrativo
 * Gestión completa de campañas omnicanal (Push, Email, WhatsApp)
 */
import { supabase } from '../config/supabase';

class SupabaseCampaignsService {
  
  // =====================================================
  // CRUD BÁSICO DE CAMPAÑAS
  // =====================================================
  
  async createCampaign(campaignData) {
    try {
      console.log('📢 Creando campaña:', campaignData);
      
      const { data, error } = await supabase
        .from('communication_campaigns')
        .insert([{
          neighborhood_id: campaignData.neighborhood_id,
          created_by: campaignData.created_by,
          name: campaignData.name,
          description: campaignData.description,
          campaign_type: campaignData.campaign_type,
          subject: campaignData.subject,
          message: campaignData.message,
          html_content: campaignData.html_content,
          attachments: campaignData.attachments || [],
          channels: campaignData.channels || { push: false, email: false, whatsapp: false },
          target_audience: campaignData.target_audience || {},
          scheduled_at: campaignData.scheduled_at
        }])
        .select(`
          *,
          neighborhoods:neighborhood_id(nombre, codigo),
          creator:created_by(name, email)
        `)
        .single();
      
      if (error) throw error;
      
      console.log('✅ Campaña creada exitosamente');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error creando campaña:', error);
      return { success: false, error: error.message };
    }
  }
  
  async getCampaigns(filters = {}) {
    try {
      console.log('📋 Obteniendo campañas con filtros:', filters);
      
      let query = supabase
        .from('recent_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Aplicar filtros
      if (filters.neighborhood_id) {
        query = query.eq('neighborhood_id', filters.neighborhood_id);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.campaign_type) {
        query = query.eq('campaign_type', filters.campaign_type);
      }
      
      if (filters.created_by) {
        query = query.eq('created_by', filters.created_by);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} campañas obtenidas`);
      return { success: true, data: data || [] };
      
    } catch (error) {
      console.error('❌ Error obteniendo campañas:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  async getCampaignById(campaignId) {
    try {
      console.log('📢 Obteniendo campaña:', campaignId);
      
      const { data, error } = await supabase
        .from('recent_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      if (error) throw error;
      
      console.log('✅ Campaña obtenida exitosamente');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error obteniendo campaña:', error);
      return { success: false, error: error.message };
    }
  }
  
  async updateCampaign(campaignId, updates) {
    try {
      console.log('📝 Actualizando campaña:', campaignId, updates);
      
      const { data, error } = await supabase
        .from('communication_campaigns')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .select(`
          *,
          neighborhoods:neighborhood_id(nombre, codigo),
          creator:created_by(name, email)
        `)
        .single();
      
      if (error) throw error;
      
      console.log('✅ Campaña actualizada exitosamente');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error actualizando campaña:', error);
      return { success: false, error: error.message };
    }
  }
  
  async deleteCampaign(campaignId) {
    try {
      console.log('🗑️ Eliminando campaña:', campaignId);
      
      const { error } = await supabase
        .from('communication_campaigns')
        .delete()
        .eq('id', campaignId);
      
      if (error) throw error;
      
      console.log('✅ Campaña eliminada exitosamente');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error eliminando campaña:', error);
      return { success: false, error: error.message };
    }
  }
  
  // =====================================================
  // GESTIÓN DE AUDIENCIA
  // =====================================================
  
  async estimateAudience(neighborhoodId, targetAudience = {}) {
    try {
      console.log('👥 Estimando audiencia para:', neighborhoodId, targetAudience);
      
      let query = supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('neighborhood_id', neighborhoodId);
      
      // Aplicar filtros de audiencia
      if (targetAudience.verified_only) {
        query = query.eq('verified', true);
      }
      
      if (targetAudience.age_range) {
        // Implementar filtro por edad si existe campo birthdate
      }
      
      const { count, error } = await query;
      
      if (error) throw error;
      
      console.log(`✅ Audiencia estimada: ${count} usuarios`);
      return { success: true, count: count || 0 };
      
    } catch (error) {
      console.error('❌ Error estimando audiencia:', error);
      return { success: false, error: error.message, count: 0 };
    }
  }
  
  async getTargetUsers(neighborhoodId, targetAudience = {}) {
    try {
      console.log('🎯 Obteniendo usuarios objetivo');
      
      let query = supabase
        .from('users')
        .select('id, email, name, phone')
        .eq('neighborhood_id', neighborhoodId);
      
      // Aplicar filtros de audiencia
      if (targetAudience.verified_only) {
        query = query.eq('verified', true);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} usuarios objetivo obtenidos`);
      return { success: true, data: data || [] };
      
    } catch (error) {
      console.error('❌ Error obteniendo usuarios objetivo:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  // =====================================================
  // ENVÍO DE CAMPAÑAS
  // =====================================================
  
  async sendCampaign(campaignId) {
    try {
      console.log('🚀 Enviando campaña:', campaignId);
      
      // Obtener campaña
      const campaignResult = await this.getCampaignById(campaignId);
      if (!campaignResult.success) {
        throw new Error('Campaña no encontrada');
      }
      
      const campaign = campaignResult.data;
      
      // Verificar que la campaña esté en estado draft o scheduled
      if (!['draft', 'scheduled'].includes(campaign.status)) {
        throw new Error('La campaña no puede ser enviada en su estado actual');
      }
      
      // Obtener usuarios objetivo
      const usersResult = await this.getTargetUsers(
        campaign.neighborhood_id, 
        campaign.target_audience
      );
      
      if (!usersResult.success) {
        throw new Error('Error obteniendo usuarios objetivo');
      }
      
      const targetUsers = usersResult.data;
      
      // Actualizar estado de campaña a "sending"
      await this.updateCampaign(campaignId, {
        status: 'sending',
        sent_at: new Date().toISOString(),
        estimated_recipients: targetUsers.length
      });
      
      // Crear logs de envío para cada usuario y canal
      const logs = [];
      const channels = campaign.channels;
      
      for (const user of targetUsers) {
        if (channels.push) {
          logs.push({
            campaign_id: campaignId,
            recipient_id: user.id,
            channel: 'push',
            recipient_email: user.email,
            status: 'pending'
          });
        }
        
        if (channels.email && user.email) {
          logs.push({
            campaign_id: campaignId,
            recipient_id: user.id,
            channel: 'email',
            recipient_email: user.email,
            status: 'pending'
          });
        }
        
        if (channels.whatsapp && user.phone) {
          logs.push({
            campaign_id: campaignId,
            recipient_id: user.id,
            channel: 'whatsapp',
            recipient_phone: user.phone,
            status: 'pending'
          });
        }
      }
      
      // Insertar logs de envío
      if (logs.length > 0) {
        const { error: logsError } = await supabase
          .from('campaign_logs')
          .insert(logs);
        
        if (logsError) throw logsError;
      }
      
      // Aquí se integraría con los servicios de envío reales
      // Por ahora, simular envío exitoso
      await this.processCampaignSending(campaignId, logs);
      
      console.log('✅ Campaña enviada exitosamente');
      return { success: true, sent_count: logs.length };
      
    } catch (error) {
      console.error('❌ Error enviando campaña:', error);
      
      // Actualizar estado a failed
      await this.updateCampaign(campaignId, {
        status: 'failed'
      });
      
      return { success: false, error: error.message };
    }
  }
  
  async processCampaignSending(campaignId, logs) {
    try {
      // Simular procesamiento de envío
      // En producción, aquí se integraría con Firebase, Resend, Twilio, etc.
      
      let sentCount = 0;
      let deliveredCount = 0;
      
      // Actualizar logs como enviados (simulación)
      for (const log of logs) {
        const success = Math.random() > 0.1; // 90% éxito simulado
        
        await supabase
          .from('campaign_logs')
          .update({
            status: success ? 'sent' : 'failed',
            sent_at: new Date().toISOString(),
            delivered_at: success ? new Date().toISOString() : null,
            error_message: success ? null : 'Error simulado de envío'
          })
          .eq('campaign_id', campaignId)
          .eq('recipient_id', log.recipient_id)
          .eq('channel', log.channel);
        
        if (success) {
          sentCount++;
          deliveredCount++;
        }
      }
      
      // Actualizar estadísticas de campaña
      await this.updateCampaign(campaignId, {
        status: 'sent',
        stats: {
          sent: sentCount,
          delivered: deliveredCount,
          opened: 0,
          clicked: 0,
          failed: logs.length - sentCount
        }
      });
      
      console.log(`✅ Procesamiento completado: ${sentCount}/${logs.length} enviados`);
      
    } catch (error) {
      console.error('❌ Error procesando envío:', error);
      throw error;
    }
  }
  
  // =====================================================
  // PROGRAMACIÓN DE CAMPAÑAS
  // =====================================================
  
  async scheduleCampaign(campaignId, scheduledAt) {
    try {
      console.log('⏰ Programando campaña:', campaignId, 'para:', scheduledAt);
      
      const { data, error } = await this.updateCampaign(campaignId, {
        status: 'scheduled',
        scheduled_at: scheduledAt
      });
      
      if (error) throw error;
      
      console.log('✅ Campaña programada exitosamente');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error programando campaña:', error);
      return { success: false, error: error.message };
    }
  }
  
  async getScheduledCampaigns() {
    try {
      console.log('📅 Obteniendo campañas programadas');
      
      const { data, error } = await supabase
        .from('recent_campaigns')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} campañas programadas obtenidas`);
      return { success: true, data: data || [] };
      
    } catch (error) {
      console.error('❌ Error obteniendo campañas programadas:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  // =====================================================
  // MÉTRICAS Y ESTADÍSTICAS
  // =====================================================
  
  async getCampaignStats(campaignId) {
    try {
      console.log('📊 Obteniendo estadísticas de campaña:', campaignId);
      
      const { data, error } = await supabase
        .from('campaign_logs')
        .select('channel, status')
        .eq('campaign_id', campaignId);
      
      if (error) throw error;
      
      // Procesar estadísticas
      const stats = {
        total: data.length,
        by_channel: {},
        by_status: {}
      };
      
      data.forEach(log => {
        // Por canal
        if (!stats.by_channel[log.channel]) {
          stats.by_channel[log.channel] = { total: 0, sent: 0, delivered: 0, failed: 0 };
        }
        stats.by_channel[log.channel].total++;
        stats.by_channel[log.channel][log.status]++;
        
        // Por estado
        if (!stats.by_status[log.status]) {
          stats.by_status[log.status] = 0;
        }
        stats.by_status[log.status]++;
      });
      
      console.log('✅ Estadísticas obtenidas exitosamente');
      return { success: true, data: stats };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return { success: false, error: error.message };
    }
  }
  
  // =====================================================
  // SUSCRIPCIONES EN TIEMPO REAL
  // =====================================================
  
  subscribeToCampaigns(neighborhoodId, callback) {
    console.log('🔔 Suscribiéndose a campañas en tiempo real');
    
    const subscription = supabase
      .channel('campaigns-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'communication_campaigns',
          filter: `neighborhood_id=eq.${neighborhoodId}`
        }, 
        callback
      )
      .subscribe();
    
    return subscription;
  }
}

export default new SupabaseCampaignsService();