import { useSelector, useDispatch } from 'react-redux';
import { 
  loginUser, 
  registerUser, 
  logout, 
  updateUser, 
  updateUserAvatar,
  clearError,
  clearSessionExpired
} from '../store/slices/authSlice';
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectSessionExpired
} from '../store/selectors/authSelectors';

/**
 * Hook personalizado que replica la API de useAuth() pero usa Redux
 * Esto facilita la migración gradual sin cambiar todos los componentes a la vez
 */
export const useReduxAuth = () => {
  const dispatch = useDispatch();
  
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const sessionExpired = useSelector(selectSessionExpired);

  const login = async (email, password) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      return { success: true };
    } else {
      return { success: false, error: result.payload };
    }
  };

  const register = async (userData) => {
    const result = await dispatch(registerUser(userData));
    if (registerUser.fulfilled.match(result)) {
      return { success: true };
    } else {
      return { success: false, error: result.payload };
    }
  };

  const handleLogout = () => {
    // Limpiar Redux Persist
    localStorage.removeItem('persist:vecino-activo-root');
    
    // Marcar como logout intencional para evitar restauración automática
    localStorage.setItem('friendbook_intentional_logout', 'true');
    
    // Hacer logout en Redux
    dispatch(logout());
    
    // Forzar navegación después de un breve delay
    setTimeout(() => {
      window.location.href = '/iniciar-sesion';
    }, 100);
  };

  const handleUpdateUser = (updates) => {
    dispatch(updateUser(updates));
  };

  const handleUpdateUserAvatar = (avatar) => {
    dispatch(updateUserAvatar(avatar));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const handleClearSessionExpired = () => {
    dispatch(clearSessionExpired());
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    sessionExpired,
    login,
    register,
    logout: handleLogout,
    updateUser: handleUpdateUser,
    updateUserAvatar: handleUpdateUserAvatar,
    clearError: handleClearError,
    clearSessionExpired: handleClearSessionExpired
  };
};
