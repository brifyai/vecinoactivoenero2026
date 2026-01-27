import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession } from '../../store/slices/authSlice';
import { selectIsAuthenticated } from '../../store/selectors/authSelectors';

const ReduxInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 ReduxInitializer: Iniciando...');
        console.log('🔍 Estado de autenticación actual:', isAuthenticated);
        
        // Si ya está autenticado (por redux-persist), no hacer nada
        if (isAuthenticated) {
          console.log('✅ Sesión ya restaurada por redux-persist');
          return;
        }
        
        // Si no está autenticado, intentar restaurar desde localStorage
        try {
          const result = await dispatch(restoreSession()).unwrap();
          console.log('✅ Sesión restaurada exitosamente:', result?.email);
        } catch (error) {
          console.log('ℹ️ No hay sesión previa o falló la restauración:', error);
        }
        
        console.log('✅ ReduxInitializer: Completado');
      } catch (error) {
        console.error('❌ Error en ReduxInitializer:', error);
      }
    };

    // Esperar un tick para que redux-persist termine de hidratar
    const timer = setTimeout(initializeApp, 100);
    return () => clearTimeout(timer);
  }, [dispatch, isAuthenticated]);

  return children;
};

export default ReduxInitializer;
