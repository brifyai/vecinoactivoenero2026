import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreSession } from '../../store/slices/authSlice';
import { loadPosts } from '../../store/slices/postsSlice';
import { loadNotifications } from '../../store/slices/notificationsSlice';
import storageService from '../../services/storageService';

const ReduxInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      // Inicializar datos mock si es necesario
      storageService.initializeMockData();
      
      // Restaurar sesión primero
      await dispatch(restoreSession());
      
      // Luego cargar otros datos
      dispatch(loadPosts());
      dispatch(loadNotifications());
    };

    initializeApp();
  }, [dispatch]);

  return children;
};

export default ReduxInitializer;
