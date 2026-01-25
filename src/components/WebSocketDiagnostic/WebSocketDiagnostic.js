import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import './WebSocketDiagnostic.css';

const WebSocketDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState({
    websocketUrl: '',
    connectionStatus: 'checking',
    error: null,
    testResults: {}
  });

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results = {
      websocketUrl: '',
      connectionStatus: 'checking',
      error: null,
      testResults: {}
    };

    try {
      // 1. Verificar URL de WebSocket
      const supabaseUrl = supabase.supabaseUrl;
      const websocketUrl = supabaseUrl.replace('https://', 'wss://') + '/realtime/v1/websocket';
      results.websocketUrl = websocketUrl;

      // 2. Probar conexión básica HTTP
      try {
        const response = await fetch(supabaseUrl + '/rest/v1/', {
          headers: {
            'apikey': supabase.supabaseKey
          }
        });
        results.testResults.httpConnection = response.ok ? 'success' : 'failed';
      } catch (error) {
        results.testResults.httpConnection = 'failed';
      }

      // 3. Intentar conexión WebSocket
      try {
        const channel = supabase.channel('diagnostic-test');
        
        const connectionPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout de conexión WebSocket'));
          }, 10000);

          channel.subscribe((status) => {
            clearTimeout(timeout);
            if (status === 'SUBSCRIBED') {
              resolve('success');
            } else if (status === 'CHANNEL_ERROR') {
              reject(new Error('Error de canal WebSocket'));
            } else if (status === 'TIMED_OUT') {
              reject(new Error('Timeout de WebSocket'));
            }
          });
        });

        await connectionPromise;
        results.connectionStatus = 'connected';
        results.testResults.websocketConnection = 'success';
        
        // Limpiar canal
        supabase.removeChannel(channel);

      } catch (error) {
        results.connectionStatus = 'failed';
        results.error = error.message;
        results.testResults.websocketConnection = 'failed';
      }

      // 4. Verificar configuración de realtime en base de datos
      try {
        // Primero verificar si la extensión existe
        const { data: extensionData, error: extensionError } = await supabase
          .rpc('check_realtime_extension');

        if (extensionError) {
          // Si falla, probablemente no hay extensión realtime
          results.testResults.realtimeConfig = 'extension_not_available';
          results.testResults.realtimeMessage = 'Extensión supabase_realtime no disponible en el servidor';
        } else {
          // Verificar publicación realtime
          const { data, error } = await supabase
            .from('pg_publication_tables')
            .select('*')
            .eq('pubname', 'supabase_realtime');

          if (error) {
            results.testResults.realtimeConfig = 'unknown';
          } else {
            results.testResults.realtimeConfig = data.length > 0 ? 'configured' : 'not_configured';
            results.testResults.realtimeTables = data.map(t => t.tablename);
          }
        }
      } catch (error) {
        results.testResults.realtimeConfig = 'extension_not_available';
        results.testResults.realtimeMessage = 'Supabase self-hosted sin extensión Realtime';
      }

    } catch (error) {
      results.connectionStatus = 'error';
      results.error = error.message;
    }

    setDiagnostics(results);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
      case 'connected':
      case 'configured':
        return '✅';
      case 'failed':
      case 'not_configured':
        return '❌';
      case 'checking':
        return '⏳';
      case 'unknown':
        return '❓';
      default:
        return '⚪';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Exitoso';
      case 'connected':
        return 'Conectado';
      case 'configured':
        return 'Configurado';
      case 'failed':
        return 'Falló';
      case 'not_configured':
        return 'No configurado';
      case 'extension_not_available':
        return 'Extensión no disponible';
      case 'checking':
        return 'Verificando...';
      case 'unknown':
        return 'Desconocido';
      default:
        return status;
    }
  };

  return (
    <div className="websocket-diagnostic">
      <h2>🔌 Diagnóstico WebSocket</h2>
      
      <div className="diagnostic-section">
        <h3>📡 Estado de Conexión</h3>
        <div className="status-item">
          <span>Estado general:</span>
          <span className={`status ${diagnostics.connectionStatus}`}>
            {getStatusIcon(diagnostics.connectionStatus)} {getStatusText(diagnostics.connectionStatus)}
          </span>
        </div>
        
        {diagnostics.error && (
          <div className="error-message">
            <strong>Error:</strong> {diagnostics.error}
          </div>
        )}
      </div>

      <div className="diagnostic-section">
        <h3>🔗 Configuración</h3>
        <div className="status-item">
          <span>URL WebSocket:</span>
          <span className="url">{diagnostics.websocketUrl}</span>
        </div>
      </div>

      <div className="diagnostic-section">
        <h3>🧪 Resultados de Pruebas</h3>
        
        <div className="status-item">
          <span>Conexión HTTP:</span>
          <span className={`status ${diagnostics.testResults.httpConnection}`}>
            {getStatusIcon(diagnostics.testResults.httpConnection)} {getStatusText(diagnostics.testResults.httpConnection)}
          </span>
        </div>
        
        <div className="status-item">
          <span>Conexión WebSocket:</span>
          <span className={`status ${diagnostics.testResults.websocketConnection}`}>
            {getStatusIcon(diagnostics.testResults.websocketConnection)} {getStatusText(diagnostics.testResults.websocketConnection)}
          </span>
        </div>
        
        <div className="status-item">
          <span>Configuración Realtime:</span>
          <span className={`status ${diagnostics.testResults.realtimeConfig}`}>
            {getStatusIcon(diagnostics.testResults.realtimeConfig)} {getStatusText(diagnostics.testResults.realtimeConfig)}
          </span>
        </div>

        {diagnostics.testResults.realtimeMessage && (
          <div className="status-item">
            <span>Mensaje:</span>
            <span className="message">{diagnostics.testResults.realtimeMessage}</span>
          </div>
        )}

        {diagnostics.testResults.realtimeTables && (
          <div className="status-item">
            <span>Tablas configuradas:</span>
            <span>{diagnostics.testResults.realtimeTables.join(', ')}</span>
          </div>
        )}
      </div>

      <div className="actions">
        <button onClick={runDiagnostics} className="refresh-btn">
          🔄 Ejecutar Diagnóstico
        </button>
      </div>

      <div className="instructions">
        <h3>📋 Interpretación de Resultados</h3>
        <ul>
          <li><strong>✅ Todo verde:</strong> WebSocket funcionando correctamente</li>
          <li><strong>❌ WebSocket falló:</strong> Tu Supabase self-hosted no tiene realtime habilitado</li>
          <li><strong>❌ Extensión no disponible:</strong> Tu servidor no tiene supabase_realtime instalado</li>
          <li><strong>❌ Configuración no configurada:</strong> Ejecuta el script SQL de configuración</li>
          <li><strong>✅ Si todo falla:</strong> La app funciona PERFECTAMENTE con carga manual</li>
        </ul>
        
        <div className="info-box">
          <h4>🎯 CONCLUSIÓN IMPORTANTE:</h4>
          <p>Si ves "Extensión no disponible", es NORMAL para Supabase self-hosted básico. 
          Tu aplicación funciona perfectamente sin WebSocket. Para una red social de vecindario, 
          la carga manual es más que suficiente.</p>
        </div>
      </div>
    </div>
  );
};

export default WebSocketDiagnostic;