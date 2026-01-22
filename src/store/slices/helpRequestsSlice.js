import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createNotification } from './notificationsSlice';
import { showSuccessToast } from '../../utils/sweetalert';

// Helper: Generar slug único
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

// Async Thunks
export const loadHelpRequests = createAsyncThunk(
  'helpRequests/loadHelpRequests',
  async (_, { rejectWithValue }) => {
    try {
      const stored = localStorage.getItem('helpRequests');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createHelpRequest = createAsyncThunk(
  'helpRequests/createHelpRequest',
  async ({ requestData, user }, { getState, rejectWithValue }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { helpRequests } = getState().helpRequests;
      const existingSlugs = helpRequests.map(r => r.slug);
      const slug = generateSlug(requestData.title, existingSlugs);

      const newRequest = {
        id: Date.now(),
        slug,
        type: requestData.type,
        title: requestData.title,
        description: requestData.description,
        urgency: requestData.urgency || 'normal',
        status: 'abierta',
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
      localStorage.setItem('helpRequests', JSON.stringify(updated));
      showSuccessToast('¡Solicitud de ayuda publicada!');

      return newRequest;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const offerHelp = createAsyncThunk(
  'helpRequests/offerHelp',
  async ({ requestId, offerData, user }, { getState, dispatch, rejectWithValue }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { helpRequests } = getState().helpRequests;
      const request = helpRequests.find(r => r.id === requestId);
      if (!request) throw new Error('Solicitud no encontrada');

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
      dispatch(createNotification({
        userId: request.requesterId,
        type: 'help_offer',
        from: user.id,
        fromName: user.name,
        fromAvatar: user.avatar,
        requestId,
        message: `${user.name} ofreció ayuda para "${request.title}"`,
        read: false
      }));

      const updated = helpRequests.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            offers: [...r.offers, newOffer],
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      });

      localStorage.setItem('helpRequests', JSON.stringify(updated));
      showSuccessToast('¡Oferta de ayuda enviada!');

      return { requestId, offer: newOffer };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptOffer = createAsyncThunk(
  'helpRequests/acceptOffer',
  async ({ requestId, offerId, user }, { getState, dispatch, rejectWithValue }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { helpRequests } = getState().helpRequests;
      const request = helpRequests.find(r => r.id === requestId);
      
      if (!request) throw new Error('Solicitud no encontrada');
      if (request.requesterId !== user.id) throw new Error('No autorizado');

      const offer = request.offers.find(o => o.id === offerId);
      if (offer) {
        dispatch(createNotification({
          userId: offer.helperId,
          type: 'help_accepted',
          from: user.id,
          fromName: user.name,
          fromAvatar: user.avatar,
          requestId,
          message: `${user.name} aceptó tu oferta de ayuda`,
          read: false
        }));
      }

      const updated = helpRequests.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'en_proceso',
            acceptedOfferId: offerId,
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      });

      localStorage.setItem('helpRequests', JSON.stringify(updated));
      showSuccessToast('¡Oferta aceptada!');

      return { requestId, offerId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resolveRequest = createAsyncThunk(
  'helpRequests/resolveRequest',
  async ({ requestId, user }, { getState, rejectWithValue }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { helpRequests } = getState().helpRequests;
      const request = helpRequests.find(r => r.id === requestId);
      
      if (!request) throw new Error('Solicitud no encontrada');
      if (request.requesterId !== user.id) throw new Error('No autorizado');

      const updated = helpRequests.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'resuelta',
            resolvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      });

      localStorage.setItem('helpRequests', JSON.stringify(updated));
      showSuccessToast('¡Solicitud marcada como resuelta!');

      return requestId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelRequest = createAsyncThunk(
  'helpRequests/cancelRequest',
  async ({ requestId, user }, { getState, rejectWithValue }) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const { helpRequests } = getState().helpRequests;
      const request = helpRequests.find(r => r.id === requestId);
      
      if (!request) throw new Error('Solicitud no encontrada');
      if (request.requesterId !== user.id) throw new Error('No autorizado');

      const updated = helpRequests.map(r => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'cancelada',
            updatedAt: new Date().toISOString()
          };
        }
        return r;
      });

      localStorage.setItem('helpRequests', JSON.stringify(updated));
      showSuccessToast('Solicitud cancelada');

      return requestId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const helpRequestsSlice = createSlice({
  name: 'helpRequests',
  initialState: {
    helpRequests: [],
    loading: false,
    error: null
  },
  reducers: {
    clearHelpRequestsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadHelpRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadHelpRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.helpRequests = action.payload;
      })
      .addCase(loadHelpRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createHelpRequest.fulfilled, (state, action) => {
        state.helpRequests.push(action.payload);
      })
      .addCase(offerHelp.fulfilled, (state, action) => {
        const { requestId, offer } = action.payload;
        const request = state.helpRequests.find(r => r.id === requestId);
        if (request) {
          request.offers.push(offer);
          request.updatedAt = new Date().toISOString();
        }
      })
      .addCase(acceptOffer.fulfilled, (state, action) => {
        const { requestId, offerId } = action.payload;
        const request = state.helpRequests.find(r => r.id === requestId);
        if (request) {
          request.status = 'en_proceso';
          request.acceptedOfferId = offerId;
          request.updatedAt = new Date().toISOString();
        }
      })
      .addCase(resolveRequest.fulfilled, (state, action) => {
        const request = state.helpRequests.find(r => r.id === action.payload);
        if (request) {
          request.status = 'resuelta';
          request.resolvedAt = new Date().toISOString();
          request.updatedAt = new Date().toISOString();
        }
      })
      .addCase(cancelRequest.fulfilled, (state, action) => {
        const request = state.helpRequests.find(r => r.id === action.payload);
        if (request) {
          request.status = 'cancelada';
          request.updatedAt = new Date().toISOString();
        }
      });
  }
});

export const { clearHelpRequestsError } = helpRequestsSlice.actions;
export default helpRequestsSlice.reducer;
