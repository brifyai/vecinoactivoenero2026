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
      {/* Indicador de estado (opcional) */}
      {process.env.NODE_ENV === 'development' && (
        <HybridRealtimeDebugIndicator {...contextValue} />
      )}
    </HybridRealtimeContext.Provider>
  );
};

// ============================================
// COMPONENTE DE DEBUG (solo desarrollo)
// ============================================

const HybridRealtimeDebugIndicator = ({ 
  isConnected, 
  connectionStatus, 
  lastUpdate, 
  retryCount 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'connecting': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢 Conectado';
      case 'connecting': return '🟡 Conectando...';
      case 'error': return '🔴 Error';
      default: return '⚪ Desconectado';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      zIndex: 10000,
      fontFamily: 'monospace',
      minWidth: '200px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Híbrido Realtime</span>
        <button 
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '10px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ marginTop: '4px' }}>
        <div style={{ color: getStatusColor() }}>
          {getStatusText()}
        </div>
        
        {lastUpdate && (
          <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
        
        {retryCount > 0 && (
          <div style={{ fontSize: '10px', color: '#FF9800', marginTop: '2px' }}>
            Reintentos: {retryCount}/3
          </div>
        )}
      </div>
    </div>
  );
};

export default HybridRealtimeProvider;