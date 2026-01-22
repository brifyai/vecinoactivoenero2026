import { createContext, useContext, useState, useEffect } from 'react';
import storageService from '../services/storageService';

const CommunityActionsContext = createContext();

export const useCommunityActions = () => {
  const context = useContext(CommunityActionsContext);
  if (!context) {
    throw new Error('useCommunityActions must be used within a CommunityActionsProvider');
  }
  return context;
};

export const CommunityActionsProvider = ({ children }) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedActions = storageService.getCommunityActions();
    setActions(savedActions);
    setLoading(false);
  }, []);

  const createAction = (actionData) => {
    // Validar campos requeridos
    if (!actionData.title || !actionData.description || !actionData.startDate || !actionData.location) {
      return { success: false, error: 'Faltan campos requeridos' };
    }

    const newAction = {
      id: `action-${Date.now()}`,
      organizerId: actionData.organizerId,
      neighborhoodId: actionData.neighborhoodId,
      title: actionData.title,
      description: actionData.description,
      startDate: actionData.startDate,
      endDate: actionData.endDate,
      location: {
        latitude: actionData.location.latitude,
        longitude: actionData.location.longitude,
        name: actionData.location.name
      },
      requiredSkills: actionData.requiredSkills || [],
      participantLimit: actionData.participantLimit || null,
      participants: [],
      waitlist: [],
      photos: [],
      feedback: [],
      status: 'planned', // 'planned', 'in_progress', 'completed', 'cancelled'
      createdAt: new Date().toISOString()
    };

    const updated = [newAction, ...actions];
    storageService.saveCommunityActions(updated);
    setActions(updated);

    // Notificar a vecinos interesados
    notifyInterestedNeighbors(newAction);

    return { success: true, action: newAction };
  };

  const joinAction = (actionId, userId) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) {
      return { success: false, error: 'Acción no encontrada' };
    }

    // Verificar si ya está participando
    if (action.participants.some(p => p.userId === userId)) {
      return { success: false, error: 'Ya estás participando en esta acción' };
    }

    const updated = actions.map(a => {
      if (a.id === actionId) {
        const participant = {
          userId,
          joinedAt: new Date().toISOString(),
          status: 'confirmed'
        };

        // Si hay límite y está lleno, agregar a lista de espera
        if (a.participantLimit && a.participants.length >= a.participantLimit) {
          return { ...a, waitlist: [...a.waitlist, participant] };
        }

        return { ...a, participants: [...a.participants, participant] };
      }
      return a;
    });

    storageService.saveCommunityActions(updated);
    setActions(updated);

    // Notificar al organizador
    storageService.addNotification(action.organizerId, {
      id: `notif-${Date.now()}`,
      type: 'action_participant_joined',
      fromUserId: userId,
      actionId,
      message: 'Alguien se unió a tu acción comunitaria',
      read: false,
      createdAt: new Date().toISOString()
    });

    return { success: true, action: updated.find(a => a.id === actionId) };
  };

  const leaveAction = (actionId, userId) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) {
      return { success: false, error: 'Acción no encontrada' };
    }

    const updated = actions.map(a => {
      if (a.id === actionId) {
        const newParticipants = a.participants.filter(p => p.userId !== userId);
        let newWaitlist = a.waitlist.filter(p => p.userId !== userId);

        // Si hay gente en lista de espera, promover al primero
        if (newWaitlist.length > 0 && a.participantLimit && newParticipants.length < a.participantLimit) {
          const promoted = newWaitlist[0];
          newParticipants.push({ ...promoted, status: 'confirmed' });
          newWaitlist = newWaitlist.slice(1);
        }

        return { ...a, participants: newParticipants, waitlist: newWaitlist };
      }
      return a;
    });

    storageService.saveCommunityActions(updated);
    setActions(updated);

    return { success: true };
  };

  const completeAction = (actionId, photos = [], feedback = []) => {
    const updated = actions.map(a =>
      a.id === actionId
        ? {
            ...a,
            status: 'completed',
            photos,
            feedback,
            completedAt: new Date().toISOString()
          }
        : a
    );

    storageService.saveCommunityActions(updated);
    setActions(updated);

    // Actualizar reputación de participantes
    const action = updated.find(a => a.id === actionId);
    if (action) {
      action.participants.forEach(p => {
        storageService.updateUser(p.userId, {
          communityActionsParticipated: (storageService.getUser(p.userId)?.communityActionsParticipated || 0) + 1
        });
      });
    }

    return { success: true, action };
  };

  const getNeighborhoodActions = (neighborhoodId) => {
    return actions.filter(
      a => a.neighborhoodId === neighborhoodId && a.status !== 'cancelled'
    );
  };

  const getUpcomingActions = (neighborhoodId) => {
    const now = new Date();
    return actions.filter(
      a => a.neighborhoodId === neighborhoodId &&
           a.status === 'planned' &&
           new Date(a.startDate) > now
    ).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  };

  const getUserActions = (userId) => {
    return actions.filter(a => a.organizerId === userId);
  };

  const getUserParticipations = (userId) => {
    return actions.filter(a =>
      a.participants.some(p => p.userId === userId)
    );
  };

  const notifyInterestedNeighbors = (action) => {
    // Aquí se notificaría a vecinos interesados
    // Por ahora es un placeholder
  };

  const value = {
    actions,
    loading,
    createAction,
    joinAction,
    leaveAction,
    completeAction,
    getNeighborhoodActions,
    getUpcomingActions,
    getUserActions,
    getUserParticipations
  };

  return (
    <CommunityActionsContext.Provider value={value}>
      {children}
    </CommunityActionsContext.Provider>
  );
};
