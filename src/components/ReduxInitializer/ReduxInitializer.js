import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreSession } from '../../store/slices/authSlice';
import { loadPosts } from '../../store/slices/postsSlice';
import { loadNotifications } from '../../store/slices/notificationsSlice';
import storageService from '../../services/storageService';

const ReduxInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Inicializar datos mock si es necesario
    storageService.initializeMockData();
    
    // Restaurar sesión
    dispatch(restoreSession());
    
    // Cargar posts
    dispatch(loadPosts());
    
    // Cargar notificaciones
    dispatch(loadNotifications());
  }, [dispatch]);

  return children;
};

export default ReduxInitializer;
