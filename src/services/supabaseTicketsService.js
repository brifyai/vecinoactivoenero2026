/**
 * Servicio de Tickets para Dashboard Administrativo
 * Gestión completa de tickets/reportes con geolocalización
 */
import { supabase } from '../config/supabase';

class SupabaseTicketsService {
  
  // =====================================================
  // CRUD BÁSICO DE TICKETS
  // =====================================================
  
  async createTicket(ticketData) {
    try {
      console.log('🎫 Creando ticket:', ticketData);
      
      const { data, error } = await supabase
        .from('tickets')
        .insert([{
          neighborhood_id: ticketData.neighborhood_id,
          reporter_id: ticketData.reporter_id,
          title: ticketData.title,
          description: ticketData.description,
          category: ticketData.category,
          priority: ticketData.priority || 'medium',
          location_lat: ticketData.location_lat,
          location_lng: ticketData.location_lng,
          location_address: ticketData.location_address,
          attachments: ticketData.attachments || [],
          source: ticketData.source || 'app',
          tags: ticketData.tags || []
        }])
        .select(`
          *,
          neighborhoods:neighborhood_id(nombre, codigo),
          reporter:reporter_id(name, email),
          assigned:assigned_to(name, email)
        `)
        .single();
      
      if (error) throw error;
      
      console.log('✅ Ticket creado exitosamente');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error creando ticket:', error);
      return { success: false, error: error.message };
    }
  }
  
