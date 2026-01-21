import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationsContext';
import { showSuccessToast } from '../utils/sweetalert';

const HelpRequestsContext = createContext();

export const useHelpRequests = () => {
  const context = useContext(HelpRequestsContext);
  if (!context) {
    throw new Error('useHelpRequests must be used within HelpRequestsProvider');
  }
  return context;
};

export const HelpRequestsProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHelpRequests();
  }, []);

  const loadHelpRequests = () => {
    const stored = localStorage.getItem('helpRequests');
    if (stored) {
      setHelpRequests(JSON.parse(stored));
    }
    setLoading(false);
  };

  const saveHelpRequests = (updated) => {
    localStorage.setItem('helpRequests', JSON.stringify(updated));
    setHelpRequests(updated);
  };

  // Generar slug único
  const generateSlug = (title, existingSlugs) => {
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñü\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    let slug = baseSlug;
    let counter = 1;
    while (existingSlugs.includes(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  };

  // Crear solicitud de ayuda
  const createHelpRequest = (requestData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const existingSlugs = helpRequests.map(r => r.slug);
    const slug = generateSlug(requestData.title, existingSlugs);

    const newRequest = {
      id: Date.now(),
      slug: slug,
      type: requestData.type, // emergencia, prestamo, cuidado, transporte, donacion, otro
      title: requestData.title,
      description: requestData.description,
      urgency: requestData.urgency || 'normal', // baja, normal, alta, emergencia
      status: 'abierta', // abierta, en_proceso, resuelta, cancelada
      requesterId: user.id,
      requesterName: user.name,
      requesterAvatar: user.avatar,
      requesterPhone: user.phone || '',
      neighborhoodId: user.neighborhoodId,
      neighborhoodName: user.neighborhoodName,
      neighborhoodCode: user.neighborhoodCode,
      location: requestData.location || '',
      images: requestData.images || [],
      offers: [],
      acceptedOfferId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null
    };

    const updated = [...helpRequests, newRequest];
    saveHelpRequests(updated);
    showSuccessToast('¡Solicitud de ayuda publicada!');
    
    return { success: true, request: newRequest };
  };

  // Ofrecer ayuda
  const offerHelp = (requestId, offerData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = helpRequests.map(request => {
      if (request.id === requestId) {
        const newOffer = {
          id: Date.now(),
          helperId: user.id,
          helperName: user.name,
          helperAvatar: user.avatar,
          helperPhone: user.phone || '',
          message: offerData.message,
          availability: offerData.availability,
          createdAt: new Date().toISOString()
        };

        // Notificar al solicitante
        addNotification(request.requesterId, {
          type: 'help_offer',
          from: user.id,
          fromName: user.name,
          fromAvatar: user.avatar,
          requestId: requestId,
          message: `${user.name} ofreció ayuda para "${request.title}"`,
          read: false
        });

        return {
          ...request,
          offers: [...request.offers, newOffer],
          updatedAt: new Date().toISOString()
        };
      }
      return request;
    });

    saveHelpRequests(updated);
    showSuccessToast('¡Oferta de ayuda enviada!');
    return { success: true };
  };

  // Aceptar oferta de ayuda
  const acceptOffer = (requestId, offerId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = helpRequests.map(request => {
      if (request.id === requestId && request.requesterId === user.id) {
        const offer = request.offers.find(o => o.id === offerId);
        
        if (offer) {
          // Notificar al ayudante
          addNotification(offer.helperId, {
            type: 'help_accepted',
            from: user.id,
            fromName: user.name,
            fromAvatar: user.avatar,
            requestId: requestId,
            message: `${user.name} aceptó tu oferta de ayuda`,
            read: false
          });
        }

        return {
          ...request,
          status: 'en_proceso',
          acceptedOfferId: offerId,
          updatedAt: new Date().toISOString()
        };
      }
      return request;
    });

    saveHelpRequests(updated);
    showSuccessToast('¡Oferta aceptada!');
    return { success: true };
  };

  // Marcar como resuelta
  const resolveRequest = (requestId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = helpRequests.map(request => {
      if (request.id === requestId && request.requesterId === user.id) {
        return {
          ...request,
          status: 'resuelta',
          resolvedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return request;
    });

    saveHelpRequests(updated);
    showSuccessToast('¡Solicitud marcada como resuelta!');
    return { success: true };
  };

  // Cancelar solicitud
  const cancelRequest = (requestId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = helpRequests.map(request => {
      if (request.id === requestId && request.requesterId === user.id) {
        return {
          ...request,
          status: 'cancelada',
          updatedAt: new Date().toISOString()
        };
      }
      return request;
    });

    saveHelpRequests(updated);
    showSuccessToast('Solicitud cancelada');
    return { success: true };
  };

  // Filtros
  const getRequestsByNeighborhood = (neighborhoodId) => {
    return helpRequests.filter(r => r.neighborhoodId === neighborhoodId);
  };

  const getRequestsByType = (type) => {
    return helpRequests.filter(r => r.type === type);
  };

  const getRequestsByStatus = (status) => {
    return helpRequests.filter(r => r.status === status);
  };

  const getMyRequests = () => {
    if (!user) return [];
    return helpRequests.filter(r => r.requesterId === user.id);
  };

  const getMyOffers = () => {
    if (!user) return [];
    return helpRequests.filter(r => 
      r.offers.some(o => o.helperId === user.id)
    );
  };

  const value = {
    helpRequests,
    loading,
    createHelpRequest,
    offerHelp,
    acceptOffer,
    resolveRequest,
    cancelRequest,
    getRequestsByNeighborhood,
    getRequestsByType,
    getRequestsByStatus,
    getMyRequests,
    getMyOffers,
    refreshHelpRequests: loadHelpRequests
  };

  return <HelpRequestsContext.Provider value={value}>{children}</HelpRequestsContext.Provider>;
};
