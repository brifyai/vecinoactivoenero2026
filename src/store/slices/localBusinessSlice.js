import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { showSuccessToast } from '../../utils/sweetalert';

export const loadBusinesses = createAsyncThunk('localBusiness/loadBusinesses', async () => {
  const stored = localStorage.getItem('localBusinesses');
  return stored ? JSON.parse(stored) : [];
});

export const registerBusiness = createAsyncThunk('localBusiness/registerBusiness', async ({ businessData, user }, { getState }) => {
  if (!user) throw new Error('Usuario no autenticado');
  
  const newBusiness = {
    id: Date.now(), name: businessData.name, description: businessData.description,
    category: businessData.category, subcategory: businessData.subcategory,
    ownerId: user.id, ownerName: user.name, ownerAvatar: user.avatar,
    neighborhoodId: user.neighborhoodId, neighborhoodName: user.neighborhoodName, neighborhoodCode: user.neighborhoodCode,
    address: businessData.address, phone: businessData.phone, email: businessData.email,
    website: businessData.website || '', whatsapp: businessData.whatsapp || '',
    instagram: businessData.instagram || '', facebook: businessData.facebook || '',
    hours: businessData.hours || {}, images: businessData.images || [], logo: businessData.logo || '',
    tags: businessData.tags || [], services: businessData.services || [],
    priceRange: businessData.priceRange || 'medio', acceptsCards: businessData.acceptsCards || false,
    hasDelivery: businessData.hasDelivery || false, reviews: [], rating: 0, totalReviews: 0,
    offers: [], isVerified: false, isActive: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  
  const { businesses } = getState().localBusiness;
  const updated = [...businesses, newBusiness];
  localStorage.setItem('localBusinesses', JSON.stringify(updated));
  showSuccessToast('¡Negocio registrado exitosamente!');
  return newBusiness;
});

export const addReview = createAsyncThunk('localBusiness/addReview', async ({ businessId, reviewData, user }, { getState }) => {
  if (!user) throw new Error('Usuario no autenticado');
  const { businesses } = getState().localBusiness;
  const business = businesses.find(b => b.id === businessId);
  if (!business) throw new Error('Negocio no encontrado');
  
  const hasReviewed = business.reviews.some(r => r.userId === user.id);
  if (hasReviewed) throw new Error('Ya has dejado una reseña');
  
  const newReview = {
    id: Date.now(), userId: user.id, userName: user.name, userAvatar: user.avatar,
    rating: reviewData.rating, comment: reviewData.comment, images: reviewData.images || [],
    createdAt: new Date().toISOString()
  };
  
  const updatedReviews = [...business.reviews, newReview];
  const avgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
  
  const updated = businesses.map(b => b.id === businessId ? {
    ...b, reviews: updatedReviews, rating: Math.round(avgRating * 10) / 10,
    totalReviews: updatedReviews.length, updatedAt: new Date().toISOString()
  } : b);
  
  localStorage.setItem('localBusinesses', JSON.stringify(updated));
  showSuccessToast('¡Reseña publicada!');
  return { businessId, review: newReview, rating: Math.round(avgRating * 10) / 10 };
});

export const createOffer = createAsyncThunk('localBusiness/createOffer', async ({ businessId, offerData, user }, { getState }) => {
  if (!user) throw new Error('Usuario no autenticado');
  const { businesses } = getState().localBusiness;
  const business = businesses.find(b => b.id === businessId);
  if (!business || business.ownerId !== user.id) throw new Error('No autorizado');
  
  const newOffer = {
    id: Date.now(), title: offerData.title, description: offerData.description,
    discount: offerData.discount, validUntil: offerData.validUntil, code: offerData.code || '',
    terms: offerData.terms || '', isActive: true, createdAt: new Date().toISOString()
  };
  
  const updated = businesses.map(b => b.id === businessId ? {
    ...b, offers: [...b.offers, newOffer], updatedAt: new Date().toISOString()
  } : b);
  
  localStorage.setItem('localBusinesses', JSON.stringify(updated));
  showSuccessToast('¡Oferta creada!');
  return { businessId, offer: newOffer };
});

export const updateBusiness = createAsyncThunk('localBusiness/updateBusiness', async ({ businessId, updates, user }, { getState }) => {
  if (!user) throw new Error('Usuario no autenticado');
  const { businesses } = getState().localBusiness;
  const business = businesses.find(b => b.id === businessId);
  if (!business || business.ownerId !== user.id) throw new Error('No autorizado');
  
  const updated = businesses.map(b => b.id === businessId ? {
    ...b, ...updates, updatedAt: new Date().toISOString()
  } : b);
  
  localStorage.setItem('localBusinesses', JSON.stringify(updated));
  showSuccessToast('Negocio actualizado');
  return { businessId, updates };
});

const localBusinessSlice = createSlice({
  name: 'localBusiness',
  initialState: { businesses: [], loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(loadBusinesses.pending, (state) => { state.loading = true; })
      .addCase(loadBusinesses.fulfilled, (state, action) => { state.businesses = action.payload; state.loading = false; })
      .addCase(registerBusiness.fulfilled, (state, action) => { state.businesses.push(action.payload); })
      .addCase(addReview.fulfilled, (state, action) => {
        const business = state.businesses.find(b => b.id === action.payload.businessId);
        if (business) {
          business.reviews.push(action.payload.review);
          business.rating = action.payload.rating;
          business.totalReviews = business.reviews.length;
        }
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        const business = state.businesses.find(b => b.id === action.payload.businessId);
        if (business) business.offers.push(action.payload.offer);
      })
      .addCase(updateBusiness.fulfilled, (state, action) => {
        const business = state.businesses.find(b => b.id === action.payload.businessId);
        if (business) Object.assign(business, action.payload.updates);
      });
  }
});

export const { clearError } = localBusinessSlice.actions;
export default localBusinessSlice.reducer;
