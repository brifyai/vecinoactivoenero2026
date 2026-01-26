import React, { useState, useEffect, useRef } from 'react';
import { useReduxMessages } from '../../hooks/useReduxMessages';
import storageService from '../../services/storageService';
import SendIcon from '@mui/icons-material/Send';
import './ChatWindow.css';

const ChatWindow = ({ conversation, currentUserId }) => {
  const { sendMessage, getConversation, markConversationAsRead } = useReduxMessages();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const otherUserId = conversation.user1Id === currentUserId ? conversation.user2Id : conversation.user1Id;
  const otherUser = storageService.getUser(otherUserId);

  useEffect(() => {
    loadMessages();
    markConversationAsRead(currentUserId, otherUserId);
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    setLoading(true);
    const conv = getConversation(currentUserId, otherUserId);
    setMessages(conv);
    setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    const result = sendMessage(currentUserId, otherUserId, messageInput);

    if (result.success) {
      setMessageInput('');
      loadMessages();
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
