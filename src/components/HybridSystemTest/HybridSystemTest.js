// ============================================
// COMPONENTE DE PRUEBA DEL SISTEMA HÍBRIDO
// Para verificar funcionalidad en desarrollo
// ============================================

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/selectors/authSelectors';
import { useHybridRealtimeContext } from '../HybridRealtimeProvider/HybridRealtimeProvider';
import hybridSyncService from '../../services/hybridSyncService';
import firebaseNotificationsService from '../../services/firebaseNotificationsService';
import './HybridSystemTest.css';

const HybridSystemTest = () => {
  const user = useSelector(selectUser);
  const hybridContext = useHybridRealtimeContext();
  const [testResults, setTestResults] = useState({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [logs, setLogs] = useState([]);

  // Agregar log
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  // ============================================
  // PRUEBAS INDIVIDUALES
  // ============================================

  // Prueba 1: Conexión híbrida
  const testHybridConnection = async () => {
    addLog('🔄 Probando conexión híbrida...', 'info');
    
    try {
      const connectionInfo = hybridContext.getConnectionInfo();
      
      if (connectionInfo.isConnected) {
        addLog('✅ Conexión híbrida activa', 'success');
        return { success: true, data: connectionInfo };
      } else {
        addLog('❌ Conexión híbrida inactiva', 'error');
        return { success: false, error: 'No conectado' };
      }
    } catch (error) {
      addLog(`❌ Error en conexión híbrida: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  };

  // Prueba 2: Sincronización de post
  const testPostSync = async () => {
    addLog('📝 Probando sincronización de post...', 'info');
    
    try {
      const testPost = {
        id: `test_post_${Date.now()}`,
        author_id: user?.id || 'test_user',
        content: `Post de prueba - ${new Date().toLocaleString()}`,
        created_at: new Date().toISOString(),
        neighborhood_id: user?.neighborhood_id || 'test_neighborhood'
      };

      const success = await hybridContext.syncPost(testPost);
      
      if (success) {
        addLog('✅ Post sincronizado correctamente', 'success');
        return { success: true, data: testPost };
      } else {
        addLog('❌ Error sincronizando post', 'error');
        return { success: false, error: 'Sync failed' };
      }
    } catch (error) {
      addLog(`❌ Error en sync de post: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  };

  // Prueba 3: Notificación Firebase
  const testFirebaseNotification = async () => {
    addLog('🔔 Probando notificación Firebase...', 'info');
    
    try {
      const testNotification = {
        userId: user?.id || 'test_user',
        title: 'Prueba Sistema Híbrido',
        body: `Notificación de prueba - ${new Date().toLocaleString()}`,
        type: 'test',
        data: {
          testId: Date.now(),
          source: 'hybrid_test'
        }
      };

      await firebaseNotificationsService.createNotification(testNotification);
      addLog('✅ Notificación Firebase enviada', 'success');
      return { success: true, data: testNotification };
    } catch (error) {
      addLog(`❌ Error en notificación Firebase: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  };

  // Prueba 4: Presencia de usuario
  const testUserPresence = async () => {
    addLog('👤 Probando presencia de usuario...', 'info');
    
    try {
      const success = await hybridContext.updatePresence('online');
      
      if (success) {
        addLog('✅ Presencia actualizada', 'success');
        return { success: true, data: { status: 'online' } };
      } else {
        addLog('❌ Error actualizando presencia', 'error');
        return { success: false, error: 'Presence update failed' };
      }
    } catch (error) {
      addLog(`❌ Error en presencia: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  };

  // Prueba 5: Emergencia (simulada)
  const testEmergencySync = async () => {
    addLog('🚨 Probando sincronización de emergencia...', 'info');
    
    try {
      const testEmergency = {
        id: `test_emergency_${Date.now()}`,
        user_id: user?.id || 'test_user',
        user_name: user?.name || 'Usuario de Prueba',
        neighborhood_id: user?.neighborhood_id || 'test_neighborhood',
        message: 'Prueba de emergencia del sistema híbrido',
        location: { lat: -33.4489, lng: -70.6693 },
        timestamp: new Date().toISOString(),
        status: 'active',
        type: 'test'
      };

      const success = await hybridContext.syncEmergency(testEmergency);
      
      if (success) {
        addLog('✅ Emergencia sincronizada', 'success');
        return { success: true, data: testEmergency };
      } else {
        addLog('❌ Error sincronizando emergencia', 'error');
        return { success: false, error: 'Emergency sync failed' };
      }
    } catch (error) {
      addLog(`❌ Error en emergencia: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  };

  // ============================================
  // EJECUTAR TODAS LAS PRUEBAS
  // ============================================

  const runAllTests = async () => {
    setIsRunningTests(true);
    setLogs([]);
    addLog('🚀 Iniciando pruebas del sistema híbrido...', 'info');

    const tests = [
      { name: 'hybridConnection', fn: testHybridConnection },
      { name: 'postSync', fn: testPostSync },
      { name: 'firebaseNotification', fn: testFirebaseNotification },
      { name: 'userPresence', fn: testUserPresence },
      { name: 'emergencySync', fn: testEmergencySync }
    ];

    const results = {};

    for (const test of tests) {
      addLog(`\n🧪 Ejecutando: ${test.name}`, 'info');
      const result = await test.fn();
      results[test.name] = result;
      
      // Pausa entre pruebas
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setTestResults(results);
    setIsRunningTests(false);

    // Resumen
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalCount = Object.keys(results).length;
    
    addLog(`\n📊 RESUMEN: ${successCount}/${totalCount} pruebas exitosas`, 
           successCount === totalCount ? 'success' : 'warning');
  };

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    // Limpiar logs al montar
    setLogs([]);
    addLog('🔧 Componente de prueba híbrido inicializado', 'info');
  }, []);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="hybrid-system-test">
      <div className="test-header">
        <h2>🧪 Pruebas del Sistema Híbrido</h2>
        <p>Verifica que todos los componentes del sistema híbrido funcionen correctamente</p>
      </div>

      {/* Estado de conexión */}
      <div className="connection-status">
        <h3>📡 Estado de Conexión</h3>
        <div className="status-grid">
          <div className={`status-item ${hybridContext.isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span>Híbrido: {hybridContext.connectionStatus}</span>
          </div>
          <div className="status-item">
            <span className="status-dot"></span>
            <span>Usuario: {user?.name || 'No autenticado'}</span>
          </div>
          <div className="status-item">
            <span className="status-dot"></span>
            <span>Última actualización: {hybridContext.lastUpdate?.toLocaleTimeString() || 'Nunca'}</span>
          </div>
        </div>
      </div>

      {/* Controles de prueba */}
      <div className="test-controls">
        <button 
          onClick={runAllTests} 
          disabled={isRunningTests || !hybridContext.isConnected}
          className="run-tests-btn"
        >
          {isRunningTests ? '🔄 Ejecutando...' : '🚀 Ejecutar Todas las Pruebas'}
        </button>

        <div className="individual-tests">
          <button onClick={testHybridConnection} disabled={isRunningTests}>
            🔄 Conexión
          </button>
          <button onClick={testPostSync} disabled={isRunningTests}>
            📝 Post Sync
          </button>
          <button onClick={testFirebaseNotification} disabled={isRunningTests}>
            🔔 Notificación
          </button>
          <button onClick={testUserPresence} disabled={isRunningTests}>
            👤 Presencia
          </button>
          <button onClick={testEmergencySync} disabled={isRunningTests}>
            🚨 Emergencia
          </button>
        </div>
      </div>

      {/* Resultados de pruebas */}
      {Object.keys(testResults).length > 0 && (
        <div className="test-results">
          <h3>📊 Resultados</h3>
          <div className="results-grid">
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName} className={`result-item ${result.success ? 'success' : 'error'}`}>
                <div className="result-header">
                  <span className="result-icon">
                    {result.success ? '✅' : '❌'}
                  </span>
                  <span className="result-name">{testName}</span>
                </div>
                {result.error && (
                  <div className="result-error">{result.error}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="test-logs">
        <h3>📝 Logs</h3>
        <div className="logs-container">
          {logs.map((log, index) => (
            <div key={index} className={`log-entry ${log.type}`}>
              <span className="log-timestamp">{log.timestamp}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Información del sistema */}
      <div className="system-info">
        <h3>ℹ️ Información del Sistema</h3>
        <div className="info-grid">
          <div className="info-item">
            <strong>Conexión:</strong> {hybridContext.connectionStatus}
          </div>
          <div className="info-item">
            <strong>Reintentos:</strong> {hybridContext.retryCount}/{hybridContext.maxRetries}
          </div>
          <div className="info-item">
            <strong>Usuario ID:</strong> {user?.id || 'N/A'}
          </div>
          <div className="info-item">
            <strong>Vecindario:</strong> {user?.neighborhood_id || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridSystemTest;