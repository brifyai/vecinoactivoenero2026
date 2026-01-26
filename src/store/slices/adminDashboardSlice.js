import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseAdminService from '../../services/supabaseAdminService';

// =====================================================
// ASYNC THUNKS
// =====================================================

// Obtener roles administrativos
export const fetchAdminRoles = createAsyncThunk(
  'adminDashboard/fetchRoles',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const result = await supabaseAdminService.getAdminRoles(filters);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Crear rol administrativo
export const createAdminRole = createAsyncThunk(
  'adminDashboard/createRole',
  async (roleData, { rejectWithValue }) => {
    try {
      const result = await supabaseAdminService.createAdminRole(roleData);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Verificar permisos de usuario
export const checkUserPermissions = createAsyncThunk(
  'adminDashboard/checkPermissions',
  async ({ userId, neighborhoodId }, { rejectWithValue }) => {
    try {
      const result = await supabaseAdminService.checkUserPermissions(userId, neighborhoodId);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.permissions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener vecindarios del usuario
export const fetchUserNeighborhoods = createAsyncThunk(
  'adminDashboard/fetchUserNeighborhoods',
  async (userId, { rejectWithValue }) => {
    try {
      const result = await supabaseAdminService.getUserNeighborhoods(userId);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener configuración del dashboard
export const fetchDashboardConfig = createAsyncThunk(
  'adminDashboard/fetchConfig',
  async ({ neighborhoodId, configKey }, { rejectWithValue }) => {
    try {
      const result = await supabaseAdminService.getDashboardConfig(neighborhoodId, configKey);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Actualizar configuración del dashboard
export const updateDashboardConfig = createAsyncThunk(
  'adminDashboard/updateConfig',
  async ({ neighborhoodId, configKey, configValue, updatedBy }, { rejectWithValue }) => {
    try {
      const result = await supabaseAdminService.updateDashboardConfig(
        neighborhoodId, 
        configKey, 
        configValue, 
        updatedBy
      );
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return { configKey, configValue };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener estadísticas del dashboard
export const fetchDashboardStats = createAsyncThunk(
  'adminDashboard/fetchStats',
  async (neighborhoodId, { rejectWithValue }) => {
    try {
      const result = await supabaseAdminService.getDashboardStats(neighborhoodId);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Obtener usuarios del vecindario
export const fetchNeighborhoodUsers = createAsyncThunk(
  'adminDashboard/fetchUsers',
  async ({ neighborhoodId, filters }, { rejectWithValue }) => {
    try {
      const result = await supabaseAdminService.getNeighborhoodUsers(neighborhoodId, filters);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Buscar usuarios
export const searchUsers = createAsyncThunk(
  'adminDashboard/searchUsers',
  async ({ searchTerm, neighborhoodId }, { rejectWithValue }) => {
    try {
      const result = await supabaseAdminService.searchUsers(searchTerm, neighborhoodId);
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      return result.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// =====================================================
// SLICE
// =====================================================

const initialState = {
  // Información del usuario admin actual
  currentAdmin: null,
  permissions: {
    is_admin: false,
    can_manage_tickets: false,
    can_send_campaigns: false,
    can_manage_users: false,
    can_view_analytics: false,
    role_types: []
  },
  
  // Vecindarios administrados
  userNeighborhoods: [],
  currentNeighborhood: null,
  
  // Roles administrativos
  adminRoles: [],
  
  // Configuración del dashboard
  dashboardConfig: {},
  
  // Estadísticas generales
  dashboardStats: {
    tickets: { total: 0, pending: 0, in_progress: 0, resolved: 0, urgent: 0 },
    campaigns: { total: 0, sent: 0, scheduled: 0, draft: 0 },
    users: { total: 0, verified: 0 }
  },
  
  // Usuarios del vecindario
  neighborhoodUsers: [],
  userSearchResults: [],
  
  // Estados de carga
  loading: false,
  error: null,
  permissionsLoading: false,
  configLoading: false,
  statsLoading: false,
  usersLoading: false,
  searchLoading: false
};

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentAdmin: (state, action) => {
      state.currentAdmin = action.payload;
    },
    setCurrentNeighborhood: (state, action) => {
      state.currentNeighborhood = action.payload;
    },
    clearCurrentNeighborhood: (state) => {
      state.currentNeighborhood = null;
    },
    updateConfigValue: (state, action) => {
      const { configKey, configValue } = action.payload;
      state.dashboardConfig[configKey] = configValue;
    },
    clearUserSearchResults: (state) => {
      state.userSearchResults = [];
    },
    // Realtime updates
    updateStatsFromRealtime: (state, action) => {
      const { type, data } = action.payload;
      if (type === 'tickets') {
        state.dashboardStats.tickets = { ...state.dashboardStats.tickets, ...data };
      } else if (type === 'campaigns') {
        state.dashboardStats.campaigns = { ...state.dashboardStats.campaigns, ...data };
      } else if (type === 'users') {
        state.dashboardStats.users = { ...state.dashboardStats.users, ...data };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch admin roles
      .addCase(fetchAdminRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.adminRoles = action.payload;
      })
      .addCase(fetchAdminRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create admin role
      .addCase(createAdminRole.fulfilled, (state, action) => {
        state.adminRoles.unshift(action.payload);
      })
      
      // Check user permissions
      .addCase(checkUserPermissions.pending, (state) => {
        state.permissionsLoading = true;
      })
      .addCase(checkUserPermissions.fulfilled, (state, action) => {
        state.permissionsLoading = false;
        state.permissions = action.payload;
      })
      .addCase(checkUserPermissions.rejected, (state, action) => {
        state.permissionsLoading = false;
        state.error = action.payload;
      })
      
      // Fetch user neighborhoods
      .addCase(fetchUserNeighborhoods.fulfilled, (state, action) => {
        state.userNeighborhoods = action.payload;
        // Si no hay vecindario actual seleccionado, seleccionar el primero
        if (!state.currentNeighborhood && action.payload.length > 0) {
          state.currentNeighborhood = action.payload[0].neighborhood;
        }
      })
      
      // Fetch dashboard config
      .addCase(fetchDashboardConfig.pending, (state) => {
        state.configLoading = true;
      })
      .addCase(fetchDashboardConfig.fulfilled, (state, action) => {
        state.configLoading = false;
        state.dashboardConfig = action.payload;
      })
      .addCase(fetchDashboardConfig.rejected, (state, action) => {
        state.configLoading = false;
        state.error = action.payload;
      })
      
      // Update dashboard config
      .addCase(updateDashboardConfig.fulfilled, (state, action) => {
        const { configKey, configValue } = action.payload;
        state.dashboardConfig[configKey] = configValue;
      })
      
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })
      
      // Fetch neighborhood users
      .addCase(fetchNeighborhoodUsers.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(fetchNeighborhoodUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.neighborhoodUsers = action.payload;
      })
      .addCase(fetchNeighborhoodUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })
      
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.userSearchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  setCurrentAdmin,
  setCurrentNeighborhood,
  clearCurrentNeighborhood,
  updateConfigValue,
  clearUserSearchResults,
  updateStatsFromRealtime
} = adminDashboardSlice.actions;

// =====================================================
// SELECTORS
// =====================================================

export const selectCurrentAdmin = (state) => state.adminDashboard.currentAdmin;
export const selectAdminRole = (state) => state.adminDashboard.permissions?.role_types?.[0] || null;
export const selectIsUVAdmin = (state) => state.adminDashboard.permissions?.role_types?.includes('uv_admin') || false;
export const selectPermissions = (state) => state.adminDashboard.permissions;
export const selectCurrentNeighborhood = (state) => state.adminDashboard.currentNeighborhood;
export const selectDashboardStats = (state) => state.adminDashboard.dashboardStats;
export const selectNeighborhoodUsers = (state) => state.adminDashboard.neighborhoodUsers;
export const selectUserSearchResults = (state) => state.adminDashboard.userSearchResults;
export const selectLoading = (state) => state.adminDashboard.loading;
export const selectError = (state) => state.adminDashboard.error;

// =====================================================
// ADDITIONAL ACTIONS
// =====================================================

// Alias para compatibilidad
export const loadDashboardStats = fetchDashboardStats;
export const clearCurrentAdmin = () => (dispatch) => {
  dispatch(setCurrentAdmin(null));
  dispatch(clearCurrentNeighborhood());
};

export default adminDashboardSlice.reducer;