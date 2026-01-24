import { supabase } from '../config/supabase';

class SupabaseHelpService {
  async getHelpRequests(neighborhoodId = null, status = null) {
    let query = supabase
      .from('help_requests')
      .select(`
        *,
        requester:users!help_requests_requester_id_fkey(id, name, avatar, phone),
        offers:help_offers(
          *,
          helper:users!help_offers_helper_id_fkey(id, name, avatar, phone)
        )
      `)
      .order('created_at', { ascending: false });

    if (neighborhoodId) {
      query = query.eq('neighborhood_id', neighborhoodId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getHelpRequestById(requestId) {
    const { data, error } = await supabase
      .from('help_requests')
      .select(`
        *,
        requester:users!help_requests_requester_id_fkey(id, name, avatar, phone),
        offers:help_offers(
          *,
          helper:users!help_offers_helper_id_fkey(id, name, avatar, phone)
        )
      `)
      .eq('id', requestId)
      .single();

    if (error) throw error;
    return data;
  }

  async createHelpRequest(requestData) {
    const slug = requestData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('help_requests')
      .insert([{
        slug,
        type: requestData.type,
        title: requestData.title,
        description: requestData.description,
        urgency: requestData.urgency || 'normal',
        requester_id: requestData.requesterId,
        neighborhood_id: requestData.neighborhoodId,
        location: requestData.location || null,
        images: requestData.images || [],
        status: 'abierta'
      }])
      .select(`*, requester:users!help_requests_requester_id_fkey(id, name, avatar, phone)`)
      .single();

    if (error) throw error;
    return data;
  }

  async updateHelpRequest(requestId, updates, userId) {
    // Verify ownership
    const { data: request } = await supabase
      .from('help_requests')
      .select('requester_id')
      .eq('id', requestId)
      .single();

    if (!request || request.requester_id !== userId) {
      throw new Error('No autorizado');
    }

    const { data, error } = await supabase
      .from('help_requests')
      .update(updates)
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async offerHelp(offerData) {
    const { data, error } = await supabase
      .from('help_offers')
      .insert([{
        request_id: offerData.requestId,
        helper_id: offerData.helperId,
        message: offerData.message,
        availability: offerData.availability
      }])
      .select(`*, helper:users!help_offers_helper_id_fkey(id, name, avatar, phone)`)
      .single();

    if (error) throw error;
    return data;
  }

  async acceptOffer(requestId, offerId, userId) {
    // Verify ownership
    const { data: request } = await supabase
      .from('help_requests')
      .select('requester_id')
      .eq('id', requestId)
      .single();

    if (!request || request.requester_id !== userId) {
      throw new Error('No autorizado');
    }

    // Update request status
    const { data, error } = await supabase
      .from('help_requests')
      .update({
        status: 'en_proceso',
        accepted_offer_id: offerId
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async resolveRequest(requestId, userId) {
    // Verify ownership
    const { data: request } = await supabase
      .from('help_requests')
      .select('requester_id')
      .eq('id', requestId)
      .single();

    if (!request || request.requester_id !== userId) {
      throw new Error('No autorizado');
    }

    const { data, error } = await supabase
      .from('help_requests')
      .update({
        status: 'resuelta',
        resolved_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async cancelRequest(requestId, userId) {
    // Verify ownership
    const { data: request } = await supabase
      .from('help_requests')
      .select('requester_id')
      .eq('id', requestId)
      .single();

    if (!request || request.requester_id !== userId) {
      throw new Error('No autorizado');
    }

    const { data, error } = await supabase
      .from('help_requests')
      .update({ status: 'cancelada' })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRequest(requestId, userId) {
    // Verify ownership
    const { data: request } = await supabase
      .from('help_requests')
      .select('requester_id')
      .eq('id', requestId)
      .single();

    if (!request || request.requester_id !== userId) {
      throw new Error('No autorizado');
    }

    const { error } = await supabase
      .from('help_requests')
      .delete()
      .eq('id', requestId);

    if (error) throw error;
    return true;
  }

  async getMyRequests(userId) {
    const { data, error } = await supabase
      .from('help_requests')
      .select(`
        *,
        requester:users!help_requests_requester_id_fkey(id, name, avatar, phone),
        offers:help_offers(count)
      `)
      .eq('requester_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getMyOffers(userId) {
    const { data, error } = await supabase
      .from('help_offers')
      .select(`
        *,
        request:help_requests!help_offers_request_id_fkey(
          *,
          requester:users!help_requests_requester_id_fkey(id, name, avatar, phone)
        )
      `)
      .eq('helper_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

export default new SupabaseHelpService();