  async getTickets(filters = {}) {
    try {
      console.log('📋 Obteniendo tickets con filtros:', filters);
      
      let query = supabase
        .from('tickets_detailed')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Aplicar filtros
      if (filters.neighborhood_id) {
        query = query.eq('neighborhood_id', filters.neighborhood_id);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} tickets obtenidos`);
      return { success: true, data: data || [] };
      
    } catch (error) {
      console.error('❌ Error obteniendo tickets:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  async getTicketById(ticketId) {
    try {
      console.log('🎫 Obteniendo ticket:', ticketId);
      
      const { data, error } = await supabase
        .from('tickets_detailed')
        .select('*')
        .eq('id', ticketId)
        .single();
      
      if (error) throw error;
      
      console.log('✅ Ticket obtenido exitosamente');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error obteniendo ticket:', error);
      return { success: false, error: error.message };
    }
  }
  
  async updateTicket(ticketId, updates) {
    try {
      console.log('📝 Actualizando ticket:', ticketId, updates);
      
      const { data, error } = await supabase
        .from('tickets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select(`
          *,
          neighborhoods:neighborhood_id(nombre, codigo),
          reporter:reporter_id(name, email),
          assigned:assigned_to(name, email)
        `)
        .single();
      
      if (error) throw error;
      
      console.log('✅ Ticket actualizado exitosamente');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error actualizando ticket:', error);
      return { success: false, error: error.message };
    }
  }
  
  async deleteTicket(ticketId) {
    try {
      console.log('🗑️ Eliminando ticket:', ticketId);
      
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);
      
      if (error) throw error;
      
      console.log('✅ Ticket eliminado exitosamente');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error eliminando ticket:', error);
      return { success: false, error: error.message };
    }
  }
  
  // =====================================================
  // GESTIÓN DE COMENTARIOS
  // =====================================================
  
  async addComment(ticketId, commentData) {
    try {
      console.log('💬 Agregando comentario al ticket:', ticketId);
      
      const { data, error } = await supabase
        .from('ticket_comments')
        .insert([{
          ticket_id: ticketId,
          author_id: commentData.author_id,
          content: commentData.content,
          comment_type: commentData.comment_type || 'comment',
          is_internal: commentData.is_internal || false,
          attachments: commentData.attachments || []
        }])
        .select(`
          *,
          author:author_id(name, email, avatar)
        `)
        .single();
      
      if (error) throw error;
      
      console.log('✅ Comentario agregado exitosamente');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error agregando comentario:', error);
      return { success: false, error: error.message };
    }
  }
  
  async getComments(ticketId) {
    try {
      console.log('💬 Obteniendo comentarios del ticket:', ticketId);
      
      const { data, error } = await supabase
        .from('ticket_comments')
        .select(`
          *,
          author:author_id(name, email, avatar)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} comentarios obtenidos`);
      return { success: true, data: data || [] };
      
    } catch (error) {
      console.error('❌ Error obteniendo comentarios:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  // =====================================================
  // ASIGNACIÓN Y ESTADO
  // =====================================================
  
  async assignTicket(ticketId, assignedTo, assignedBy) {
    try {
      console.log('👤 Asignando ticket:', ticketId, 'a:', assignedTo);
      
      // Actualizar ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .update({
          assigned_to: assignedTo,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();
      
      if (ticketError) throw ticketError;
      
      // Agregar comentario de asignación
      await this.addComment(ticketId, {
        author_id: assignedBy,
        content: `Ticket asignado a ${assignedTo}`,
        comment_type: 'assignment',
        is_internal: true
      });
      
      console.log('✅ Ticket asignado exitosamente');
      return { success: true, data: ticketData };
      
    } catch (error) {
      console.error('❌ Error asignando ticket:', error);
      return { success: false, error: error.message };
    }
  }
  
  async updateStatus(ticketId, newStatus, userId, notes = '') {
    try {
      console.log('🔄 Actualizando estado del ticket:', ticketId, 'a:', newStatus);
      
      const updates = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      // Si se resuelve o cierra, agregar timestamp
      if (newStatus === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        if (notes) updates.resolution_notes = notes;
      } else if (newStatus === 'closed') {
        updates.closed_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', ticketId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Agregar comentario de cambio de estado
      await this.addComment(ticketId, {
        author_id: userId,
        content: `Estado cambiado a: ${newStatus}${notes ? `. Notas: ${notes}` : ''}`,
        comment_type: 'status_change',
        is_internal: true
      });
      
      console.log('✅ Estado actualizado exitosamente');
      return { success: true, data };
      
    } catch (error) {
      console.error('❌ Error actualizando estado:', error);
      return { success: false, error: error.message };
    }
  }
  
  // =====================================================
  // ESTADÍSTICAS Y MÉTRICAS
  // =====================================================
  
  async getTicketStats(neighborhoodId = null) {
    try {
      console.log('📊 Obteniendo estadísticas de tickets');
      
      let query = supabase
        .from('ticket_stats_by_neighborhood')
        .select('*');
      
      if (neighborhoodId) {
        query = query.eq('neighborhood_id', neighborhoodId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log('✅ Estadísticas obtenidas exitosamente');
      return { success: true, data: data || [] };
      
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  async getTicketsByLocation(neighborhoodId, bounds = null) {
    try {
      console.log('🗺️ Obteniendo tickets por ubicación');
      
      let query = supabase
        .from('tickets')
        .select(`
          id, title, category, priority, status, location_lat, location_lng, location_address, created_at
        `)
        .eq('neighborhood_id', neighborhoodId)
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null);
      
      // Filtrar por bounds si se proporciona
      if (bounds) {
        query = query
          .gte('location_lat', bounds.south)
          .lte('location_lat', bounds.north)
          .gte('location_lng', bounds.west)
          .lte('location_lng', bounds.east);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} tickets con ubicación obtenidos`);
      return { success: true, data: data || [] };
      
    } catch (error) {
      console.error('❌ Error obteniendo tickets por ubicación:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  // =====================================================
  // BÚSQUEDA Y FILTROS AVANZADOS
  // =====================================================
  
  async searchTickets(searchTerm, filters = {}) {
    try {
      console.log('🔍 Buscando tickets:', searchTerm);
      
      let query = supabase
        .from('tickets_detailed')
        .select('*');
      
      // Búsqueda por texto
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,ticket_number.ilike.%${searchTerm}%`);
      }
      
      // Aplicar filtros adicionales
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          query = query.eq(key, filters[key]);
        }
      });
      
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log(`✅ ${data?.length || 0} tickets encontrados`);
      return { success: true, data: data || [] };
      
    } catch (error) {
      console.error('❌ Error buscando tickets:', error);
      return { success: false, error: error.message, data: [] };
    }
  }
  
  // =====================================================
  // SUSCRIPCIONES EN TIEMPO REAL
  // =====================================================
  
  subscribeToTickets(neighborhoodId, callback) {
    console.log('🔔 Suscribiéndose a tickets en tiempo real');
    
    console.warn('⚠️ Supabase Realtime deshabilitado - Usar Firebase');
    return null;
  }
  
  subscribeToComments(ticketId, callback) {
    console.warn('⚠️ Supabase Realtime deshabilitado - Usar Firebase');
    return null;
  }
}

export default new SupabaseTicketsService();