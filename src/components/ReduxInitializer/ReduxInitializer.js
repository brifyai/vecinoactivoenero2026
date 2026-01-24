import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreSession } from '../../store/slices/authSlice';

const ReduxInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 ReduxInitializer: Iniciando (modo optimizado)...');
        
        // OPTIMIZACIÓN: Solo restaurar sesión, no cargar datos masivos
        try {
          await dispatch(restoreSession());
          console.log('✅ Sesión restaurada');
        } catch (error) {
          console.warn('⚠️ No hay sesión previa o falló la restauración');
        }
        
        console.log('✅ ReduxInitializer: Completado (optimizado)');
      } catch (error) {
        console.error('❌ Error en ReduxInitializer:', error);
      }
    };

    initializeApp();
  }, [dispatch]);

  return children;
};

export default ReduxInitializer;
