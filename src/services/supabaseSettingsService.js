/**
 * Servicio de Configuración Administrativa
 * Gestión de settings y administradores
 */
import { supabase } from '../config/supabase';

class SupabaseSettingsService {
  
  // =====================================================
  // CONFIGURACIONES
  // =====================================================
  
  async getSettings(neighborhoodId) {
    try {
      console.log('⚙️ Obteniendo configuración para:', neighborhoodId);
      
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('neighborhood_id', neighborhoodId)
        .single();
      
      if (error) {
        // Si no existe configuración, crear una por defecto
        if (error.code === 'PGRST116') {
          return await this.createDefaultSettings(neighborhoodId);
        }
        throw error;
      }
      
      console.log('✅ Configuración obtenida');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error obteniendo configuración:', error);
      return { success: false, error: error.message };
    }
  }
  
  async createDefaultSettings(neighborhoodId) {
    try {
      console.log('📝 Creando configuración por defecto');
      
      const { data, error } = await supabase
        .from('admin_settings')
        .insert([{
          neighborhood_id: neighborhoodId,
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          ticket_alerts: true,
          campaign_alerts: true,
          emergency_alerts: true,
          enable_email: true,
          enable_push: true,
          enable_whatsapp: false,
          enable_sms: false,
          theme: 'light',
          primary_color: '#3b82f6',
          accent_color: '#10b981',
          two_factor_auth: false,
          session_timeout: 30,
          password_expiry: 90,
          login_attempts: 5
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Configuración por defecto creada');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error creando configuración:', error);
      return { success: false, error: error.message };
    }
  }
  
  async updateSettings(neighborhoodId, settings, userId) {
    try {
      console.log('💾 Actualizando configuración:', neighborhoodId);
      
      const { data, error} = await supabase
        .from('admin_settings')
        .update({
          // Notificaciones
          email_notifications: settings.emailNotifications,
          push_notifications: settings.pushNotifications,
          sms_notifications: settings.smsNotifications,
          ticket_alerts: settings.ticketAlerts,
          campaign_alerts: settings.campaignAlerts,
          emergency_alerts: settings.emergencyAlerts,
          
          // UV Info
          uv_name: settings.uvName,
          uv_address: settings.uvAddress,
          uv_phone: settings.uvPhone,
          uv_email: settings.uvEmail,
          uv_website: settings.uvWebsite,
          
          // Canales
          enable_email: settings.enableEmail,
          enable_push: settings.enablePush,
          enable_whatsapp: settings.enableWhatsApp,
          enable_sms: settings.enableSMS,
          
          // Tema
          theme: settings.theme,
          primary_color: settings.primaryColor,
          accent_color: settings.accentColor,
          
          // Seguridad
          two_factor_auth: settings.twoFactorAuth,
          session_timeout: settings.sessionTimeout,
          password_expiry: settings.passwordExpiry,
          login_attempts: settings.loginAttempts,
          
          // Metadata
          updated_by: userId
        })
        .eq('neighborhood_id', neighborhoodId)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Configuración actualizada');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error actualizando configuración:', error);
      return { success: false, error: error.message };
    }
  }
  
  // =====================================================
  // ADMINISTRADORES
  // =====================================================
  
  async getAdminUsers(neighborhoodId) {
    try {
      console.log('👥 Obteniendo administradores para:', neighborhoodId);
      
      const { data, error } = await supabase
        .from('admin_users_detailed')
        .select('*')
        .eq('neighborhood_id', neighborhoodId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} administradores obtenidos`);
      return { success: true, data: data || [] };
      
    } catch (error) {
      console.error('❌ Error obteniendo administradores:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  async addAdminUser(neighborhoodId, userId, role, permissions, createdBy) {
    try {
      console.log('➕ Agregando administrador:', userId);
      
      const { data, error } = await supabase
        .from('admin_users')
        .insert([{
          user_id: userId,
          neighborhood_id: neighborhoodId,
          role: role || 'admin',
          permissions: permissions || [],
          is_active: true,
          created_by: createdBy
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Administrador agregado');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error agregando administrador:', error);
      return { success: false, error: error.message };
    }
  }
  
  async updateAdminUser(adminId, updates) {
    try {
      console.log('📝 Actualizando administrador:', adminId);
      
      const { data, error } = await supabase
        .from('admin_users')
        .update(updates)
        .eq('id', adminId)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Administrador actualizado');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error actualizando administrador:', error);
      return { success: false, error: error.message };
    }
  }
  
  async removeAdminUser(adminId) {
    try {
      console.log('🗑️ Eliminando administrador:', adminId);
      
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);
      
      if (error) throw error;
      
      console.log('✅ Administrador eliminado');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error eliminando administrador:', error);
      return { success: false, error: error.message };
    }
  }
  
  async toggleAdminStatus(adminId, isActive) {
    try {
      console.log('🔄 Cambiando estado de administrador:', adminId);
      
      const { data, error } = await supabase
        .from('admin_users')
        .update({ is_active: isActive })
        .eq('id', adminId)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Estado actualizado');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      return { success: false, error: error.message };
    }
  }
  
  // =====================================================
  // UTILIDADES
  // =====================================================
  
  async checkUserIsAdmin(userId, neighborhoodId) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, permissions, is_active')
        .eq('user_id', userId)
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_active', true)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return { success: true, isAdmin: false };
        }
        throw error;
      }
      
      return { 
        success: true, 
        isAdmin: true,
        role: data.role,
        permissions: data.permissions
      };
      
    } catch (error) {
      console.error('❌ Error verificando admin:', error);
      return { success: false, error: error.message, isAdmin: false };
    }
  }
}

export default new SupabaseSettingsService();
