import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { emergencyService } from '../../services/emergencyService';

// Async thunks
export const sendEmergencyAlert = createAsyncThunk(
  'emergency/sendAlert',
  async (emergencyData, { rejectWithValue }) => {
    try {
      const result = await emergencyService.sendEmergencyAlert(emergencyData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getEmergencyHistory = createAsyncThunk(
  'emergency/getHistory',
  async ({ neighborhoodId, limit = 50 }, { rejectWithValue }) => {
    try {
      const history = await emergencyService.getEmergencyHistory(neighborhoodId, limit);
      return history;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const resolveEmergency = createAsyncThunk(
  'emergency/resolve',
  async ({ emergencyId, resolutionNotes, resolvedBy }, { rejectWithValue }) => {
    try {
      const result = await emergencyService.resolveEmergency(emergencyId, resolutionNotes, resolvedBy);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Estado de envío de alertas
  isLoading: false,
  isSending: false,
  sendError: null,
  lastAlert: null,
  
  // Historial de emergencias
  emergencies: [],
  isLoadingHistory: false,
  historyError: null,
  
  // Estadísticas
  stats: {
    totalEmergencies: 0,
    activeEmergencies: 0,
    resolvedEmergencies: 0,
    averageResponseTime: 0
  },
  
  // Configuración
  settings: {
    enableVibration: true,
    enableSound: true,
    requireLocation: false,
    maxVideoLength: 30, // segundos
    maxFileSize: 10 * 1024 * 1024 // 10MB
  }
};

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    clearSendError: (state) => {
      state.sendError = null;
    },
    
    clearHistoryError: (state) => {
      state.historyError = null;
    },
    
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    addEmergencyToHistory: (state, action) => {
      const newEmergency = action.payload;
      const existingIndex = state.emergencies.findIndex(e => e.id === newEmergency.id);
      
      if (existingIndex >= 0) {
        state.emergencies[existingIndex] = newEmergency;
      } else {
        state.emergencies.unshift(newEmergency);
      }
      
      // Actualizar estadísticas
      state.stats.totalEmergencies = state.emergencies.length;
      state.stats.activeEmergencies = state.emergencies.filter(e => e.status === 'active').length;
      state.stats.resolvedEmergencies = state.emergencies.filter(e => e.status === 'resolved').length;
    },
    
    updateEmergencyStatus: (state, action) => {
      const { emergencyId, status, resolvedBy, resolvedAt, resolutionNotes } = action.payload;
      const emergency = state.emergencies.find(e => e.id === emergencyId);
      
      if (emergency) {
        emergency.status = status;
        if (status === 'resolved') {
          emergency.resolved_by = resolvedBy;
          emergency.resolved_at = resolvedAt;
          emergency.resolution_notes = resolutionNotes;
        }
      }
      
      // Actualizar estadísticas
      state.stats.activeEmergencies = state.emergencies.filter(e => e.status === 'active').length;
      state.stats.resolvedEmergencies = state.emergencies.filter(e => e.status === 'resolved').length;
    },
    
    resetEmergencyState: (state) => {
      state.isLoading = false;
      state.isSending = false;
      state.sendError = null;
      state.lastAlert = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Send Emergency Alert
      .addCase(sendEmergencyAlert.pending, (state) => {
        state.isSending = true;
        state.isLoading = true;
        state.sendError = null;
      })
      .addCase(sendEmergencyAlert.fulfilled, (state, action) => {
        state.isSending = false;
        state.isLoading = false;
        state.lastAlert = action.payload;
        state.sendError = null;
        
        // Actualizar estadísticas
        state.stats.totalEmergencies += 1;
        state.stats.activeEmergencies += 1;
      })
      .addCase(sendEmergencyAlert.rejected, (state, action) => {
        state.isSending = false;
        state.isLoading = false;
        state.sendError = action.payload;
      })
      
      // Get Emergency History
      .addCase(getEmergencyHistory.pending, (state) => {
        state.isLoadingHistory = true;
        state.historyError = null;
      })
      .addCase(getEmergencyHistory.fulfilled, (state, action) => {
        state.isLoadingHistory = false;
        state.emergencies = action.payload;
        state.historyError = null;
        
        // Actualizar estadísticas
        state.stats.totalEmergencies = action.payload.length;
        state.stats.activeEmergencies = action.payload.filter(e => e.status === 'active').length;
        state.stats.resolvedEmergencies = action.payload.filter(e => e.status === 'resolved').length;
      })
      .addCase(getEmergencyHistory.rejected, (state, action) => {
        state.isLoadingHistory = false;
        state.historyError = action.payload;
      })
      
      // Resolve Emergency
      .addCase(resolveEmergency.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resolveEmergency.fulfilled, (state, action) => {
        state.isLoading = false;
        const { emergencyId, status, resolvedBy, resolvedAt, resolutionNotes } = action.payload;
        
        const emergency = state.emergencies.find(e => e.id === emergencyId);
        if (emergency) {
          emergency.status = status;
          emergency.resolved_by = resolvedBy;
          emergency.resolved_at = resolvedAt;
          emergency.resolution_notes = resolutionNotes;
        }
        
        // Actualizar estadísticas
        state.stats.activeEmergencies = state.emergencies.filter(e => e.status === 'active').length;
        state.stats.resolvedEmergencies = state.emergencies.filter(e => e.status === 'resolved').length;
      })
      .addCase(resolveEmergency.rejected, (state, action) => {
        state.isLoading = false;
        state.sendError = action.payload;
      });
  }
});

export const {
  clearSendError,
  clearHistoryError,
  updateSettings,
  addEmergencyToHistory,
  updateEmergencyStatus,
  resetEmergencyState
} = emergencySlice.actions;

// Selectors
export const selectEmergencyState = (state) => state.emergency;
export const selectIsLoading = (state) => state.emergency.isLoading;
export const selectIsSending = (state) => state.emergency.isSending;
export const selectSendError = (state) => state.emergency.sendError;
export const selectLastAlert = (state) => state.emergency.lastAlert;
export const selectEmergencies = (state) => state.emergency.emergencies;
export const selectIsLoadingHistory = (state) => state.emergency.isLoadingHistory;
export const selectHistoryError = (state) => state.emergency.historyError;
export const selectEmergencyStats = (state) => state.emergency.stats;
export const selectEmergencySettings = (state) => state.emergency.settings;

// Selector para emergencias activas
export const selectActiveEmergencies = (state) => 
  state.emergency.emergencies.filter(emergency => emergency.status === 'active');

// Selector para emergencias recientes (últimas 24 horas)
export const selectRecentEmergencies = (state) => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return state.emergency.emergencies.filter(emergency => 
    new Date(emergency.timestamp) > oneDayAgo
  );
};

// Selector para emergencias por tipo
export const selectEmergenciesByType = (state, type) =>
  state.emergency.emergencies.filter(emergency => emergency.type === type);

export default emergencySlice.reducer;