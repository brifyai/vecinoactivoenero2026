import { supabase } from '../config/supabase';

class SupabaseResourcesService {
  async getResources(neighborhoodId = null, category = null) {
    let query = supabase
      .from('shared_resources')
      .select(`
        *,
        owner:users!shared_resources_owner_id_fkey(id, name, avatar, phone),
        reviews:resource_reviews(
          *,
          user:users!resource_reviews_user_id_fkey(id, name, avatar)
        )
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (neighborhoodId) {
      query = query.eq('neighborhood_id', neighborhoodId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getResourceById(resourceId) {
    const { data, error } = await supabase
      .from('shared_resources')
      .select(`
        *,
        owner:users!shared_resources_owner_id_fkey(id, name, avatar, phone),
        reviews:resource_reviews(
          *,
          user:users!resource_reviews_user_id_fkey(id, name, avatar)
        )
      `)
      .eq('id', resourceId)
      .single();

    if (error) throw error;
    return data;
  }

  async addResource(resourceData) {
    const slug = resourceData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('shared_resources')
      .insert([{
        slug,
        name: resourceData.name,
        description: resourceData.description,
        category: resourceData.category,
        subcategory: resourceData.subcategory,
        owner_id: resourceData.ownerId,
        neighborhood_id: resourceData.neighborhoodId,
        condition: resourceData.condition || 'bueno',
        images: resourceData.images || [],
        requires_deposit: resourceData.requiresDeposit || false,
        deposit_amount: resourceData.depositAmount || 0,
        max_loan_days: resourceData.maxLoanDays || 7,
        rules: resourceData.rules || null,
        is_available: true
      }])
      .select(`*, owner:users!shared_resources_owner_id_fkey(id, name, avatar, phone)`)
      .single();

    if (error) throw error;
    return data;
  }

  async updateResource(resourceId, updates, userId) {
    // Verify ownership
    const { data: resource } = await supabase
      .from('shared_resources')
      .select('owner_id')
      .eq('id', resourceId)
      .single();

    if (!resource || resource.owner_id !== userId) {
      throw new Error('No autorizado');
    }

    const { data, error } = await supabase
      .from('shared_resources')
      .update(updates)
      .eq('id', resourceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteResource(resourceId, userId) {
    // Verify ownership
    const { data: resource } = await supabase
      .from('shared_resources')
      .select('owner_id')
      .eq('id', resourceId)
      .single();

    if (!resource || resource.owner_id !== userId) {
      throw new Error('No autorizado');
    }

    const { error } = await supabase
      .from('shared_resources')
      .delete()
      .eq('id', resourceId);

    if (error) throw error;
    return true;
  }

  // Reservations
  async getReservations(userId = null, resourceId = null) {
    let query = supabase
      .from('resource_reservations')
      .select(`
        *,
        resource:shared_resources!resource_reservations_resource_id_fkey(id, name, images),
        owner:users!resource_reservations_owner_id_fkey(id, name, avatar, phone),
        borrower:users!resource_reservations_borrower_id_fkey(id, name, avatar, phone)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.or(`borrower_id.eq.${userId},owner_id.eq.${userId}`);
    }

    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async reserveResource(reservationData) {
    // Check for conflicts
    const { data: conflicts } = await supabase
      .from('resource_reservations')
      .select('id')
      .eq('resource_id', reservationData.resourceId)
      .eq('status', 'activa')
      .or(`start_date.lte.${reservationData.endDate},end_date.gte.${reservationData.startDate}`);

    if (conflicts && conflicts.length > 0) {
      throw new Error('Ya hay una reserva en esas fechas');
    }

    const { data, error } = await supabase
      .from('resource_reservations')
      .insert([{
        resource_id: reservationData.resourceId,
        owner_id: reservationData.ownerId,
        borrower_id: reservationData.borrowerId,
        start_date: reservationData.startDate,
        end_date: reservationData.endDate,
        purpose: reservationData.purpose || null,
        status: 'pendiente'
      }])
      .select(`
        *,
        resource:shared_resources!resource_reservations_resource_id_fkey(id, name, images),
        owner:users!resource_reservations_owner_id_fkey(id, name, avatar, phone),
        borrower:users!resource_reservations_borrower_id_fkey(id, name, avatar, phone)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async approveReservation(reservationId, userId) {
    // Verify ownership
    const { data: reservation } = await supabase
      .from('resource_reservations')
      .select('owner_id')
      .eq('id', reservationId)
      .single();

    if (!reservation || reservation.owner_id !== userId) {
      throw new Error('No autorizado');
    }

    const { data, error } = await supabase
      .from('resource_reservations')
      .update({ status: 'activa' })
      .eq('id', reservationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async completeReservation(reservationId, returnData, userId) {
    // Verify ownership
    const { data: reservation } = await supabase
      .from('resource_reservations')
      .select('owner_id, resource_id')
      .eq('id', reservationId)
      .single();

    if (!reservation || reservation.owner_id !== userId) {
      throw new Error('No autorizado');
    }

    // Update reservation
    const { data, error } = await supabase
      .from('resource_reservations')
      .update({
        status: 'completada',
        returned_in_good_condition: returnData.inGoodCondition,
        borrower_rating: returnData.rating
      })
      .eq('id', reservationId)
      .select()
      .single();

    if (error) throw error;

    // Increment total loans
    await supabase.rpc('increment_resource_loans', { resource_id: reservation.resource_id });

    return data;
  }

  async cancelReservation(reservationId, userId) {
    // Verify user is borrower or owner
    const { data: reservation } = await supabase
      .from('resource_reservations')
      .select('borrower_id, owner_id')
      .eq('id', reservationId)
      .single();

    if (!reservation || (reservation.borrower_id !== userId && reservation.owner_id !== userId)) {
      throw new Error('No autorizado');
    }

    const { data, error } = await supabase
      .from('resource_reservations')
      .update({ status: 'cancelada' })
      .eq('id', reservationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addReview(resourceId, reviewData) {
    const { data, error } = await supabase
      .from('resource_reviews')
      .insert([{
        resource_id: resourceId,
        user_id: reviewData.userId,
        rating: reviewData.rating,
        comment: reviewData.comment
      }])
      .select(`*, user:users!resource_reviews_user_id_fkey(id, name, avatar)`)
      .single();

    if (error) throw error;

    // Update resource rating
    await supabase.rpc('update_resource_rating', { resource_id: resourceId });

    return data;
  }
}

export default new SupabaseResourcesService();
