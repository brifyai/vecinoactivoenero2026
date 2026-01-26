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

  const login = async (email, password, userType = 'user') => {
    const result = await dispatch(loginUser({ email, password, userType }));
    if (loginUser.fulfilled.match(result)) {
      return { success: true, user: result.payload };
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
    console.log('🔵 handleLogout llamado');
    
    // Hacer logout en Redux - esto limpiará automáticamente Redux Persist
    dispatch(logout());
    
    console.log('🔵 Logout dispatch completado');
    
    // Redirigir inmediatamente
    window.location.href = '/iniciar-sesion';
  };

  const handleUpdateUser = (updates) => {
    dispatch(updateUser(updates));
  };

  const handleUpdateUserProfile = (profileData) => {
    const result = dispatch(updateUser(profileData));
    if (updateUser.fulfilled.match(result)) {
      return { success: true };
    } else {
      return { success: false, error: result.payload };
    }
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

  const verifyUserEmail = (email) => {
    // Marcar email como verificado
    dispatch(updateUser({ emailVerified: true, email }));
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
    updateUserProfile: handleUpdateUserProfile,
    updateUserAvatar: handleUpdateUserAvatar,
    verifyUserEmail,
    clearError: handleClearError,
    clearSessionExpired: handleClearSessionExpired
  };
};
