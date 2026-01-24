import { supabase } from '../config/supabase';

class SupabaseBusinessService {
  async getBusinesses(neighborhoodId = null, category = null) {
    let query = supabase
      .from('businesses')
      .select(`
        *,
        owner:users!businesses_owner_id_fkey(id, name, avatar),
        reviews:business_reviews(
          *,
          user:users!business_reviews_user_id_fkey(id, name, avatar)
        ),
        offers:business_offers(*)
      `)
      .eq('is_active', true)
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

  async getBusinessById(businessId) {
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        owner:users!businesses_owner_id_fkey(id, name, avatar, phone, email),
        reviews:business_reviews(
          *,
          user:users!business_reviews_user_id_fkey(id, name, avatar)
        ),
        offers:business_offers(*)
      `)
      .eq('id', businessId)
      .single();

    if (error) throw error;
    return data;
  }

  async registerBusiness(businessData) {
    const { data, error } = await supabase
      .from('businesses')
      .insert([{
        name: businessData.name,
        description: businessData.description,
        category: businessData.category,
        subcategory: businessData.subcategory,
        owner_id: businessData.ownerId,
        neighborhood_id: businessData.neighborhoodId,
        address: businessData.address,
        phone: businessData.phone,
        email: businessData.email,
        website: businessData.website || null,
        whatsapp: businessData.whatsapp || null,
        instagram: businessData.instagram || null,
        facebook: businessData.facebook || null,
        hours: businessData.hours || {},
        images: businessData.images || [],
        logo: businessData.logo || null,
        tags: businessData.tags || [],
        services: businessData.services || [],
        price_range: businessData.priceRange || 'medio',
        accepts_cards: businessData.acceptsCards || false,
        has_delivery: businessData.hasDelivery || false,
        is_verified: false,
        is_active: true
      }])
      .select(`*, owner:users!businesses_owner_id_fkey(id, name, avatar)`)
      .single();

    if (error) throw error;
    return data;
  }

  async updateBusiness(businessId, updates, userId) {
    // Verify ownership
    const { data: business } = await supabase
      .from('businesses')
      .select('owner_id')
      .eq('id', businessId)
      .single();

    if (!business || business.owner_id !== userId) {
      throw new Error('No autorizado');
    }

    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', businessId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addReview(businessId, reviewData) {
    // Check if user already reviewed
    const { data: existing } = await supabase
      .from('business_reviews')
      .select('id')
      .eq('business_id', businessId)
      .eq('user_id', reviewData.userId)
      .single();

    if (existing) {
      throw new Error('Ya has dejado una reseña');
    }

    // Add review
    const { data: review, error: reviewError } = await supabase
      .from('business_reviews')
      .insert([{
        business_id: businessId,
        user_id: reviewData.userId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        images: reviewData.images || []
      }])
      .select(`*, user:users!business_reviews_user_id_fkey(id, name, avatar)`)
      .single();

    if (reviewError) throw reviewError;

    // Update business rating
    await supabase.rpc('update_business_rating', { business_id: businessId });

    return review;
  }

  async createOffer(businessId, offerData, userId) {
    // Verify ownership
    const { data: business } = await supabase
      .from('businesses')
      .select('owner_id')
      .eq('id', businessId)
      .single();

    if (!business || business.owner_id !== userId) {
      throw new Error('No autorizado');
    }

    const { data, error } = await supabase
      .from('business_offers')
      .insert([{
        business_id: businessId,
        title: offerData.title,
        description: offerData.description,
        discount: offerData.discount,
        valid_until: offerData.validUntil,
        code: offerData.code || null,
        terms: offerData.terms || null,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateOffer(offerId, updates, userId) {
    // Verify ownership through business
    const { data: offer } = await supabase
      .from('business_offers')
      .select('business_id, businesses!inner(owner_id)')
      .eq('id', offerId)
      .single();

    if (!offer || offer.businesses.owner_id !== userId) {
      throw new Error('No autorizado');
    }

    const { data, error } = await supabase
      .from('business_offers')
      .update(updates)
      .eq('id', offerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteOffer(offerId, userId) {
    // Verify ownership through business
    const { data: offer } = await supabase
      .from('business_offers')
      .select('business_id, businesses!inner(owner_id)')
      .eq('id', offerId)
      .single();

    if (!offer || offer.businesses.owner_id !== userId) {
      throw new Error('No autorizado');
    }

    const { error } = await supabase
      .from('business_offers')
      .delete()
      .eq('id', offerId);

    if (error) throw error;
    return true;
  }

  async searchBusinesses(searchTerm, filters = {}) {
    let query = supabase
      .from('businesses')
      .select(`
        *,
        owner:users!businesses_owner_id_fkey(id, name, avatar)
      `)
      .eq('is_active', true)
      .ilike('name', `%${searchTerm}%`);

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.neighborhoodId) {
      query = query.eq('neighborhood_id', filters.neighborhoodId);
    }

    if (filters.hasDelivery) {
      query = query.eq('has_delivery', true);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}

export default new SupabaseBusinessService();
