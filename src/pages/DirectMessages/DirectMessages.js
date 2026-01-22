import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessagesContext';
import { useConnections } from '../../context/ConnectionsContext';
import storageService from '../../services/storageService';
import ConversationList from '../../components/ConversationList/ConversationList';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import SearchIcon from '@mui/icons-material/Search';
import './DirectMessages.css';

const DirectMessages = () => {
  const { user } = useAuth();
  const { conversations, getUnreadCount } = useMessages();
  const { getAcceptedConnections } = useConnections();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    filterConversations();
    setLoading(false);
  }, [conversations, searchTerm]);

  const filterConversations = () => {
    let filtered = conversations.map(conv => {
      const otherUserId = conv.user1Id === user.id ? conv.user2Id : conv.user1Id;
      const otherUser = storageService.getUser(otherUserId);
      return { ...conv, otherUser };
    });

    if (searchTerm.trim()) {
      filtered = filtered.filter(conv =>
        conv.otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredConversations(filtered);
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const unreadCount = getUnreadCount(user.id);

  if (loading) {
    return (
      <div className="direct-messages-page">
        <div className="loading">Cargando mensajes...</div>
      </div>
    );
  }

  return (
    <div className="direct-messages-page">
      <div className="messages-container">
        <div className="conversations-panel">
          <div className="panel-header">
            <h2>Mensajes</h2>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>

          <div className="search-box">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Buscar conversación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <ConversationList
            conversations={filteredConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            currentUserId={user.id}
          />
        </div>

        <div className="chat-panel">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUserId={user.id}
            />
          ) : (
            <div className="no-conversation">
              <p>Selecciona una conversación para comenzar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMessages;
