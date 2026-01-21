import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { showSuccessToast } from '../utils/sweetalert';

const LocalBusinessContext = createContext();

export const useLocalBusiness = () => {
  const context = useContext(LocalBusinessContext);
  if (!context) {
    throw new Error('useLocalBusiness must be used within LocalBusinessProvider');
  }
  return context;
};

export const LocalBusinessProvider = ({ children }) => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = () => {
    const stored = localStorage.getItem('localBusinesses');
    if (stored) {
      setBusinesses(JSON.parse(stored));
    }
    setLoading(false);
  };

  const saveBusinesses = (updated) => {
    localStorage.setItem('localBusinesses', JSON.stringify(updated));
    setBusinesses(updated);
  };

  // Registrar negocio
  const registerBusiness = (businessData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const newBusiness = {
      id: Date.now(),
      name: businessData.name,
      description: businessData.description,
      category: businessData.category, // comercio, servicio, profesional, emprendimiento
      subcategory: businessData.subcategory,
      ownerId: user.id,
      ownerName: user.name,
      ownerAvatar: user.avatar,
      neighborhoodId: user.neighborhoodId,
      neighborhoodName: user.neighborhoodName,
      neighborhoodCode: user.neighborhoodCode,
      address: businessData.address,
      phone: businessData.phone,
      email: businessData.email,
      website: businessData.website || '',
      whatsapp: businessData.whatsapp || '',
      instagram: businessData.instagram || '',
      facebook: businessData.facebook || '',
      hours: businessData.hours || {},
      images: businessData.images || [],
      logo: businessData.logo || '',
      tags: businessData.tags || [],
      services: businessData.services || [],
      priceRange: businessData.priceRange || 'medio', // bajo, medio, alto
      acceptsCards: businessData.acceptsCards || false,
      hasDelivery: businessData.hasDelivery || false,
      reviews: [],
      rating: 0,
      totalReviews: 0,
      offers: [],
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...businesses, newBusiness];
    saveBusinesses(updated);
    showSuccessToast('¡Negocio registrado exitosamente!');
    
    return { success: true, business: newBusiness };
  };

  // Agregar reseña
  const addReview = (businessId, reviewData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = businesses.map(business => {
      if (business.id === businessId) {
        // Verificar si ya dejó reseña
        const hasReviewed = business.reviews.some(r => r.userId === user.id);
        if (hasReviewed) {
          return business;
        }

        const newReview = {
          id: Date.now(),
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          rating: reviewData.rating,
          comment: reviewData.comment,
          images: reviewData.images || [],
          createdAt: new Date().toISOString()
        };

        const updatedReviews = [...business.reviews, newReview];
        const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / updatedReviews.length;

        return {
          ...business,
          reviews: updatedReviews,
          rating: Math.round(avgRating * 10) / 10,
          totalReviews: updatedReviews.length,
          updatedAt: new Date().toISOString()
        };
      }
      return business;
    });

    saveBusinesses(updated);
    showSuccessToast('¡Reseña publicada!');
    return { success: true };
  };

  // Crear oferta
  const createOffer = (businessId, offerData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = businesses.map(business => {
      if (business.id === businessId && business.ownerId === user.id) {
        const newOffer = {
          id: Date.now(),
          title: offerData.title,
          description: offerData.description,
          discount: offerData.discount,
          validUntil: offerData.validUntil,
          code: offerData.code || '',
          terms: offerData.terms || '',
          isActive: true,
          createdAt: new Date().toISOString()
        };

        return {
          ...business,
          offers: [...business.offers, newOffer],
          updatedAt: new Date().toISOString()
        };
      }
      return business;
    });

    saveBusinesses(updated);
    showSuccessToast('¡Oferta creada!');
    return { success: true };
  };

  // Actualizar negocio
  const updateBusiness = (businessId, updates) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = businesses.map(business => {
      if (business.id === businessId && business.ownerId === user.id) {
        return {
          ...business,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return business;
    });

    saveBusinesses(updated);
    showSuccessToast('Negocio actualizado');
    return { success: true };
  };

  // Filtros
  const getBusinessesByNeighborhood = (neighborhoodId) => {
    return businesses.filter(b => b.neighborhoodId === neighborhoodId && b.isActive);
  };

  const getBusinessesByCategory = (category) => {
    return businesses.filter(b => b.category === category && b.isActive);
  };

  const searchBusinesses = (query) => {
    const lowerQuery = query.toLowerCase();
    return businesses.filter(b => 
      b.isActive && (
        b.name.toLowerCase().includes(lowerQuery) ||
        b.description.toLowerCase().includes(lowerQuery) ||
        b.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    );
  };

  const getTopRatedBusinesses = (limit = 10) => {
    return businesses
      .filter(b => b.isActive && b.totalReviews > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  };

  const getMyBusinesses = () => {
    if (!user) return [];
    return businesses.filter(b => b.ownerId === user.id);
  };

  const value = {
    businesses,
    loading,
    registerBusiness,
    addReview,
    createOffer,
    updateBusiness,
    getBusinessesByNeighborhood,
    getBusinessesByCategory,
    searchBusinesses,
    getTopRatedBusinesses,
    getMyBusinesses,
    refreshBusinesses: loadBusinesses
  };

  return <LocalBusinessContext.Provider value={value}>{children}</LocalBusinessContext.Provider>;
};
