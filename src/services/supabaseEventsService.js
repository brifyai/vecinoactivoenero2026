import { supabase } from '../config/supabase';

class SupabaseEventsService {
  
  async getEvents(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          creator:users!events_created_by_fkey(id, name, avatar),
          attendees:event_attendees(
            id,
            status,
            user:users(id, name, avatar)
          )
        `)
        .order('date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      throw error;
    }
  }

  async getUserEvents(userId) {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          event:events(
            *,
            creator:users!events_created_by_fkey(id, name, avatar),
            attendees:event_attendees(count)
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data.map(item => item.event);
    } catch (error) {
      console.error('Error al obtener eventos del usuario:', error);
      throw error;
    }
  }

  async createEvent({ title, description, date, time, location, image, createdBy, category, privacy }) {
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            slug,
            title,
            description,
            date,
            time,
            location,
            image,
            created_by: createdBy,
            category,
            privacy: privacy || 'public'
          }
        ])
        .select(`
          *,
          creator:users!events_created_by_fkey(id, name, avatar)
        `)
        .single();

      if (error) throw error;

      // Auto-agregar creador como asistente
      await this.rsvpEvent(data.id, createdBy, 'going');

      return data;
    } catch (error) {
      console.error('Error al crear evento:', error);
      throw error;
    }
  }

  async rsvpEvent(eventId, userId, status) {
    try {
      // Eliminar RSVP anterior si existe
      await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (status !== 'not-going') {
        // Agregar nuevo RSVP
        const { data, error } = await supabase
          .from('event_attendees')
          .insert([
            {
              event_id: eventId,
              user_id: userId,
              status
            }
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      return { removed: true };
    } catch (error) {
      console.error('Error al confirmar asistencia:', error);
      throw error;
    }
  }

  async updateEvent(eventId, updates) {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      throw error;
    }
  }

  async deleteEvent(eventId) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      throw error;
    }
  }

  subscribeToEvents(callback) {
    return supabase
      .channel('events')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events'
      }, callback)
      .subscribe();
  }
}

export default new SupabaseEventsService();
