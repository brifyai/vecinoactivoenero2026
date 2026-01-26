import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import {
  loadCommunityActions,
  createCommunityAction
} from '../store/slices/communityActionsSlice';
import {
  selectAllCommunityActions,
  selectCommunityActionsLoading,
  selectCommunityActionsError,
  selectCommunityActionsCount
} from '../store/selectors/communityActionsSelectors';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast } from '../utils/sweetalert';

export const useReduxCommunityActions = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const actions = useSelector(selectAllCommunityActions);
  const loading = useSelector(selectCommunityActionsLoading);
  const error = useSelector(selectCommunityActionsError);
  const actionsCount = useSelector(selectCommunityActionsCount);

  const loadActions = () => {
    dispatch(loadCommunityActions());
  };

  const createAction = async (actionData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const result = await dispatch(createCommunityAction({ actionData, user })).unwrap();
      showSuccessToast('Acción comunitaria creada exitosamente');
      return { success: true, action: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Funciones simuladas para compatibilidad (usando localStorage directamente)
  const joinAction = async (actionId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const storedActions = JSON.parse(localStorage.getItem('communityActions') || '[]');
      const updatedActions = storedActions.map(action => {
        if (action.id === actionId) {
          const participants = action.participants || [];
          if (!participants.some(p => p.userId === user.id)) {
            participants.push({ userId: user.id, joinedAt: new Date().toISOString() });
          }
          return { ...action, participants };
        }
        return action;
      });
      localStorage.setItem('communityActions', JSON.stringify(updatedActions));
      dispatch(loadCommunityActions());
      showSuccessToast('Te uniste a la acción comunitaria');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const leaveAction = async (actionId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const storedActions = JSON.parse(localStorage.getItem('communityActions') || '[]');
      const updatedActions = storedActions.map(action => {
        if (action.id === actionId) {
          const participants = (action.participants || []).filter(p => p.userId !== user.id);
          return { ...action, participants };
        }
        return action;
      });
      localStorage.setItem('communityActions', JSON.stringify(updatedActions));
      dispatch(loadCommunityActions());
      showSuccessToast('Saliste de la acción comunitaria');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const completeAction = async (actionId, photos = [], feedback = []) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const storedActions = JSON.parse(localStorage.getItem('communityActions') || '[]');
      const updatedActions = storedActions.map(action => {
        if (action.id === actionId) {
          return { 
            ...action, 
            status: 'completed',
            photos,
            feedback,
            completedAt: new Date().toISOString()
          };
        }
        return action;
      });
      localStorage.setItem('communityActions', JSON.stringify(updatedActions));
      dispatch(loadCommunityActions());
      showSuccessToast('Acción comunitaria completada');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // Helper functions - usando useMemo para optimización
  const getNeighborhoodActions = useMemo(() => {
    return (neighborhoodId) => {
      return actions.filter(
        a => a.neighborhoodId === neighborhoodId && a.status !== 'cancelled'
      );
    };
  }, [actions]);

  const getUpcomingActions = useMemo(() => {
    return (neighborhoodId) => {
      const now = new Date();
      return actions.filter(
        a => a.neighborhoodId === neighborhoodId &&
             a.status === 'planned' &&
             new Date(a.startDate) > now
      ).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    };
  }, [actions]);

  const getUserActions = useMemo(() => {
    return (userId) => {
      return actions.filter(a => a.organizerId === userId);
    };
  }, [actions]);

  const getUserParticipations = useMemo(() => {
    return (userId) => {
      return actions.filter(a =>
        a.participants && a.participants.some(p => p.userId === userId)
      );
    };
  }, [actions]);

  return {
    actions,
    loading,
    error,
    actionsCount,
    loadActions,
    createAction,
    joinAction,
    leaveAction,
    completeAction,
    // Helper functions
    getNeighborhoodActions,
    getUpcomingActions,
    getUserActions,
    getUserParticipations
  };
};