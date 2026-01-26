import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import {
  loadServices,
  addService,
  clearError
} from '../store/slices/servicesSlice';
import {
  selectAllServices,
  selectServicesLoading,
  selectServicesError,
  selectServicesByCategory,
  selectServicesByNeighborhood,
  selectServicesCount
} from '../store/selectors/servicesSelectors';
import { showSuccessToast } from '../utils/sweetalert';

export const useReduxServices = () => {
  const dispatch = useDispatch();
  const services = useSelector(selectAllServices);
  const loading = useSelector(selectServicesLoading);
  const error = useSelector(selectServicesError);
  const servicesCount = useSelector(selectServicesCount);

  const loadUserServices = () => {
    dispatch(loadServices());
  };

  const addNewService = async (serviceData) => {
    try {
      const result = await dispatch(addService(serviceData)).unwrap();
      showSuccessToast('Servicio agregado exitosamente');
      return result;
    } catch (error) {
      return { success: false, error };
    }
  };

  const clearServicesError = () => {
    dispatch(clearError());
  };

  // Helper functions - usando useMemo para optimización
  const getServicesByCategory = useMemo(() => {
    return (category) => {
      if (category === 'all') return services;
      return services.filter(service => service.category === category);
    };
  }, [services]);

  const getServicesByNeighborhood = useMemo(() => {
    return (neighborhoodId) => {
      return services.filter(service => service.neighborhoodId === neighborhoodId || !service.neighborhoodId);
    };
  }, [services]);

  return {
    services,
    loading,
    error,
    servicesCount,
    loadServices: loadUserServices,
    addService: addNewService,
    clearError: clearServicesError,
    // Helper functions
    getServicesByCategory,
    getServicesByNeighborhood
  };
};