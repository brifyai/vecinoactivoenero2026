import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { restoreSession } from '../../store/slices/authSlice';

const ReduxInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 ReduxInitializer: Iniciando...');
        
        // Restaurar sesión si existe
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

    initializeApp();
  }, [dispatch]);

  return children;
};

export default ReduxInitializer;
