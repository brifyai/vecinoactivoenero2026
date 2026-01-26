import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../store/selectors/authSelectors';
import { selectMessages, selectMessagesLoading, selectMessagesError } from '../../store/selectors/messagesSelectors';
import { loadConversations, sendMessage } from '../../store/slices/messagesSlice';
import { useHybridRealtimeContext } from '../../components/HybridRealtimeProvider/HybridRealtimeProvider';
import { useReduxMessages } from '../../hooks/useReduxMessages';
import { useReduxConnections } from '../../hooks/useReduxConnections';
import storageService from '../../services/storageService';
import ConversationList from '../../components/ConversationList/ConversationList';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import SearchIcon from '@mui/icons-material/Search';
import './DirectMessages.css';

const DirectMessages = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const messages = useSelector(selectMessages);
  const messagesLoading = useSelector(selectMessagesLoading);
  const messagesError = useSelector(selectMessagesError);
  
  // Contextos existentes (para compatibilidad)
  const { conversations, getUnreadCount } = useReduxMessages();
  const { getAcceptedConnections } = useReduxConnections();
  
  // Sistema híbrido
  const hybridRealtime = useHybridRealtimeContext();
  
  // Estados locales
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar conversaciones iniciales
  useEffect(() => {
    if (user?.id) {
      dispatch(loadConversations({ userId: user.id }));
    }
  }, [dispatch, user?.id]);

  // Escuchar actualizaciones híbridas de mensajes
  useEffect(() => {
    const handleHybridMessagesUpdate = (event) => {
      console.log('💬 Mensajes actualizados desde sistema híbrido:', event.detail);
      
      // Recargar conversaciones cuando hay actualizaciones híbridas
      if (user?.id) {
        dispatch(loadConversations({ userId: user.id }));
      }
    };

    // Escuchar eventos del sistema híbrido
    window.addEventListener('hybridMessagesUpdate', handleHybridMessagesUpdate);
    
    return () => {
      window.removeEventListener('hybridMessagesUpdate', handleHybridMessagesUpdate);
    };
  }, [dispatch, user?.id]);

  useEffect(() => {
    filterConversations();
    setLoading(messagesLoading);
  }, [conversations, messages, searchTerm, messagesLoading]);

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

  // Manejar envío de mensaje con sincronización híbrida
  const handleSendMessage = async (messageData) => {
    try {
      const result = await dispatch(sendMessage({
        ...messageData,
        senderId: user.id,
        conversationId: selectedConversation.id
      })).unwrap();
      
      // Sincronizar con sistema híbrido
      if (hybridRealtime.isConnected) {
        await hybridRealtime.syncMessage(result);
        console.log('💬 Mensaje sincronizado al sistema híbrido');
      }
      
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  const unreadCount = getUnreadCount(user.id);

  if (loading) {
    return (
      <div className="direct-messages-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  if (messagesError) {
    return (
      <div className="direct-messages-page">
        <div className="error-message">
          <p>Error cargando mensajes: {messagesError}</p>
          <button onClick={() => dispatch(loadConversations({ userId: user.id }))}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="direct-messages-page">
      <div className="messages-container">
        <div className="conversations-panel">
          <div className="panel-header">
            <h2>Mensajes</h2>
            <div className="header-indicators">
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
              )}
              {hybridRealtime.isConnected && (
                <div className="realtime-indicator">
                  <span className="realtime-dot"></span>
                  <span className="realtime-text">Tiempo real</span>
                </div>
              )}
            </div>
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
              onSendMessage={handleSendMessage}
              hybridRealtime={hybridRealtime}
            />
          ) : (
            <div className="no-conversation">
              <div className="no-conversation-content">
                <h3>Selecciona una conversación</h3>
                <p>Elige una conversación de la lista para comenzar a chatear</p>
                {hybridRealtime.isConnected && (
                  <div className="realtime-status">
                    <span className="realtime-dot"></span>
                    Mensajes en tiempo real activos
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMessages;
