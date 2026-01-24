import { supabase } from '../config/supabase';

class SupabaseCalendarService {
  async getCalendarEvents(neighborhoodId = null, startDate = null, endDate = null) {
    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        creator:users!calendar_events_creator_id_fkey(id, name, avatar),
        attendees:calendar_attendees(
          *,
          user:users!calendar_attendees_user_id_fkey(id, name, avatar)
        )
      `)
      .order('start_date', { ascending: true });

    if (neighborhoodId) {
      query = query.eq('neighborhood_id', neighborhoodId);
    }

    if (startDate) {
      query = query.gte('start_date', startDate);
    }

    if (endDate) {
      query = query.lte('end_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createCalendarEvent(eventData) {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert([{
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.eventType,
        start_date: eventData.startDate,
        end_date: eventData.endDate,
        location: eventData.location || null,
        creator_id: eventData.creatorId,
        neighborhood_id: eventData.neighborhoodId,
        max_attendees: eventData.maxAttendees || null,
        requires_rsvp: eventData.requiresRsvp || false,
        is_recurring: eventData.isRecurring || false,
        recurrence_pattern: eventData.recurrencePattern || null
      }])
      .select(`*, creator:users!calendar_events_creator_id_fkey(id, name, avatar)`)
      .single();

    if (error) throw error;
    return data;
  }

  async updateCalendarEvent(eventId, updates, userId) {
    const { data: event } = await supabase
      .from('calendar_events')
      .select('creator_id')
      .eq('id', eventId)
      .single();

    if (!event || event.creator_id !== userId) {
      throw new Error('No autorizado');
    }

    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCalendarEvent(eventId, userId) {
    const { data: event } = await supabase
      .from('calendar_events')
      .select('creator_id')
      .eq('id', eventId)
      .single();

    if (!event || event.creator_id !== userId) {
      throw new Error('No autorizado');
    }

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
    return true;
  }

  async rsvpToEvent(eventId, userId, status = 'asistire') {
    const { data: existing } = await supabase
      .from('calendar_attendees')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('calendar_attendees')
        .update({ status })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('calendar_attendees')
        .insert([{ event_id: eventId, user_id: userId, status }])
        .select(`*, user:users!calendar_attendees_user_id_fkey(id, name, avatar)`)
        .single();

      if (error) throw error;
      return data;
    }
  }

  async removeRsvp(eventId, userId) {
    const { error } = await supabase
      .from('calendar_attendees')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  async getEventAttendees(eventId) {
    const { data, error } = await supabase
      .from('calendar_attendees')
      .select(`*, user:users!calendar_attendees_user_id_fkey(id, name, avatar)`)
      .eq('event_id', eventId);

    if (error) throw error;
    return data;
  }
}

export default new SupabaseCalendarService();
