import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationsContext';
import { showSuccessToast } from '../utils/sweetalert';

const SharedResourcesContext = createContext();

export const useSharedResources = () => {
  const context = useContext(SharedResourcesContext);
  if (!context) {
    throw new Error('useSharedResources must be used within SharedResourcesProvider');
  }
  return context;
};

export const SharedResourcesProvider = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [resources, setResources] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
    loadReservations();
  }, []);

  const loadResources = () => {
    const stored = localStorage.getItem('sharedResources');
    if (stored) {
      setResources(JSON.parse(stored));
    }
    setLoading(false);
  };

  const loadReservations = () => {
    const stored = localStorage.getItem('resourceReservations');
    if (stored) {
      setReservations(JSON.parse(stored));
    }
  };

  const saveResources = (updated) => {
    localStorage.setItem('sharedResources', JSON.stringify(updated));
    setResources(updated);
  };

  const saveReservations = (updated) => {
    localStorage.setItem('resourceReservations', JSON.stringify(updated));
    setReservations(updated);
  };

  // Generar slug único
  const generateSlug = (name, existingSlugs) => {
    let baseSlug = name
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

  // Agregar recurso
  const addResource = (resourceData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const existingSlugs = resources.map(r => r.slug);
    const slug = generateSlug(resourceData.name, existingSlugs);

    const newResource = {
      id: Date.now(),
      slug: slug,
      name: resourceData.name,
      description: resourceData.description,
      category: resourceData.category, // herramienta, equipo, libro, juego, espacio
      subcategory: resourceData.subcategory,
      ownerId: user.id,
      ownerName: user.name,
      ownerAvatar: user.avatar,
      ownerPhone: user.phone || '',
      neighborhoodId: user.neighborhoodId,
      neighborhoodName: user.neighborhoodName,
      neighborhoodCode: user.neighborhoodCode,
      condition: resourceData.condition || 'bueno', // nuevo, bueno, regular, usado
      images: resourceData.images || [],
      requiresDeposit: resourceData.requiresDeposit || false,
      depositAmount: resourceData.depositAmount || 0,
      maxLoanDays: resourceData.maxLoanDays || 7,
      rules: resourceData.rules || '',
      isAvailable: true,
      totalLoans: 0,
      rating: 0,
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [...resources, newResource];
    saveResources(updated);
    showSuccessToast('¡Recurso agregado exitosamente!');
    
    return { success: true, resource: newResource };
  };

  // Reservar recurso
  const reserveResource = (resourceId, reservationData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const resource = resources.find(r => r.id === resourceId);
    if (!resource || !resource.isAvailable) {
      return { success: false, error: 'Recurso no disponible' };
    }

    // Verificar conflictos de fechas
    const hasConflict = reservations.some(res => 
      res.resourceId === resourceId &&
      res.status === 'activa' &&
      (
        (reservationData.startDate >= res.startDate && reservationData.startDate <= res.endDate) ||
        (reservationData.endDate >= res.startDate && reservationData.endDate <= res.endDate)
      )
    );

    if (hasConflict) {
      return { success: false, error: 'Ya hay una reserva en esas fechas' };
    }

    const newReservation = {
      id: Date.now(),
      resourceId: resourceId,
      resourceName: resource.name,
      ownerId: resource.ownerId,
      ownerName: resource.ownerName,
      borrowerId: user.id,
      borrowerName: user.name,
      borrowerAvatar: user.avatar,
      borrowerPhone: user.phone || '',
      startDate: reservationData.startDate,
      endDate: reservationData.endDate,
      purpose: reservationData.purpose || '',
      status: 'pendiente', // pendiente, activa, completada, cancelada
      depositPaid: false,
      returnedInGoodCondition: null,
      borrowerRating: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedReservations = [...reservations, newReservation];
    saveReservations(updatedReservations);

    // Notificar al dueño
    addNotification(resource.ownerId, {
      type: 'resource_request',
      from: user.id,
      fromName: user.name,
      fromAvatar: user.avatar,
      resourceId: resourceId,
      reservationId: newReservation.id,
      message: `${user.name} solicitó prestado "${resource.name}"`,
      read: false
    });

    showSuccessToast('¡Solicitud de préstamo enviada!');
    return { success: true, reservation: newReservation };
  };

  // Aprobar reserva
  const approveReservation = (reservationId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = reservations.map(res => {
      if (res.id === reservationId && res.ownerId === user.id) {
        // Notificar al solicitante
        addNotification(res.borrowerId, {
          type: 'resource_approved',
          from: user.id,
          fromName: user.name,
          fromAvatar: user.avatar,
          resourceId: res.resourceId,
          message: `${user.name} aprobó tu solicitud de préstamo`,
          read: false
        });

        return {
          ...res,
          status: 'activa',
          updatedAt: new Date().toISOString()
        };
      }
      return res;
    });

    saveReservations(updated);
    showSuccessToast('Reserva aprobada');
    return { success: true };
  };

  // Completar préstamo
  const completeReservation = (reservationId, returnData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = reservations.map(res => {
      if (res.id === reservationId && res.ownerId === user.id) {
        return {
          ...res,
          status: 'completada',
          returnedInGoodCondition: returnData.inGoodCondition,
          borrowerRating: returnData.rating,
          updatedAt: new Date().toISOString()
        };
      }
      return res;
    });

    saveReservations(updated);

    // Actualizar estadísticas del recurso
    const updatedResources = resources.map(resource => {
      const reservation = reservations.find(r => r.id === reservationId);
      if (resource.id === reservation?.resourceId) {
        return {
          ...resource,
          totalLoans: resource.totalLoans + 1,
          isAvailable: true
        };
      }
      return resource;
    });
    saveResources(updatedResources);

    showSuccessToast('Préstamo completado');
    return { success: true };
  };

  // Cancelar reserva
  const cancelReservation = (reservationId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const updated = reservations.map(res => {
      if (res.id === reservationId && (res.borrowerId === user.id || res.ownerId === user.id)) {
        return {
          ...res,
          status: 'cancelada',
          updatedAt: new Date().toISOString()
        };
      }
      return res;
    });

    saveReservations(updated);
    showSuccessToast('Reserva cancelada');
    return { success: true };
  };

  // Filtros
  const getResourcesByNeighborhood = (neighborhoodId) => {
    return resources.filter(r => r.neighborhoodId === neighborhoodId && r.isAvailable);
  };

  const getResourcesByCategory = (category) => {
    return resources.filter(r => r.category === category && r.isAvailable);
  };

  const getMyResources = () => {
    if (!user) return [];
    return resources.filter(r => r.ownerId === user.id);
  };

  const getMyReservations = () => {
    if (!user) return [];
    return reservations.filter(r => r.borrowerId === user.id);
  };

  const getPendingRequests = () => {
    if (!user) return [];
    return reservations.filter(r => r.ownerId === user.id && r.status === 'pendiente');
  };

  const value = {
    resources,
    reservations,
    loading,
    addResource,
    reserveResource,
    approveReservation,
    completeReservation,
    cancelReservation,
    getResourcesByNeighborhood,
    getResourcesByCategory,
    getMyResources,
    getMyReservations,
    getPendingRequests,
    refreshResources: loadResources
  };

  return <SharedResourcesContext.Provider value={value}>{children}</SharedResourcesContext.Provider>;
};
