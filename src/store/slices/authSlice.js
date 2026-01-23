import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import storageService from '../../services/storageService';
import emailVerificationService from '../../services/emailVerificationService';

const SESSION_STORAGE_KEY = 'friendbook_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Thunks asíncronos
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const users = storageService.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return rejectWithValue('Credenciales inválidas');
      }
      
      // Guardar sesión
      const session = {
        createdAt: Date.now(),
        userId: user.id
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      storageService.setCurrentUser(user);
      
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const users = storageService.getUsers();
      
      if (users.find(u => u.email === userData.email)) {
        return rejectWithValue('El email ya está registrado');
      }
      
      const newUser = {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString(),
        friends: [],
        friendRequests: [],
        verified: false
      };
      
      storageService.addUser(newUser);
      storageService.setCurrentUser(newUser);
      
      // Guardar sesión
      const session = {
        createdAt: Date.now(),
        userId: newUser.id
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      
      return newUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) || 'null');
      const savedUser = storageService.getCurrentUser();
      
      if (!session || !savedUser) {
        return rejectWithValue('No hay sesión');
      }
      
      const currentTime = Date.now();
      if (currentTime - session.createdAt > SESSION_TIMEOUT) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        storageService.clearCurrentUser();
        return rejectWithValue('Sesión expirada');
      }
      
      return savedUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    sessionExpired: false,
    isAuthenticated: false
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.sessionExpired = false;
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem('persist:vecino-activo-root'); // Limpiar Redux Persist
      storageService.clearCurrentUser();
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      storageService.updateUser(state.user.id, action.payload);
      storageService.setCurrentUser(state.user);
    },
    updateUserAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
        storageService.updateUser(state.user.id, { avatar: action.payload });
        storageService.setCurrentUser(state.user);
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
