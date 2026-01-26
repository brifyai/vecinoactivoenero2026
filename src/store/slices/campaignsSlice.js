import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseCampaignsService from '../../services/supabaseCampaignsService';
import campaignSenderService from '../../services/campaignSenderService';

// =====================================================
// ASYNC THUNKS
// =====================================================

// Crear campaña
export const createCampaign = createAsyncThunk(
  'campaigns/create',
  async (campaignData, { rejectWithValue }) => {
    try {
      const result = await supabaseCampaignsService.createCampaign(campaignData);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener campañas
export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const result = await supabaseCampaignsService.getCampaigns(filters);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener campaña por ID
export const fetchCampaignById = createAsyncThunk(
  'campaigns/fetchById',
  async (campaignId, { rejectWithValue }) => {
    try {
      const result = await supabaseCampaignsService.getCampaignById(campaignId);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Actualizar campaña
export const updateCampaign = createAsyncThunk(
  'campaigns/update',
  async ({ campaignId, updates }, { rejectWithValue }) => {
    try {
      const result = await supabaseCampaignsService.updateCampaign(campaignId, updates);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Eliminar campaña
export const deleteCampaign = createAsyncThunk(
  'campaigns/delete',
  async (campaignId, { rejectWithValue }) => {
    try {
      const result = await supabaseCampaignsService.deleteCampaign(campaignId);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return campaignId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Estimar audiencia
export const estimateAudience = createAsyncThunk(
  'campaigns/estimateAudience',
  async ({ neighborhoodId, targetAudience }, { rejectWithValue }) => {
    try {
      const result = await supabaseCampaignsService.estimateAudience(neighborhoodId, targetAudience);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.count;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Enviar campaña
export const sendCampaign = createAsyncThunk(
  'campaigns/send',
  async (campaignId, { rejectWithValue }) => {
    try {
      // Usar el campaignSenderService que orquesta todos los canales
      const result = await campaignSenderService.sendCampaign(campaignId);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return { 
        campaignId, 
        sent: result.sent,
        failed: result.failed,
        total: result.total
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Programar campaña
export const scheduleCampaign = createAsyncThunk(
  'campaigns/schedule',
  async ({ campaignId, scheduledAt }, { rejectWithValue }) => {
    try {
      const result = await supabaseCampaignsService.scheduleCampaign(campaignId, scheduledAt);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener campañas programadas
export const fetchScheduledCampaigns = createAsyncThunk(
  'campaigns/fetchScheduled',
  async (_, { rejectWithValue }) => {
    try {
      const result = await supabaseCampaignsService.getScheduledCampaigns();
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener estadísticas de campaña
export const fetchCampaignStats = createAsyncThunk(
  'campaigns/fetchStats',
  async (campaignId, { rejectWithValue }) => {
    try {
      const result = await supabaseCampaignsService.getCampaignStats(campaignId);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return { campaignId, stats: result.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// =====================================================
// SLICE
// =====================================================

const initialState = {
  campaigns: [],
  currentCampaign: null,
  scheduledCampaigns: [],
  campaignStats: {},
  loading: false,
  error: null,
  filters: {
    status: null,
    campaign_type: null,
    neighborhood_id: null
  },
  audienceEstimate: 0,
  estimatingAudience: false,
  sendingCampaign: false
};

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentCampaign: (state, action) => {
      state.currentCampaign = action.payload;
    },
    clearCurrentCampaign: (state) => {
      state.currentCampaign = null;
    },
    resetAudienceEstimate: (state) => {
      state.audienceEstimate = 0;
    },
    // Realtime updates
    addCampaignFromRealtime: (state, action) => {
      const newCampaign = action.payload;
      const existingIndex = state.campaigns.findIndex(c => c.id === newCampaign.id);
      if (existingIndex === -1) {
        state.campaigns.unshift(newCampaign);
      }
    },
    updateCampaignFromRealtime: (state, action) => {
      const updatedCampaign = action.payload;
      const index = state.campaigns.findIndex(c => c.id === updatedCampaign.id);
      if (index !== -1) {
        state.campaigns[index] = { ...state.campaigns[index], ...updatedCampaign };
      }
      if (state.currentCampaign && state.currentCampaign.id === updatedCampaign.id) {
        state.currentCampaign = { ...state.currentCampaign, ...updatedCampaign };
      }
    },
    removeCampaignFromRealtime: (state, action) => {
      const campaignId = action.payload;
      state.campaigns = state.campaigns.filter(c => c.id !== campaignId);
      if (state.currentCampaign && state.currentCampaign.id === campaignId) {
        state.currentCampaign = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Create campaign
      .addCase(createCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns.unshift(action.payload);
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch campaigns
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch campaign by ID
      .addCase(fetchCampaignById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaignById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCampaign = action.payload;
      })
      .addCase(fetchCampaignById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update campaign
      .addCase(updateCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
        if (state.currentCampaign && state.currentCampaign.id === action.payload.id) {
          state.currentCampaign = action.payload;
        }
      })
      
      // Delete campaign
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.campaigns = state.campaigns.filter(c => c.id !== action.payload);
        if (state.currentCampaign && state.currentCampaign.id === action.payload) {
          state.currentCampaign = null;
        }
      })
      
      // Estimate audience
      .addCase(estimateAudience.pending, (state) => {
        state.estimatingAudience = true;
      })
      .addCase(estimateAudience.fulfilled, (state, action) => {
        state.estimatingAudience = false;
        state.audienceEstimate = action.payload;
      })
      .addCase(estimateAudience.rejected, (state, action) => {
        state.estimatingAudience = false;
        state.error = action.payload;
      })
      
      // Send campaign
      .addCase(sendCampaign.pending, (state) => {
        state.sendingCampaign = true;
        state.error = null;
      })
      .addCase(sendCampaign.fulfilled, (state, action) => {
        state.sendingCampaign = false;
        const { campaignId } = action.payload;
        const index = state.campaigns.findIndex(c => c.id === campaignId);
        if (index !== -1) {
          state.campaigns[index].status = 'sending';
        }
      })
      .addCase(sendCampaign.rejected, (state, action) => {
        state.sendingCampaign = false;
        state.error = action.payload;
      })
      
      // Schedule campaign
      .addCase(scheduleCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
        if (state.currentCampaign && state.currentCampaign.id === action.payload.id) {
          state.currentCampaign = action.payload;
        }
      })
      
      // Fetch scheduled campaigns
      .addCase(fetchScheduledCampaigns.fulfilled, (state, action) => {
        state.scheduledCampaigns = action.payload;
      })
      
      // Fetch campaign stats
      .addCase(fetchCampaignStats.fulfilled, (state, action) => {
        const { campaignId, stats } = action.payload;
        state.campaignStats[campaignId] = stats;
      });
  }
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setCurrentCampaign,
  clearCurrentCampaign,
  resetAudienceEstimate,
  addCampaignFromRealtime,
  updateCampaignFromRealtime,
  removeCampaignFromRealtime
} = campaignsSlice.actions;

export default campaignsSlice.reducer;