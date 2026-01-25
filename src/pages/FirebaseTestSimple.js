import React, { useState, useEffect } from 'react';
import { getFCMToken, onForegroundMessage } from '../config/firebase';

const FirebaseTestSimple = () => {
  const [fcmToken, setFcmToken] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log('🚀 Inicializando Firebase Test Simple...');
        
        // Obtener FCM Token
        const token = await getFCMToken();
        setFcmToken(token);
        
        // Configurar listener para mensajes en foreground
        const unsubscribe = onForegroundMessage((payload) => {
          console.log('📨 Mensaje recibido en foreground:', payload);
        });
        
        setInitialized(true);
        console.log('✅ Firebase Test Simple inicializado');
        
        return unsubscribe;
      } catch (error) {
        console.error('❌ Error inicializando Firebase:', error);
        setError(error.message);
      }
    };

    initializeFirebase();
  }, []);

  const handleTestNotification = () => {
    if ('Notification' in window) {
      new Notification('Test Notification', {
        body: 'Esta es una notificación de prueba',
        icon: '/favicon.ico'
      });
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔥 Firebase Test Simple</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Estado de Inicialización</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ 
            padding: '10px', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            backgroundColor: initialized ? '#d4edda' : '#f8d7da'
          }}>
            <strong>Firebase:</strong> {initialized ? '✅ Inicializado' : '⏳ Inicializando...'}
          </div>
          
          <div style={{ 
            padding: '10px', 
            border: '1px solid #ccc', 
            borderRadius: '4px',
            backgroundColor: fcmToken ? '#d4edda' : '#f8d7da'
          }}>
            <strong>FCM Token:</strong> {fcmToken ? '✅ Obtenido' : '❌ No disponible'}
          </div>
          
          {error && (
            <div style={{ 
              padding: '10px', 
              border: '1px solid #dc3545', 
              borderRadius: '4px',
              backgroundColor: '#f8d7da',
              color: '#721c24'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Pruebas</h3>
        <button 
          onClick={handleTestNotification}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🔔 Test Notificación Local
        </button>
      </div>

      {fcmToken && (
        <div style={{ marginTop: '20px' }}>
          <h3>FCM Token</h3>
          <textarea 
            readOnly 
            value={fcmToken} 
            rows="4"
            style={{ 
              width: '100%', 
              fontSize: '12px',
              fontFamily: 'monospace',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <p style={{ fontSize: '12px', color: '#666' }}>
            Este token se puede usar para enviar notificaciones push a este dispositivo.
          </p>
        </div>
      )}
    </div>
  );
};

export default FirebaseTestSimple;