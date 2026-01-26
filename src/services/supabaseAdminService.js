/**
 * Servicio de Administración para Dashboard Administrativo
 * Gestión de roles, permisos y configuración del dashboard
 */
import { supabase } from '../config/supabase';

class SupabaseAdminService {
  
  // =====================================================
  // GESTIÓN DE ROLES ADMINISTRATIVOS
  // =====================================================
  
  async createAdminRole(roleData) {
    try {
      console.log('👑 Creando rol administrativo:', roleData);
      
      const { data, error } = await supabase
        .from('admin_roles')
        .insert([{
          user_id: roleData.user_id,
          neighborhood_id: roleData.neighborhood_id,
          role_type: roleData.role_type,
          permissions: roleData.permissions || {},
          assigned_by: roleData.assigned_by
        }])
        .select(`
          *,
          user:user_id(name, email),
          neighborhood:neighborhood_id(nombre, codigo),
          assigner:assigned_by(name, email)
        `)
        .single();
      
      if (error) throw error;
      
      console.log('✅ Rol administrativo creado exitosamente');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error creando rol administrativo:', error);
      return { success: false, error: error.message };
    }
  }
  
  async getAdminRoles(filters = {}) {
    try {
      console.log('👥 Obteniendo roles administrativos con filtros:', filters);
      
      let query = supabase
        .from('admin_roles')
        .select(`
          *,
          user:user_id(name, email, avatar),
          neighborhood:neighborhood_id(nombre, codigo),
          assigner:assigned_by(name, email)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      // Aplicar filtros
      if (filters.neighborhood_id) {
        query = query.eq('neighborhood_id', filters.neighborhood_id);
      }
      
      if (filters.role_type) {
        query = query.eq('role_type', filters.role_type);
      }
      
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} roles administrativos obtenidos`);
      return { success: true, data: data || [] };
      
    } catch (error) {
      console.error('❌ Error obteniendo roles administrativos:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  async updateAdminRole(roleId, updates) {
    try {
      console.log('📝 Actualizando rol administrativo:', roleId, updates);
      
      const { data, error } = await supabase
        .from('admin_roles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', roleId)
        .select(`
          *,
          user:user_id(name, email, avatar),
          neighborhood:neighborhood_id(nombre, codigo)
        `)
        .single();
      
      if (error) throw error;
      
      console.log('✅ Rol administrativo actualizado exitosamente');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error actualizando rol administrativo:', error);
      return { success: false, error: error.message };
    }
  }
  
  async deactivateAdminRole(roleId, deactivatedBy) {
    try {
      console.log('🚫 Desactivando rol administrativo:', roleId);
      
      const { data, error } = await this.updateAdminRole(roleId, {
        is_active: false,
        assigned_by: deactivatedBy
      });
      
      if (error) throw error;
      
      console.log('✅ Rol administrativo desactivado exitosamente');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error desactivando rol administrativo:', error);
      return { success: false, error: error.message };
    }
  }
  
  // =====================================================
  // VERIFICACIÓN DE PERMISOS
  // =====================================================
  
  async checkUserPermissions(userId, neighborhoodId) {
    try {
      console.log('🔐 Verificando permisos del usuario:', userId, 'en:', neighborhoodId);
      
      const { data, error } = await supabase
        .from('admin_roles')
        .select('role_type, permissions, is_active')
        .eq('user_id', userId)
        .eq('neighborhood_id', neighborhoodId)
        .eq('is_active', true);
      
      if (error) throw error;
      
      const permissions = {
        is_admin: false,
        can_manage_tickets: false,
        can_send_campaigns: false,
        can_manage_users: false,
        can_view_analytics: false,
        role_types: []
      };
      
      if (data && data.length > 0) {
        permissions.is_admin = true;
        permissions.role_types = data.map(role => role.role_type);
        
        // Determinar permisos basados en roles
        const hasRole = (roleType) => permissions.role_types.includes(roleType);
        
        permissions.can_manage_tickets = hasRole('super_admin') || hasRole('uv_admin') || hasRole('delegate');
        permissions.can_send_campaigns = hasRole('super_admin') || hasRole('uv_admin');
        permissions.can_manage_users = hasRole('super_admin') || hasRole('uv_admin');
        permissions.can_view_analytics = hasRole('super_admin') || hasRole('uv_admin') || hasRole('delegate');
        
        // Agregar permisos personalizados
        data.forEach(role => {
          if (role.permissions) {
            Object.assign(permissions, role.permissions);
          }
        });
      }
      
      console.log('✅ Permisos verificados exitosamente');
      return { success: true, permissions };
      
    } catch (error) {
      console.error('❌ Error verificando permisos:', error);
      return { success: false, error: error.message, permissions: { is_admin: false } };
    }
  }
  
  async getUserNeighborhoods(userId) {
    try {
      console.log('🏘️ Obteniendo vecindarios del usuario:', userId);
      
      const { data, error } = await supabase
        .from('admin_roles')
        .select(`
          neighborhood_id,
          role_type,
          neighborhood:neighborhood_id(nombre, codigo, personas, hogares)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} vecindarios obtenidos`);
      return { success: true, data: data || [] };
      
    } catch (error) {
      console.error('❌ Error obteniendo vecindarios:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  // =====================================================
  // CONFIGURACIÓN DEL DASHBOARD
  // =====================================================
  
  async getDashboardConfig(neighborhoodId, configKey = null) {
    try {
      console.log('⚙️ Obteniendo configuración del dashboard');
      
      let query = supabase
        .from('dashboard_config')
        .select('*')
        .eq('neighborhood_id', neighborhoodId);
      
      if (configKey) {
        query = query.eq('config_key', configKey);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Si se solicita una clave específica, devolver solo el valor
      if (configKey && data && data.length > 0) {
        return { success: true, data: data[0].config_value };
      }
      
      // Convertir array a objeto para facilitar el uso
      const config = {};
      if (data) {
        data.forEach(item => {
          config[item.config_key] = item.config_value;
        });
      }
      
      console.log('✅ Configuración obtenida exitosamente');
      return { success: true, data: config };
      
    } catch (error) {
      console.error('❌ Error obteniendo configuración:', error);
      return { success: false, error: error.message, data: {} };
    }
  }
  
  async updateDashboardConfig(neighborhoodId, configKey, configValue, updatedBy) {
    try {
      console.log('⚙️ Actualizando configuración:', configKey);
      
      const { data, error } = await supabase
        .from('dashboard_config')
        .upsert({
          neighborhood_id: neighborhoodId,
          config_key: configKey,
          config_value: configValue,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('✅ Configuración actualizada exitosamente');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error actualizando configuración:', error);
      return { success: false, error: error.message };
    }
  }
  
  // =====================================================
  // ESTADÍSTICAS GENERALES DEL DASHBOARD
  // =====================================================
  
  async getDashboardStats(neighborhoodId) {
    try {
      console.log('📊 Obteniendo estadísticas del dashboard');
      
      // Obtener estadísticas de tickets
      const ticketsStats = await supabase
        .from('tickets')
        .select('status, priority, created_at')
        .eq('neighborhood_id', neighborhoodId);
      
      // Obtener estadísticas de campañas
      const campaignsStats = await supabase
        .from('communication_campaigns')
        .select('status, campaign_type, stats, created_at')
        .eq('neighborhood_id', neighborhoodId);
      
      // Obtener estadísticas de usuarios
      const usersStats = await supabase
        .from('users')
        .select('verified, created_at', { count: 'exact' })
        .eq('neighborhood_id', neighborhoodId);
      
      const stats = {
        tickets: {
          total: ticketsStats.data?.length || 0,
          pending: ticketsStats.data?.filter(t => t.status === 'pending').length || 0,
          in_progress: ticketsStats.data?.filter(t => t.status === 'in_progress').length || 0,
          resolved: ticketsStats.data?.filter(t => t.status === 'resolved').length || 0,
          urgent: ticketsStats.data?.filter(t => t.priority === 'urgent').length || 0
        },
        campaigns: {
          total: campaignsStats.data?.length || 0,
          sent: campaignsStats.data?.filter(c => c.status === 'sent').length || 0,
          scheduled: campaignsStats.data?.filter(c => c.status === 'scheduled').length || 0,
          draft: campaignsStats.data?.filter(c => c.status === 'draft').length || 0
        },
        users: {
          total: usersStats.count || 0,
          verified: usersStats.data?.filter(u => u.verified).length || 0
        }
      };
      
      console.log('✅ Estadísticas obtenidas exitosamente');
      return { success: true, data: stats };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return { success: false, error: error.message };
    }
  }
  
  // =====================================================
  // GESTIÓN DE USUARIOS
  // =====================================================
  
  async getNeighborhoodUsers(neighborhoodId, filters = {}) {
    try {
      console.log('👥 Obteniendo usuarios del vecindario');
      
      let query = supabase
        .from('users')
        .select('id, name, email, avatar, verified, created_at, last_login')
        .eq('neighborhood_id', neighborhoodId)
        .order('created_at', { ascending: false });
      
      if (filters.verified !== undefined) {
        query = query.eq('verified', filters.verified);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} usuarios obtenidos`);
      return { success: true, data: data || [] };
      
    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  async searchUsers(searchTerm, neighborhoodId = null) {
    try {
      console.log('🔍 Buscando usuarios:', searchTerm);
      
      let query = supabase
        .from('users')
        .select('id, name, email, avatar, verified')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .limit(20);
      
      if (neighborhoodId) {
        query = query.eq('neighborhood_id', neighborhoodId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} usuarios encontrados`);
      return { success: true, data: data || [] };
      
    } catch (error) {
      console.error('❌ Error buscando usuarios:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  // =====================================================
  // LOGS Y AUDITORÍA
  // =====================================================
  
  async logAdminAction(actionData) {
    try {
      console.log('📝 Registrando acción administrativa:', actionData);
      
      // Por ahora, usar la tabla de comentarios de tickets como log temporal
      // En producción, crear una tabla específica de logs de auditoría
      
      const logEntry = {
        action: actionData.action,
        user_id: actionData.user_id,
        neighborhood_id: actionData.neighborhood_id,
        details: actionData.details,
        timestamp: new Date().toISOString()
      };
      
      console.log('✅ Acción registrada exitosamente');
      return { success: true, data: logEntry };
      
    } catch (error) {
      console.error('❌ Error registrando acción:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SupabaseAdminService();