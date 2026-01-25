// =====================================================
// INDICADOR DE ESTADO REAL-TIME
// Muestra el estado del polling y permite testing
// =====================================================

import React, { useState } from 'react';
import { useReduxPosts } from '../../hooks/useReduxPosts';
import { useReduxNotifications } from '../../hooks/useReduxNotifications';
import { supabase } from '../../config/supabase';
import './RealtimeStatusIndicator.css';

const RealtimeStatusIndicator = ({ showDetails = false }) => {
  const { loading: postsLoading } = useReduxPosts();
  const { loading: notificationsLoading } = useReduxNotifications();
  
  // Mock polling status for compatibility
  const postsStatus = { isPolling: false, error: null, interval: 0 };
  const notificationsStatus = { isPolling: false, error: null, interval: 0 };
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);

  const createTestPost = async () => {
    setIsCreatingTest(true);
    try {
      // Obtener un usuario de prueba
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (users && users.length > 0) {
        const { error } = await supabase
          .from('posts')
          .insert([{
            author_id: users[0].id,
            content: `🔄 TEST POLLING - ${new Date().toLocaleTimeString()} - Si ves esto sin recargar, ¡el polling funciona!`,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        console.log('✅ Post de prueba creado para testing de polling');
      }
    } catch (error) {
      console.error('❌ Error creando post de prueba:', error.message);
    } finally {
      setIsCreatingTest(false);
    }
  };

  const createTestNotification = async () => {
    setIsCreatingTest(true);
    try {
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (users && users.length > 0) {
        const { error } = await supabase
          .from('notifications')
          .insert([{
            user_id: users[0].id,
            type: 'test',
            message: `🔔 Notificación de prueba - ${new Date().toLocaleTimeString()}`,
            read: false
          }]);

        if (error) throw error;
        console.log('✅ Notificación de prueba creada');
      }
    } catch (error) {
      console.error('❌ Error creando notificación:', error.message);
    } finally {
      setIsCreatingTest(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status.isPolling) return '#6b7280'; // gray
    if (status.error) return '#ef4444'; // red
    return '#10b981'; // green
  };

  const getStatusText = (status, type) => {
    if (!status.isPolling) return `${type} polling deshabilitado`;
    if (status.error) return `${type} error: ${status.error}`;
    return `${type} polling activo (${status.interval / 1000}s)`;
  };

  return (
    <div className="realtime-status-indicator">
      <div className="status-summary">
        <div className="status-dots">
          <div 
            className="status-dot"
            style={{ backgroundColor: getStatusColor(postsStatus) }}
            title={getStatusText(postsStatus, 'Posts')}
          />
          <div 
            className="status-dot"
            style={{ backgroundColor: getStatusColor(notificationsStatus) }}
            title={getStatusText(notificationsStatus, 'Notificaciones')}
          />
        </div>
        
        <span className="status-label">Real-time</span>
        
        {showDetails && (
          <button 
            className="test-toggle"
            onClick={() => setShowTestPanel(!showTestPanel)}
          >
            Test
          </button>
        )}
      </div>

      {showDetails && showTestPanel && (
        <div className="test-panel">
          <div className="test-header">
            <h4>🧪 Panel de Pruebas Real-time</h4>
            <p>Crea datos de prueba para verificar que el polling funciona</p>
          </div>
          
          <div className="test-controls">
            <button 
              onClick={createTestPost}
              disabled={isCreatingTest}
              className="test-btn primary"
            >
              {isCreatingTest ? '⏳ Creando...' : '📝 Crear Post de Prueba'}
            </button>
            
            <button 
              onClick={createTestNotification}
              disabled={isCreatingTest}
              className="test-btn secondary"
            >
              {isCreatingTest ? '⏳ Creando...' : '🔔 Crear Notificación'}
            </button>
          </div>
          
          <div className="test-status">
            <div className="status-item">
              <span className="status-label">Posts:</span>
              <span className="status-value">{getStatusText(postsStatus, '')}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Notificaciones:</span>
              <span className="status-value">{getStatusText(notificationsStatus, '')}</span>
            </div>
          </div>
          
          <div className="test-info">
            <p>💡 <strong>Cómo probar:</strong></p>
            <ol>
              <li>Crea un post o notificación de prueba</li>
              <li>Observa que aparece automáticamente sin recargar</li>
              <li>Revisa la consola para ver los logs de eventos</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeStatusIndicator;