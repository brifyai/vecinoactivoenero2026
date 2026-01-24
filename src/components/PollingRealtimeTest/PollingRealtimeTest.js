// =====================================================
// COMPONENTE DE PRUEBA PARA POLLING REAL-TIME
// Demuestra el funcionamiento de la alternativa
// =====================================================

import React, { useState } from 'react';
import { usePollingPosts, usePollingNotifications } from '../../hooks/usePollingRealtime';
import { supabase } from '../../config/supabase';
import './PollingRealtimeTest.css';

const PollingRealtimeTest = () => {
  const [testMessage, setTestMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Usar hooks de polling
  const { data: posts, loading: postsLoading, error: postsError } = usePollingPosts();
  const { data: notifications, loading: notificationsLoading, error: notificationsError } = usePollingNotifications();

  // Función para crear post de prueba
  const createTestPost = async () => {
    setIsCreating(true);
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
            content: testMessage || `🔄 TEST POLLING - ${new Date().toLocaleTimeString()} - Si ves esto sin recargar, ¡el polling funciona!`,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        
        setTestMessage('');
        console.log('✅ Post de prueba creado');
      }
    } catch (error) {
      console.error('❌ Error creando post:', error.message);
    } finally {
      setIsCreating(false);
    }
  };

  // Función para crear notificación de prueba
  const createTestNotification = async () => {
    setIsCreating(true);
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
      setIsCreating(false);
    }
  };

  return (
    <div className="polling-realtime-test">
      <div className="test-header">
        <h2>🔄 Test de Polling Real-time</h2>
        <p>Esta es una alternativa funcional a WebSockets para tu instancia self-hosted</p>
      </div>

      <div className="test-controls">
        <div className="input-group">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Mensaje personalizado (opcional)"
            className="test-input"
          />
        </div>
        
        <div className="button-group">
          <button 
            onClick={createTestPost}
            disabled={isCreating}
            className="test-button primary"
          >
            {isCreating ? '⏳ Creando...' : '📝 Crear Post de Prueba'}
          </button>
          
          <button 
            onClick={createTestNotification}
            disabled={isCreating}
            className="test-button secondary"
          >
            {isCreating ? '⏳ Creando...' : '🔔 Crear Notificación'}
          </button>
        </div>
      </div>

      <div className="test-results">
        <div className="result-section">
          <h3>📝 Posts Recientes (Polling cada 3s)</h3>
          {postsLoading && <p className="loading">⏳ Cargando posts...</p>}
          {postsError && <p className="error">❌ Error: {postsError}</p>}
          
          <div className="items-list">
            {posts.slice(0, 5).map(post => (
              <div key={post.id} className="item">
                <div className="item-content">
                  {post.content?.substring(0, 100)}
                  {post.content?.length > 100 && '...'}
                </div>
                <div className="item-meta">
                  {new Date(post.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {posts.length === 0 && !postsLoading && (
              <p className="empty">No hay posts. Crea uno para probar el polling.</p>
            )}
          </div>
        </div>

        <div className="result-section">
          <h3>🔔 Notificaciones Recientes (Polling cada 2s)</h3>
          {notificationsLoading && <p className="loading">⏳ Cargando notificaciones...</p>}
          {notificationsError && <p className="error">❌ Error: {notificationsError}</p>}
          
          <div className="items-list">
            {notifications.slice(0, 5).map(notification => (
              <div key={notification.id} className="item">
                <div className="item-content">
                  {notification.message?.substring(0, 100)}
                  {notification.message?.length > 100 && '...'}
                </div>
                <div className="item-meta">
                  {new Date(notification.created_at).toLocaleTimeString()}
                  {!notification.read && <span className="unread">●</span>}
                </div>
              </div>
            ))}
            {notifications.length === 0 && !notificationsLoading && (
              <p className="empty">No hay notificaciones. Crea una para probar el polling.</p>
            )}
          </div>
        </div>
      </div>

      <div className="test-info">
        <h4>ℹ️ Cómo funciona:</h4>
        <ul>
          <li>✅ <strong>Posts</strong>: Se actualizan cada 3 segundos</li>
          <li>✅ <strong>Notificaciones</strong>: Se actualizan cada 2 segundos</li>
          <li>✅ <strong>Detección automática</strong>: INSERT, UPDATE, DELETE</li>
          <li>✅ <strong>Eventos en consola</strong>: Abre DevTools para ver logs</li>
          <li>⚠️ <strong>Limitación</strong>: No es real-time instantáneo (2-3s latencia)</li>
        </ul>
        
        <div className="status-indicator">
          <span className="status-dot active"></span>
          <span>Polling activo - Alternativa funcional a WebSockets</span>
        </div>
      </div>
    </div>
  );
};

export default PollingRealtimeTest;