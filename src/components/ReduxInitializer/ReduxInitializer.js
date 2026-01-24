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
      try {
        console.log('🚀 ReduxInitializer: Iniciando...');
        
        // Inicializar datos mock si es necesario
        storageService.initializeMockData();
        
        // Restaurar sesión con timeout para evitar bloqueos
        const sessionPromise = dispatch(restoreSession());
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session restore timeout')), 5000)
        );
        
        try {
          await Promise.race([sessionPromise, timeoutPromise]);
        } catch (error) {
          console.warn('⚠️ Session restore failed or timed out:', error.message);
        }
        
        // Cargar otros datos de forma no bloqueante
        setTimeout(() => {
          dispatch(loadPosts());
          dispatch(loadNotifications());
        }, 100);
        
        console.log('✅ ReduxInitializer: Completado');
      } catch (error) {
        console.error('❌ Error en ReduxInitializer:', error);
      }
    };

    initializeApp();
  }, [dispatch]);

  return children;
};

export default ReduxInitializer;
