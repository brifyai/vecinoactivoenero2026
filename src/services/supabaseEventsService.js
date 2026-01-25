import { supabase } from '../config/supabase';

class SupabaseEventsService {
  // Obtener eventos
  async getEvents(neighborhoodId, filters = {}) {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          created_by_user:created_by(id, username, full_name, avatar_url),
          event_attendees(user_id, status)
        `)
        .order('date', { ascending: true });

      // Aplicar filtros
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.privacy) {
        query = query.eq('privacy', filters.privacy);
      }

      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting events:', error);
      throw error;
    }
  }

  // Crear evento
  async createEvent(eventData) {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select(`
          *,
          created_by_user:created_by(id, username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // RSVP a evento
  async rsvpToEvent(eventId, userId, status) {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .upsert([
          {
            event_id: eventId,
            user_id: userId,
            status: status
          }
        ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      throw error;
    }
  }

  // Actualizar evento
  async updateEvent(eventId, updates, userId) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .eq('created_by', userId)
        .select(`
          *,
          created_by_user:created_by(id, username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // Eliminar evento
  async deleteEvent(eventId, userId) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('created_by', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // Obtener asistentes del evento
  async getEventAttendees(eventId) {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          *,
          user:user_id(id, username, full_name, avatar_url)
        `)
        .eq('event_id', eventId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting event attendees:', error);
      throw error;
    }
  }

  // Obtener evento por ID
  async getEventById(eventId) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          created_by_user:created_by(id, username, full_name, avatar_url),
          event_attendees(user_id, status)
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting event by ID:', error);
      throw error;
    }
  }

  // Obtener evento por slug
  async getEventBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          created_by_user:created_by(id, username, full_name, avatar_url),
          event_attendees(user_id, status)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting event by slug:', error);
      throw error;
    }
  }
}

const supabaseEventsService = new SupabaseEventsService();
export default supabaseEventsService;