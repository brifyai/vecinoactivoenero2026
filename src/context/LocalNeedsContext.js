import { createContext, useContext, useState, useEffect } from 'react';
import storageService from '../services/storageService';

const LocalNeedsContext = createContext();

export const useLocalNeeds = () => {
  const context = useContext(LocalNeedsContext);
  if (!context) {
    throw new Error('useLocalNeeds must be used within a LocalNeedsProvider');
  }
  return context;
};

export const LocalNeedsProvider = ({ children }) => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedNeeds = storageService.getLocalNeeds();
    setNeeds(savedNeeds);
    setLoading(false);
  }, []);

  const createNeed = (needData) => {
    // Validar campos requeridos
    if (!needData.type || !needData.title || !needData.description || !needData.urgency) {
      return { success: false, error: 'Faltan campos requeridos' };
    }

    const newNeed = {
      id: `need-${Date.now()}`,
      userId: needData.userId,
      neighborhoodId: needData.neighborhoodId,
      type: needData.type, // 'help_request', 'resource_needed', 'skill_sought'
      title: needData.title,
      description: needData.description,
      urgency: needData.urgency, // 'low', 'medium', 'high', 'critical'
      location: {
        latitude: needData.latitude,
        longitude: needData.longitude,
        radiusMeters: needData.radiusMeters || 500
      },
      requiredSkills: needData.requiredSkills || [],
      responses: [],
      status: 'active', // 'active', 'in_progress', 'resolved', 'cancelled'
      resolution: null,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
      resolvedAt: null
    };

    const updated = [newNeed, ...needs];
    storageService.saveLocalNeeds(updated);
    setNeeds(updated);

    // Notificar a vecinos relevantes
    notifyRelevantNeighbors(newNeed);

    return { success: true, need: newNeed };
  };

  const respondToNeed = (needId, userId, message) => {
    const need = needs.find(n => n.id === needId);
    if (!need) {
      return { success: false, error: 'Necesidad no encontrada' };
    }

    const response = {
      id: `resp-${Date.now()}`,
      userId,
      message,
      createdAt: new Date().toISOString()
    };

    const updated = needs.map(n =>
      n.id === needId
        ? { ...n, responses: [...n.responses, response] }
        : n
    );

    storageService.saveLocalNeeds(updated);
    setNeeds(updated);

    // Notificar al creador de la necesidad
    storageService.addNotification(need.userId, {
      id: `notif-${Date.now()}`,
      type: 'need_response',
      fromUserId: userId,
      needId,
      message: 'Alguien respondió a tu solicitud',
      read: false,
      createdAt: new Date().toISOString()
    });

    return { success: true, response };
  };

  const resolveNeed = (needId, resolverId, rating = null, comment = null) => {
    const need = needs.find(n => n.id === needId);
    if (!need) {
      return { success: false, error: 'Necesidad no encontrada' };
    }

    const updated = needs.map(n =>
      n.id === needId
        ? {
            ...n,
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
            resolution: {
              resolverId,
              rating,
              comment
            }
          }
        : n
    );

    storageService.saveLocalNeeds(updated);
    setNeeds(updated);

    // Actualizar reputación del resolvedor
    if (rating) {
      storageService.updateUser(resolverId, {
        neighborHelpCount: (storageService.getCurrentUser()?.neighborHelpCount || 0) + 1
      });
    }

    return { success: true, need: updated.find(n => n.id === needId) };
  };

  const cancelNeed = (needId) => {
    const updated = needs.map(n =>
      n.id === needId
        ? { ...n, status: 'cancelled' }
        : n
    );

    storageService.saveLocalNeeds(updated);
    setNeeds(updated);

    return { success: true };
  };

  const getActiveNeeds = (neighborhoodId) => {
    return needs.filter(
      n => n.neighborhoodId === neighborhoodId && n.status === 'active'
    );
  };

  const getNeighborhoodNeeds = (neighborhoodId) => {
    return needs.filter(n => n.neighborhoodId === neighborhoodId);
  };

  const getUserNeeds = (userId) => {
    return needs.filter(n => n.userId === userId);
  };

  const notifyRelevantNeighbors = (need) => {
    // Aquí se notificaría a vecinos con habilidades relevantes
    // Por ahora es un placeholder
  };

  const value = {
    needs,
    loading,
    createNeed,
    respondToNeed,
    resolveNeed,
    cancelNeed,
    getActiveNeeds,
    getNeighborhoodNeeds,
    getUserNeeds
  };

  return (
    <LocalNeedsContext.Provider value={value}>
      {children}
    </LocalNeedsContext.Provider>
  );
};
