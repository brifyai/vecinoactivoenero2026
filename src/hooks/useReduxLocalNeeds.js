import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import {
  loadLocalNeeds,
  createLocalNeed
} from '../store/slices/localNeedsSlice';
import {
  selectAllLocalNeeds,
  selectLocalNeedsLoading,
  selectLocalNeedsError,
  selectLocalNeedsCount
} from '../store/selectors/localNeedsSelectors';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast } from '../utils/sweetalert';

export const useReduxLocalNeeds = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const needs = useSelector(selectAllLocalNeeds);
  const loading = useSelector(selectLocalNeedsLoading);
  const error = useSelector(selectLocalNeedsError);
  const needsCount = useSelector(selectLocalNeedsCount);

  const loadNeeds = () => {
    dispatch(loadLocalNeeds());
  };

  const createNeed = async (needData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const result = await dispatch(createLocalNeed({ needData, user })).unwrap();
      showSuccessToast('Necesidad local creada exitosamente');
      return { success: true, need: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Funciones simuladas para compatibilidad (usando localStorage directamente)
  const respondToNeed = async (needId, message) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const storedNeeds = JSON.parse(localStorage.getItem('localNeeds') || '[]');
      const updatedNeeds = storedNeeds.map(need => {
        if (need.id === needId) {
          const responses = need.responses || [];
          responses.push({
            id: Date.now(),
            userId: user.id,
            message,
            createdAt: new Date().toISOString()
          });
          return { ...need, responses };
        }
        return need;
      });
      localStorage.setItem('localNeeds', JSON.stringify(updatedNeeds));
      dispatch(loadLocalNeeds());
      showSuccessToast('Respuesta enviada exitosamente');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const resolveNeed = async (needId, rating = null, comment = null) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const storedNeeds = JSON.parse(localStorage.getItem('localNeeds') || '[]');
      const updatedNeeds = storedNeeds.map(need => {
        if (need.id === needId) {
          return {
            ...need,
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
            resolution: {
              resolverId: user.id,
              rating,
              comment
            }
          };
        }
        return need;
      });
      localStorage.setItem('localNeeds', JSON.stringify(updatedNeeds));
      dispatch(loadLocalNeeds());
      showSuccessToast('Necesidad resuelta exitosamente');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const cancelNeed = async (needId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const storedNeeds = JSON.parse(localStorage.getItem('localNeeds') || '[]');
      const updatedNeeds = storedNeeds.map(need => {
        if (need.id === needId) {
          return { ...need, status: 'cancelled' };
        }
        return need;
      });
      localStorage.setItem('localNeeds', JSON.stringify(updatedNeeds));
      dispatch(loadLocalNeeds());
      showSuccessToast('Necesidad cancelada');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Helper functions - usando useMemo para optimización
  const getActiveNeeds = useMemo(() => {
    return (neighborhoodId) => {
      return needs.filter(
        n => n.neighborhoodId === neighborhoodId && n.status === 'active'
      );
    };
  }, [needs]);

  const getNeighborhoodNeeds = useMemo(() => {
    return (neighborhoodId) => {
      return needs.filter(n => n.neighborhoodId === neighborhoodId);
    };
  }, [needs]);

  const getUserNeeds = useMemo(() => {
    return (userId) => {
      return needs.filter(n => n.userId === userId);
    };
  }, [needs]);

  return {
    needs,
    loading,
    error,
    needsCount,
    loadNeeds,
    createNeed,
    respondToNeed,
    resolveNeed,
    cancelNeed,
    // Helper functions
    getActiveNeeds,
    getNeighborhoodNeeds,
    getUserNeeds
  };
};