import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabaseAuthService from '../../services/supabaseAuthService';
import persistenceManager from '../../utils/persistenceManager';

const SESSION_STORAGE_KEY = 'friendbook_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Thunks asíncronos
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('🚀 Redux authSlice: Intentando login con:', email);
      
      // Usar supabaseAuthService en lugar de storageService
      const result = await supabaseAuthService.login(email, password);
      
      if (!result || !result.user) {
        return rejectWithValue('Credenciales inválidas');
      }
      
      console.log('✅ Redux authSlice: Login exitoso');
      return result.user;
      
    } catch (error) {
      console.error('❌ Redux authSlice: Error en login:', error);
      return rejectWithValue(error.message || 'Credenciales inválidas');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('🚀 Redux authSlice: Registrando usuario...');
      
      // Usar supabaseAuthService para registro
      const result = await supabaseAuthService.register(userData);
      
      if (!result || !result.user) {
        return rejectWithValue('Error en el registro');
      }
      
      console.log('✅ Redux authSlice: Registro exitoso');
      return result.user;
      
    } catch (error) {
      console.error('❌ Redux authSlice: Error en registro:', error);
      return rejectWithValue(error.message || 'Error en el registro');
    }
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Redux authSlice: Restaurando sesión...');
      
      // Usar supabaseAuthService para obtener usuario actual
      const user = await supabaseAuthService.getCurrentUser();
      
      if (!user) {
        console.log('❌ Redux authSlice: No hay sesión activa');
        return rejectWithValue('No hay sesión');
      }
      
      console.log('✅ Redux authSlice: Sesión restaurada');
      return user;
      
    } catch (error) {
      console.error('❌ Redux authSlice: Error restaurando sesión:', error);
      return rejectWithValue(error.message || 'Error restaurando sesión');
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
      
      // Usar supabaseAuthService para logout
      supabaseAuthService.logout();
      
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
      // TODO: Implementar actualización en Supabase si es necesario
    },
    updateUserAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
        // TODO: Implementar actualización en Supabase si es necesario
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
