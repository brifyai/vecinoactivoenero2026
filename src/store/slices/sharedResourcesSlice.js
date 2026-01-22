import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createNotification } from './notificationsSlice';
import { showSuccessToast } from '../../utils/sweetalert';

const generateSlug = (name, existingSlugs) => {
  let baseSlug = name.toLowerCase().replace(/[^a-z0-9áéíóúñü\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  let slug = baseSlug;
  let counter = 1;
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

export const loadResources = createAsyncThunk('sharedResources/loadResources', async () => {
  const stored = localStorage.getItem('sharedResources');
  return stored ? JSON.parse(stored) : [];
});

export const loadReservations = createAsyncThunk('sharedResources/loadReservations', async () => {
  const stored = localStorage.getItem('resourceReservations');
  return stored ? JSON.parse(stored) : [];
});

export const addResource = createAsyncThunk('sharedResources/addResource', async ({ resourceData, user }, { getState }) => {
  if (!user) throw new Error('Usuario no autenticado');
  const { resources } = getState().sharedResources;
  const slug = generateSlug(resourceData.name, resources.map(r => r.slug));
  
  const newResource = {
    id: Date.now(), slug, name: resourceData.name, description: resourceData.description,
    category: resourceData.category, subcategory: resourceData.subcategory,
    ownerId: user.id, ownerName: user.name, ownerAvatar: user.avatar, ownerPhone: user.phone || '',
    neighborhoodId: user.neighborhoodId, neighborhoodName: user.neighborhoodName, neighborhoodCode: user.neighborhoodCode,
    condition: resourceData.condition || 'bueno', images: resourceData.images || [],
    requiresDeposit: resourceData.requiresDeposit || false, depositAmount: resourceData.depositAmount || 0,
    maxLoanDays: resourceData.maxLoanDays || 7, rules: resourceData.rules || '',
    isAvailable: true, totalLoans: 0, rating: 0, reviews: [],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  
  const updated = [...resources, newResource];
  localStorage.setItem('sharedResources', JSON.stringify(updated));
  showSuccessToast('¡Recurso agregado exitosamente!');
  return newResource;
});

export const reserveResource = createAsyncThunk('sharedResources/reserveResource', 
  async ({ resourceId, reservationData, user }, { getState, dispatch }) => {
    if (!user) throw new Error('Usuario no autenticado');
    const { resources, reservations } = getState().sharedResources;
    const resource = resources.find(r => r.id === resourceId);
    if (!resource || !resource.isAvailable) throw new Error('Recurso no disponible');
    
    const hasConflict = reservations.some(res => 
      res.resourceId === resourceId && res.status === 'activa' &&
      ((reservationData.startDate >= res.startDate && reservationData.startDate <= res.endDate) ||
       (reservationData.endDate >= res.startDate && reservationData.endDate <= res.endDate))
    );
    if (hasConflict) throw new Error('Ya hay una reserva en esas fechas');
    
    const newReservation = {
      id: Date.now(), resourceId, resourceName: resource.name,
      ownerId: resource.ownerId, ownerName: resource.ownerName,
      borrowerId: user.id, borrowerName: user.name, borrowerAvatar: user.avatar, borrowerPhone: user.phone || '',
      startDate: reservationData.startDate, endDate: reservationData.endDate, purpose: reservationData.purpose || '',
      status: 'pendiente', depositPaid: false, returnedInGoodCondition: null, borrowerRating: null,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    
    const updated = [...reservations, newReservation];
    localStorage.setItem('resourceReservations', JSON.stringify(updated));
    
    dispatch(createNotification({
      userId: resource.ownerId, type: 'resource_request', from: user.id, fromName: user.name, fromAvatar: user.avatar,
      resourceId, reservationId: newReservation.id, message: `${user.name} solicitó prestado "${resource.name}"`, read: false
    }));
    
    showSuccessToast('¡Solicitud de préstamo enviada!');
    return newReservation;
  }
);

export const approveReservation = createAsyncThunk('sharedResources/approveReservation',
  async ({ reservationId, user }, { getState, dispatch }) => {
    if (!user) throw new Error('Usuario no autenticado');
    const { reservations } = getState().sharedResources;
    const res = reservations.find(r => r.id === reservationId);
    if (!res || res.ownerId !== user.id) throw new Error('No autorizado');
    
    dispatch(createNotification({
      userId: res.borrowerId, type: 'resource_approved', from: user.id, fromName: user.name, fromAvatar: user.avatar,
      resourceId: res.resourceId, message: `${user.name} aprobó tu solicitud de préstamo`, read: false
    }));
    
    const updated = reservations.map(r => r.id === reservationId ? { ...r, status: 'activa', updatedAt: new Date().toISOString() } : r);
    localStorage.setItem('resourceReservations', JSON.stringify(updated));
    showSuccessToast('Reserva aprobada');
    return reservationId;
  }
);

export const completeReservation = createAsyncThunk('sharedResources/completeReservation',
  async ({ reservationId, returnData, user }, { getState }) => {
    if (!user) throw new Error('Usuario no autenticado');
    const { reservations, resources } = getState().sharedResources;
    const res = reservations.find(r => r.id === reservationId);
    if (!res || res.ownerId !== user.id) throw new Error('No autorizado');
    
    const updatedReservations = reservations.map(r => 
      r.id === reservationId ? { ...r, status: 'completada', returnedInGoodCondition: returnData.inGoodCondition, 
        borrowerRating: returnData.rating, updatedAt: new Date().toISOString() } : r
    );
    localStorage.setItem('resourceReservations', JSON.stringify(updatedReservations));
    
    const updatedResources = resources.map(resource => 
      resource.id === res.resourceId ? { ...resource, totalLoans: resource.totalLoans + 1, isAvailable: true } : resource
    );
    localStorage.setItem('sharedResources', JSON.stringify(updatedResources));
    
    showSuccessToast('Préstamo completado');
    return { reservationId, resourceId: res.resourceId };
  }
);

export const cancelReservation = createAsyncThunk('sharedResources/cancelReservation',
  async ({ reservationId, user }, { getState }) => {
    if (!user) throw new Error('Usuario no autenticado');
    const { reservations } = getState().sharedResources;
    const res = reservations.find(r => r.id === reservationId);
    if (!res || (res.borrowerId !== user.id && res.ownerId !== user.id)) throw new Error('No autorizado');
    
    const updated = reservations.map(r => r.id === reservationId ? { ...r, status: 'cancelada', updatedAt: new Date().toISOString() } : r);
    localStorage.setItem('resourceReservations', JSON.stringify(updated));
    showSuccessToast('Reserva cancelada');
    return reservationId;
  }
);

const sharedResourcesSlice = createSlice({
  name: 'sharedResources',
  initialState: { resources: [], reservations: [], loading: false, error: null },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(loadResources.fulfilled, (state, action) => { state.resources = action.payload; state.loading = false; })
      .addCase(loadReservations.fulfilled, (state, action) => { state.reservations = action.payload; })
      .addCase(addResource.fulfilled, (state, action) => { state.resources.push(action.payload); })
      .addCase(reserveResource.fulfilled, (state, action) => { state.reservations.push(action.payload); })
      .addCase(approveReservation.fulfilled, (state, action) => {
        const res = state.reservations.find(r => r.id === action.payload);
        if (res) { res.status = 'activa'; res.updatedAt = new Date().toISOString(); }
      })
      .addCase(completeReservation.fulfilled, (state, action) => {
        const res = state.reservations.find(r => r.id === action.payload.reservationId);
        if (res) { res.status = 'completada'; res.updatedAt = new Date().toISOString(); }
        const resource = state.resources.find(r => r.id === action.payload.resourceId);
        if (resource) { resource.totalLoans += 1; resource.isAvailable = true; }
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        const res = state.reservations.find(r => r.id === action.payload);
        if (res) { res.status = 'cancelada'; res.updatedAt = new Date().toISOString(); }
      });
  }
});

export const { clearError } = sharedResourcesSlice.actions;
export default sharedResourcesSlice.reducer;
