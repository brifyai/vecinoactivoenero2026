import React from 'react';
import './ConversationList.css';

const ConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  currentUserId
}) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getPreview = (message) => {
    if (!message) return 'Sin mensajes';
    const prefix = message.senderId === currentUserId ? 'Tú: ' : '';
    return prefix + message.content.substring(0, 40) + (message.content.length > 40 ? '...' : '');
  };

  if (conversations.length === 0) {
    return (
      <div className="conversation-list empty">
        <p>No hay conversaciones</p>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      {conversations.map(conv => (
        <div
          key={conv.id}
          className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
          onClick={() => onSelectConversation(conv)}
        >
          <img
            src={conv.otherUser?.avatar}
            alt={conv.otherUser?.name}
            className="conversation-avatar"
          />
          <div className="conversation-info">
            <h4 className="conversation-name">{conv.otherUser?.name}</h4>
            <p className="conversation-preview">{getPreview(conv.lastMessage)}</p>
          </div>
          <div className="conversation-meta">
            <span className="conversation-time">
              {formatTime(conv.lastMessage?.timestamp)}
            </span>
            {!conv.lastMessage?.read && conv.lastMessage?.recipientId === currentUserId && (
              <div className="unread-dot" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
