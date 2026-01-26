import { useSelector, useDispatch } from 'react-redux';
import {
  loadBusinesses,
  registerBusiness,
  addReview,
  createOffer,
  clearError
} from '../store/slices/localBusinessSlice';
import {
  selectBusinesses,
  selectBusinessesLoading,
  selectBusinessesByCategory,
  selectTopRatedBusinesses,
  selectMyBusinesses
} from '../store/selectors/localBusinessSelectors';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast } from '../utils/sweetalert';

export const useReduxLocalBusiness = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const businesses = useSelector(selectBusinesses);
  const loading = useSelector(selectBusinessesLoading);
  const error = null; // No hay selector de error disponible

  const loadUserBusinesses = (neighborhoodId, category = null) => {
    dispatch(loadBusinesses({ neighborhoodId, category }));
  };

  const registerNewBusiness = async (businessData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const result = await dispatch(registerBusiness({
        ...businessData,
        ownerId: user.id,
        createdAt: new Date().toISOString()
      })).unwrap();
      showSuccessToast('Negocio registrado exitosamente');
      return { success: true, business: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  const addBusinessReview = async (businessId, reviewData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      await dispatch(addReview({
        businessId,
        reviewData: {
          ...reviewData,
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar,
          createdAt: new Date().toISOString()
        }
      })).unwrap();
      showSuccessToast('Reseña agregada exitosamente');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const createBusinessOffer = async (businessId, offerData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      await dispatch(createOffer({
        businessId,
        offerData: {
          ...offerData,
          createdAt: new Date().toISOString()
        },
        userId: user.id
      })).unwrap();
      showSuccessToast('Oferta creada exitosamente');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const clearBusinessError = () => {
    dispatch(clearError());
  };

  // Helper functions from LocalBusinessContext
  const searchBusinesses = (query) => {
    if (!query.trim()) return businesses;
    
    const lowerQuery = query.toLowerCase();
    return businesses.filter(business => 
      business.name.toLowerCase().includes(lowerQuery) ||
      business.description.toLowerCase().includes(lowerQuery) ||
      business.category.toLowerCase().includes(lowerQuery)
    );
  };

  const getBusinessesByCategory = (category) => {
    if (category === 'all') return businesses;
    return businesses.filter(business => business.category === category);
  };

  const getFeaturedBusinesses = () => {
    return businesses.filter(business => business.featured);
  };

  const getMyBusinesses = () => {
    if (!user) return [];
    return businesses.filter(business => business.ownerId === user.id);
  };

  return {
    businesses,
    loading,
    error,
    loadBusinesses: loadUserBusinesses,
    registerBusiness: registerNewBusiness,
    addReview: addBusinessReview,
    createOffer: createBusinessOffer,
    clearError: clearBusinessError,
    // Helper functions
    searchBusinesses,
    getBusinessesByCategory,
    getFeaturedBusinesses,
    getMyBusinesses
  };
};