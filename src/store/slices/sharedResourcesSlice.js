import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseResourcesService from '../../services/supabaseResourcesService';

export const loadResources = createAsyncThunk(
  'sharedResources/loadResources',
  async ({ neighborhoodId, category }, { rejectWithValue }) => {
    try {
      const resources = await supabaseResourcesService.getResources(neighborhoodId, category);
      return resources;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadReservations = createAsyncThunk(
  'sharedResources/loadReservations',
  async ({ userId, resourceId }, { rejectWithValue }) => {
    try {
      const reservations = await supabaseResourcesService.getReservations(userId, resourceId);
      return reservations;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addResource = createAsyncThunk(
  'sharedResources/addResource',
  async (resourceData, { rejectWithValue }) => {
    try {
      const newResource = await supabaseResourcesService.addResource(resourceData);
      return newResource;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const reserveResource = createAsyncThunk(
  'sharedResources/reserveResource',
  async (reservationData, { rejectWithValue }) => {
    try {
      const reservation = await supabaseResourcesService.reserveResource(reservationData);
      return reservation;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveReservation = createAsyncThunk(
  'sharedResources/approveReservation',
  async ({ reservationId, userId }, { rejectWithValue }) => {
    try {
      const reservation = await supabaseResourcesService.approveReservation(reservationId, userId);
      return reservation;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completeReservation = createAsyncThunk(
  'sharedResources/completeReservation',
  async ({ reservationId, returnData, userId }, { rejectWithValue }) => {
    try {
      const reservation = await supabaseResourcesService.completeReservation(reservationId, returnData, userId);
      return reservation;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelReservation = createAsyncThunk(
  'sharedResources/cancelReservation',
  async ({ reservationId, userId }, { rejectWithValue }) => {
    try {
      const reservation = await supabaseResourcesService.cancelReservation(reservationId, userId);
      return reservation;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateResource = createAsyncThunk(
  'sharedResources/updateResource',
  async ({ resourceId, updates, userId }, { rejectWithValue }) => {
    try {
      const updatedResource = await supabaseResourcesService.updateResource(resourceId, updates, userId);
      return updatedResource;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteResource = createAsyncThunk(
  'sharedResources/deleteResource',
  async ({ resourceId, userId }, { rejectWithValue }) => {
    try {
      await supabaseResourcesService.deleteResource(resourceId, userId);
      return resourceId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const sharedResourcesSlice = createSlice({
  name: 'sharedResources',
  initialState: { 
    resources: [], 
    reservations: [], 
    loading: false, 
    error: null 
  },
  reducers: { 
    clearError: (state) => { 
      state.error = null; 
    } 
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadResources.fulfilled, (state, action) => { 
        state.resources = action.payload; 
        state.loading = false; 
      })
      .addCase(loadResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadReservations.fulfilled, (state, action) => { 
        state.reservations = action.payload; 
      })
      .addCase(addResource.pending, (state) => {
        state.loading = true;
      })
      .addCase(addResource.fulfilled, (state, action) => { 
        state.resources.push(action.payload); 
        state.loading = false;
      })
      .addCase(addResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(reserveResource.fulfilled, (state, action) => { 
        state.reservations.push(action.payload); 
      })
      .addCase(approveReservation.fulfilled, (state, action) => {
        const resIndex = state.reservations.findIndex(r => r.id === action.payload.id);
        if (resIndex !== -1) {
          state.reservations[resIndex] = action.payload;
        }
      })
      .addCase(completeReservation.fulfilled, (state, action) => {
        const resIndex = state.reservations.findIndex(r => r.id === action.payload.id);
        if (resIndex !== -1) {
          state.reservations[resIndex] = action.payload;
        }
      })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        const resIndex = state.reservations.findIndex(r => r.id === action.payload.id);
        if (resIndex !== -1) {
          state.reservations[resIndex] = action.payload;
        }
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        const resourceIndex = state.resources.findIndex(r => r.id === action.payload.id);
        if (resourceIndex !== -1) {
          state.resources[resourceIndex] = action.payload;
        }
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.resources = state.resources.filter(r => r.id !== action.payload);
      });
  }
});

export const { clearError } = sharedResourcesSlice.actions;
export default sharedResourcesSlice.reducer;
