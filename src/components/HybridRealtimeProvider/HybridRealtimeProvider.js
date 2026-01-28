// ============================================
// PROVEEDOR DE REALTIME HÍBRIDO
// Componente que inicializa y gestiona el sistema híbrido
// ============================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../../store/selectors/authSelectors';
import { useHybridRealtime } from '../../hooks/useHybridRealtime';

// Crear contexto
const HybridRealtimeContext = createContext(null);

// Hook para usar el contexto
export const useHybridRealtimeContext = () => {
  const context = useContext(HybridRealtimeContext);
  if (!context) {
    throw new Error('useHybridRealtimeContext debe usarse dentro de HybridRealtimeProvider');
  }
  return context;
};

// Componente proveedor
export const HybridRealtimeProvider = ({ children }) => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Hook híbrido
  const hybridRealtime = useHybridRealtime();

  // Estado del proveedor
  const [providerState, setProviderState] = useState({
    isReady: false,
    error: null,
    retryCount: 0
  });

  // ============================================
  // EFECTOS
  // ============================================

  // Inicializar cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user?.id && !isInitialized) {
      console.log('🚀 Inicializando HybridRealtimeProvider para usuario:', user.id);
      setIsInitialized(true);
      setProviderState(prev => ({ ...prev, isReady: true, error: null }));
    } else if (!isAuthenticated && isInitialized) {
      console.log('🧹 Usuario desautenticado, limpiando HybridRealtimeProvider');
      hybridRealtime.cleanup();
      setIsInitialized(false);
      setProviderState({ isReady: false, error: null, retryCount: 0 });
    }
  }, [isAuthenticated, user?.id, isInitialized, hybridRealtime]);

  // Manejar errores de conexión
  useEffect(() => {
    if (hybridRealtime.connectionStatus === 'error' && providerState.retryCount < 3) {
      console.log(`🔄 Error de conexión, reintentando... (${providerState.retryCount + 1}/3)`);
      
      const retryTimeout = setTimeout(() => {
        hybridRealtime.reconnect();
        setProviderState(prev => ({ 
          ...prev, 
          retryCount: prev.retryCount + 1 
        }));
      }, 5000 * (providerState.retryCount + 1)); // Backoff exponencial

      return () => clearTimeout(retryTimeout);
    }
  }, [hybridRealtime.connectionStatus, providerState.retryCount, hybridRealtime]);

  // ============================================
  // FUNCIONES DEL CONTEXTO
  // ============================================

  const contextValue = {
    // Estado
    isReady: providerState.isReady && hybridRealtime.isConnected,
    isConnected: hybridRealtime.isConnected,
    connectionStatus: hybridRealtime.connectionStatus,
    lastUpdate: hybridRealtime.lastUpdate,
    error: providerState.error,
    
    // Funciones de sincronización
    syncPost: hybridRealtime.syncPost,
    syncMessage: hybridRealtime.syncMessage,
    syncNotification: hybridRealtime.syncNotification,
    syncEmergency: hybridRealtime.syncEmergency,
    updatePresence: hybridRealtime.updatePresence,
    
    // Control
    reconnect: hybridRealtime.reconnect,
    getConnectionInfo: hybridRealtime.getConnectionInfo,
    
    // Estado del proveedor
    retryCount: providerState.retryCount,
    maxRetries: 3
  };

  return (
    <HybridRealtimeContext.Provider value={contextValue}>
      {children}
    </HybridRealtimeContext.Provider>
  );
};

export default HybridRealtimeProvider;
