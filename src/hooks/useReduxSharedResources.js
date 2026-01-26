import { useSelector, useDispatch } from 'react-redux';
import {
  loadResources,
  loadReservations,
  addResource,
  reserveResource,
  completeReservation,
  clearError
} from '../store/slices/sharedResourcesSlice';
import {
  selectResources,
  selectReservations,
  selectResourcesLoading,
  selectMyReservations,
  selectMyResources,
  selectPendingRequests,
  selectResourcesByCategory
} from '../store/selectors/sharedResourcesSelectors';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast } from '../utils/sweetalert';

export const useReduxSharedResources = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const resources = useSelector(selectResources);
  const reservations = useSelector(selectReservations);
  const loading = useSelector(selectResourcesLoading);
  const error = null; // No hay selector de error disponible

  const loadUserResources = (neighborhoodId, category = null) => {
    dispatch(loadResources({ neighborhoodId, category }));
  };

  const loadUserReservations = (resourceId = null) => {
    if (user) {
      dispatch(loadReservations({ userId: user.id, resourceId }));
    }
  };

  const addNewResource = async (resourceData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const result = await dispatch(addResource({
        ...resourceData,
        ownerId: user.id,
        createdAt: new Date().toISOString()
      })).unwrap();
      showSuccessToast('Recurso agregado exitosamente');
      return { success: true, resource: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  const makeReservation = async (resourceId, reservationData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const result = await dispatch(reserveResource({
        ...reservationData,
        resourceId,
        userId: user.id,
        createdAt: new Date().toISOString()
      })).unwrap();
      showSuccessToast('Reserva realizada exitosamente');
      return { success: true, reservation: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  const completeReservationAction = async (reservationId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      await dispatch(completeReservation({ reservationId, userId: user.id })).unwrap();
      showSuccessToast('Reserva completada');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const clearResourcesError = () => {
    dispatch(clearError());
  };

  // Helper functions from SharedResourcesContext
  const getMyResources = () => {
    if (!user) return [];
    return resources.filter(resource => resource.ownerId === user.id);
  };

  const getMyReservations = () => {
    if (!user) return [];
    return reservations.filter(reservation => reservation.userId === user.id);
  };

  const getPendingRequests = () => {
    if (!user) return [];
    const myResources = getMyResources();
    const myResourceIds = myResources.map(r => r.id);
    return reservations.filter(reservation => 
      myResourceIds.includes(reservation.resourceId) && 
      reservation.status === 'pending'
    );
  };

  const getResourcesByCategory = (category) => {
    if (category === 'all') return resources;
    return resources.filter(resource => resource.category === category);
  };

  return {
    resources,
    reservations,
    loading,
    error,
    loadResources: loadUserResources,
    loadReservations: loadUserReservations,
    addResource: addNewResource,
    reserveResource: makeReservation,
    completeReservation: completeReservationAction,
    clearError: clearResourcesError,
    // Helper functions
    getMyResources,
    getMyReservations,
    getPendingRequests,
    getResourcesByCategory
  };
};