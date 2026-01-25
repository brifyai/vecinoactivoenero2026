import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import useFirebaseMessages from '../../hooks/useFirebaseMessages';
import useFirebaseNotifications from '../../hooks/useFirebaseNotifications';
import './FirebaseTest.css';

const FirebaseTest = () => {
  const { user } = useSelector(state => state.auth);
  const [testMessage, setTestMessage] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [conversationId, setConversationId] = useState('');

  const {
    conversations,
    messagesByConversation,
    sendMessage,
    getOrCreateConversation,
    subscribeToMessages,
    unsubscribeFromMessages
  } = useFirebaseMessages(user?.id);

  const {
    notifications,
    unreadCount,
    fcmToken,
    initialized,
    createNotification,
    markNotificationAsRead,
    showLocalNotification
  } = useFirebaseNotifications(user?.id);

  const handleSendMessage = async () => {
    if (!testMessage.trim() || !recipientId.trim()) {
      alert('Por favor ingresa un mensaje y ID del destinatario');
      return;
    }

    try {
      let convId = conversationId;
      
      if (!convId) {
        // Crear o obtener conversación
        const conversation = await getOrCreateConversation(user.id, recipientId);
        convId = conversation.id;
        setConversationId(convId);
      }

      await sendMessage(convId, user.id, recipientId, testMessage);
      setTestMessage('');
      alert('Mensaje enviado exitosamente!');
    } catch (error) {
      alert('Error enviando mensaje: ' + error.message);
    }
  };

  const handleCreateNotification = async () => {
    try {
      const notification = await createNotification({
        userId: user.id,
        type: 'test',
        title: 'Notificación de prueba',
        message: 'Esta es una notificación de prueba desde Firebase',
        data: { url: '/app/feed' }
      });
      
      alert('Notificación creada: ' + notification.id);
    } catch (error) {
      alert('Error creando notificación: ' + error.message);
    }
  };

  const handleShowLocalNotification = () => {
    showLocalNotification('Notificación Local', {
      body: 'Esta es una notificación local de prueba',
      tag: 'test-notification'
    });
  };

  const handleSubscribeToConversation = () => {
    if (!conversationId.trim()) {
      alert('Por favor ingresa un ID de conversación');
      return;
    }

    subscribeToMessages(conversationId);
    alert('Suscrito a mensajes de la conversación: ' + conversationId);
  };

  const handleUnsubscribeFromConversation = () => {
    if (!conversationId.trim()) {
      alert('Por favor ingresa un ID de conversación');
      return;
    }

    unsubscribeFromMessages(conversationId);
    alert('Desuscrito de la conversación: ' + conversationId);
  };

  return (
    <div className="firebase-test">
      <h2>🔥 Firebase Test Dashboard</h2>
      
      {/* Estado de inicialización */}
      <div className="test-section">
        <h3>Estado de Inicialización</h3>
        <div className="status-grid">
          <div className={`status-item ${initialized ? 'success' : 'pending'}`}>
            <span>Notificaciones:</span>
            <span>{initialized ? '✅ Inicializado' : '⏳ Pendiente'}</span>
          </div>
          <div className={`status-item ${fcmToken ? 'success' : 'error'}`}>
            <span>FCM Token:</span>
            <span>{fcmToken ? '✅ Obtenido' : '❌ No disponible'}</span>
          </div>
          <div className={`status-item ${user ? 'success' : 'error'}`}>
            <span>Usuario:</span>
            <span>{user ? `✅ ${user.username}` : '❌ No autenticado'}</span>
          </div>
        </div>
      </div>

      {/* Test de Mensajería */}
      <div className="test-section">
        <h3>Test de Mensajería</h3>
        <div className="form-group">
          <label>ID del Destinatario:</label>
          <input
            type="text"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            placeholder="Ingresa el ID del usuario destinatario"
          />
        </div>
        <div className="form-group">
          <label>ID de Conversación (opcional):</label>
          <input
            type="text"
            value={conversationId}
            onChange={(e) => setConversationId(e.target.value)}
            placeholder="Se creará automáticamente si está vacío"
          />
        </div>
        <div className="form-group">
          <label>Mensaje:</label>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Escribe tu mensaje de prueba aquí..."
            rows="3"
          />
        </div>
        <div className="button-group">
          <button onClick={handleSendMessage} className="btn-primary">
            Enviar Mensaje
          </button>
          <button onClick={handleSubscribeToConversation} className="btn-secondary">
            Suscribirse a Conversación
          </button>
          <button onClick={handleUnsubscribeFromConversation} className="btn-secondary">
            Desuscribirse
          </button>
        </div>
      </div>

      {/* Test de Notificaciones */}
      <div className="test-section">
        <h3>Test de Notificaciones</h3>
        <div className="stats">
          <span>Notificaciones no leídas: <strong>{unreadCount}</strong></span>
        </div>
        <div className="button-group">
          <button onClick={handleCreateNotification} className="btn-primary">
            Crear Notificación Firebase
          </button>
          <button onClick={handleShowLocalNotification} className="btn-secondary">
            Mostrar Notificación Local
          </button>
        </div>
      </div>

      {/* Conversaciones */}
      <div className="test-section">
        <h3>Conversaciones ({conversations.length})</h3>
        <div className="conversations-list">
          {conversations.length === 0 ? (
            <p>No hay conversaciones disponibles</p>
          ) : (
            conversations.map(conv => (
              <div key={conv.id} className="conversation-item">
                <div>
                  <strong>ID:</strong> {conv.id}
                </div>
                <div>
                  <strong>Participantes:</strong> {conv.participants?.join(', ')}
                </div>
                <div>
                  <strong>Último mensaje:</strong> {conv.lastMessage || 'Sin mensajes'}
                </div>
                <button 
                  onClick={() => setConversationId(conv.id)}
                  className="btn-small"
                >
                  Seleccionar
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mensajes de la conversación seleccionada */}
      {conversationId && (
        <div className="test-section">
          <h3>Mensajes de Conversación: {conversationId}</h3>
          <div className="messages-list">
            {messagesByConversation[conversationId]?.length === 0 ? (
              <p>No hay mensajes en esta conversación</p>
            ) : (
              messagesByConversation[conversationId]?.map(message => (
                <div key={message.id} className="message-item">
                  <div className="message-header">
                    <strong>{message.senderId}</strong>
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="message-content">{message.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Notificaciones */}
      <div className="test-section">
        <h3>Notificaciones ({notifications.length})</h3>
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <p>No hay notificaciones disponibles</p>
          ) : (
            notifications.slice(0, 5).map(notification => (
              <div key={notification.id} className="notification-item">
                <div className="notification-header">
                  <strong>{notification.title || notification.type}</strong>
                  <span className={`status ${notification.read ? 'read' : 'unread'}`}>
                    {notification.read ? 'Leída' : 'No leída'}
                  </span>
                </div>
                <div className="notification-content">{notification.message}</div>
                <div className="notification-time">
                  {new Date(notification.timestamp).toLocaleString()}
                </div>
                {!notification.read && (
                  <button 
                    onClick={() => markNotificationAsRead(notification.id)}
                    className="btn-small"
                  >
                    Marcar como leída
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Token FCM */}
      {fcmToken && (
        <div className="test-section">
          <h3>FCM Token</h3>
          <div className="token-display">
            <textarea 
              readOnly 
              value={fcmToken} 
              rows="3"
              style={{ width: '100%', fontSize: '12px' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebaseTest;