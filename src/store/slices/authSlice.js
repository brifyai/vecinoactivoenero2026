import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseAuthService from '../../services/supabaseAuthService';

// Thunks asíncronos con Supabase
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { user } = await supabaseAuthService.login(email, password);
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Credenciales inválidas');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { user } = await supabaseAuthService.register(userData);
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al registrar usuario');
    }
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const user = await supabaseAuthService.getCurrentUser();
      if (!user) {
        return rejectWithValue('No hay sesión');
      }
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al restaurar sesión');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: true, // Comenzar con loading true para evitar redirecciones prematuras
    error: null,
    sessionExpired: false,
    isAuthenticated: false
  },
  reducers: {
    logout: (state) => {
      console.log('🔴 LOGOUT EJECUTADO - Limpiando estado');
      
      // Logout de Supabase
      supabaseAuthService.logout().catch(err => console.error('Error en logout:', err));
      
      // Resetear estado a inicial
      return {
        user: null,
        loading: false,
        error: null,
        sessionExpired: false,
        isAuthenticated: false
      };
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // Actualizar en Supabase
      if (state.user?.id) {
        supabaseAuthService.updateProfile(state.user.id, action.payload)
          .catch(err => console.error('Error al actualizar perfil:', err));
      }
    },
    updateUserAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
        // Actualizar en Supabase
        supabaseAuthService.updateAvatar(state.user.id, action.payload)
          .catch(err => console.error('Error al actualizar avatar:', err));
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSessionExpired: (state) => {
      state.sessionExpired = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Restore Session
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
        state.sessionExpired = false;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.sessionExpired = action.payload === 'Sesión expirada';
        state.loading = false;
        state.isAuthenticated = false;
      });
  }
});

export const { 
  logout, 
  updateUser, 
  updateUserAvatar, 
  clearError,
  clearSessionExpired 
} = authSlice.actions;

export default authSlice.reducer;
