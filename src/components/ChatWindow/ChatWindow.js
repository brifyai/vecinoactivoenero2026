import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, setMessagesFromRealtime } from '../../store/slices/messagesSlice';
import firebaseMessagesService from '../../services/firebaseMessagesService';
import storageService from '../../services/storageService';
import SendIcon from '@mui/icons-material/Send';
import './ChatWindow.css';

const ChatWindow = ({ conversation, currentUserId }) => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);

  const otherUserId = conversation.user1Id === currentUserId ? conversation.user2Id : conversation.user1Id;
  const otherUser = storageService.getUser(otherUserId);

  // Suscribirse a mensajes en tiempo real con Firebase
  useEffect(() => {
    if (!conversation?.id) return;

    console.log('🔥 Suscribiéndose a mensajes en tiempo real para conversación:', conversation.id);
    setLoading(true);

    // Listener de Firebase para mensajes en tiempo real
    unsubscribeRef.current = firebaseMessagesService.subscribeToMessages(
      conversation.id,
      (realtimeMessages) => {
        console.log('💬 Mensajes actualizados en tiempo real:', realtimeMessages.length);
        setMessages(realtimeMessages);
        setLoading(false);
        
        // Actualizar Redux también
        dispatch(setMessagesFromRealtime({
          conversationId: conversation.id,
          messages: realtimeMessages
        }));
      }
    );

    // Marcar mensajes como leídos
    firebaseMessagesService.markAsRead(conversation.id, currentUserId);

    // Cleanup: desuscribirse cuando el componente se desmonte o cambie la conversación
    return () => {
      if (unsubscribeRef.current) {
        console.log('🔥 Desuscribiéndose de mensajes en tiempo real');
        unsubscribeRef.current();
      }
    };
  }, [conversation?.id, currentUserId, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    try {
      // Enviar mensaje a Firebase (se actualizará automáticamente via listener)
      await dispatch(sendMessage({
        conversationId: conversation.id,
        senderId: currentUserId,
        recipientId: otherUserId,
        content: messageInput.trim(),
        type: 'text'
      })).unwrap();

      setMessageInput('');
      console.log('✅ Mensaje enviado correctamente');
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      alert('Error al enviar el mensaje. Por favor intenta de nuevo.');
    }
  };

  if (loading) {
    return <div className="chat-window loading">Cargando...</div>;
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <img src={otherUser?.avatar} alt={otherUser?.name} className="chat-avatar" />
        <div className="chat-header-info">
          <h3>{otherUser?.name}</h3>
          <p className="chat-status">Activo ahora</p>
        </div>
      </div>

      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No hay mensajes aún. ¡Comienza la conversación!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`message ${msg.senderId === currentUserId ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{msg.content}</p>
                <span className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="message-input"
        />
        <button type="submit" className="send-btn" disabled={!messageInput.trim()}>
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
