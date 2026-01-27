import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../store/selectors/authSelectors';
import { setConversationsFromRealtime } from '../../store/slices/messagesSlice';
import firebaseMessagesService from '../../services/firebaseMessagesService';
import storageService from '../../services/storageService';
import ConversationList from '../../components/ConversationList/ConversationList';
import ChatWindow from '../../components/ChatWindow/ChatWindow';
import SearchIcon from '@mui/icons-material/Search';
import './DirectMessages.css';

const DirectMessages = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  
  // Estados locales
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const unsubscribeRef = useRef(null);

  // Suscribirse a conversaciones en tiempo real con Firebase
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔥 Suscribiéndose a conversaciones en tiempo real para usuario:', user.id);
    setLoading(true);

    // Listener de Firebase para conversaciones en tiempo real
    unsubscribeRef.current = firebaseMessagesService.subscribeToConversations(
      user.id,
      (realtimeConversations) => {
        console.log('💬 Conversaciones actualizadas en tiempo real:', realtimeConversations.length);
        
        // Enriquecer conversaciones con datos de usuarios
        const enrichedConversations = realtimeConversations.map((conv) => {
          const participants = conv.participants || [];
          const otherUserId = participants.find(id => id !== user.id);
          
          if (otherUserId) {
            const otherUser = storageService.getUser(otherUserId) || {
              id: otherUserId,
              name: 'Usuario',
              avatar: '/default-avatar.png'
            };
            
            return {
              ...conv,
              user1Id: participants[0],
              user2Id: participants[1],
              otherUser
            };
          }
          return conv;
        });

        setConversations(enrichedConversations);
        setLoading(false);
        
        // Actualizar Redux también
        dispatch(setConversationsFromRealtime(enrichedConversations));
        
        // Calcular mensajes no leídos
        const unread = enrichedConversations.reduce((total, conv) => {
          const userDetails = conv.participantDetails?.[user.id];
          return total + (userDetails?.unreadCount || 0);
        }, 0);
        setUnreadCount(unread);
      }
    );

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      if (unsubscribeRef.current) {
        console.log('🔥 Desuscribiéndose de conversaciones en tiempo real');
        unsubscribeRef.current();
      }
    };
  }, [user?.id, dispatch]);

  useEffect(() => {
    filterConversations();
  }, [conversations, searchTerm]);

  const filterConversations = () => {
    let filtered = [...conversations];

    if (searchTerm.trim()) {
      filtered = filtered.filter(conv =>
        conv.otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar por última actividad
    filtered.sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime) : new Date(0);
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime) : new Date(0);
      return timeB - timeA;
    });

    setFilteredConversations(filtered);
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  if (loading) {
    return (
      <div className="direct-messages-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando mensajes en tiempo real...</p>
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
              <div className="realtime-indicator">
                <span className="realtime-dot"></span>
                <span className="realtime-text">Tiempo real activo</span>
              </div>
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

          {filteredConversations.length === 0 && !loading ? (
            <div className="no-conversations">
              <p>No hay conversaciones</p>
              <small>Envía un mensaje a un vecino para comenzar</small>
            </div>
          ) : (
            <ConversationList
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              currentUserId={user.id}
            />
          )}
        </div>

        <div className="chat-panel">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              currentUserId={user.id}
            />
          ) : (
            <div className="no-conversation">
              <div className="no-conversation-content">
                <h3>Selecciona una conversación</h3>
                <p>Elige una conversación de la lista para comenzar a chatear</p>
                <div className="realtime-status">
                  <span className="realtime-dot"></span>
                  Mensajes en tiempo real con Firebase
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectMessages;