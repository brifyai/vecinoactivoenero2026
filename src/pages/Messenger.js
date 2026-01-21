import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useFriends } from '../context/FriendsContext';
import { useSidebar } from '../context/SidebarContext';
import { showSuccessToast } from '../utils/sweetalert';
import EmojiPicker from '../components/EmojiPicker/EmojiPicker';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CallIcon from '@mui/icons-material/Call';
import VideocamIcon from '@mui/icons-material/Videocam';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import PushPinIcon from '@mui/icons-material/PushPin';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import './Messenger.css';

const Messenger = () => {
  // Messenger actualizado - sin icono de búsqueda
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { conversations, activeConversation, setActiveConversation, sendMessage, getMessages, markAsRead, createConversation } = useChat();
  const { friends } = useFriends();
  const { isRightSidebarCollapsed } = useSidebar();
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef(null);

  // Manejar amigo seleccionado desde la navegación
  useEffect(() => {
    const selectedFriend = location.state?.selectedFriend;
    if (selectedFriend) {
      // Buscar si ya existe una conversación con este usuario
      const existingConv = conversations.find(conv =>
        conv.participants.includes(selectedFriend.id)
      );
      
      if (existingConv) {
        setActiveConversation(existingConv);
      } else {
        // Crear nueva conversación
        const newConv = createConversation(selectedFriend.id);
        if (newConv) {
          setActiveConversation(newConv);
        }
      }
      
      // Limpiar el state para que no se reprocese
      if (location.state?.selectedFriend) {
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, conversations, createConversation, navigate, location.pathname]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Opciones del menú de mensajes
  const messageOptions = [
    { icon: <SearchIcon />, label: 'Buscar en conversaciones', action: () => { showSuccessToast('Búsqueda activada'); setShowOptionsMenu(false); } },
    { icon: <PushPinIcon />, label: 'Fijar conversación', action: () => { showSuccessToast('Conversación fijada'); setShowOptionsMenu(false); } },
    { icon: <VolumeOffIcon />, label: 'Silenciar notificaciones', action: () => { showSuccessToast('Notificaciones silenciadas'); setShowOptionsMenu(false); } },
    { icon: <ArchiveIcon />, label: 'Archivar conversación', action: () => { showSuccessToast('Conversación archivada'); setShowOptionsMenu(false); } },
    { icon: <MarkEmailUnreadIcon />, label: 'Marcar como no leída', action: () => { showSuccessToast('Marcada como no leída'); setShowOptionsMenu(false); } },
    { icon: <DeleteIcon />, label: 'Eliminar conversación', action: () => { showSuccessToast('Conversación eliminada'); setShowOptionsMenu(false); } },
  ];

  useEffect(() => {
    if (activeConversation) {
      const convMessages = getMessages(activeConversation.id);
      setMessages(convMessages);
      markAsRead(activeConversation.id);
    }
  }, [activeConversation]);

  const getConversationUser = (conv) => {
    const otherUserId = conv.participants.find(id => id !== user.id);
    // Usar friendbook_users que es la clave correcta donde se guardan los usuarios
    const allUsers = JSON.parse(localStorage.getItem('friendbook_users') || '[]');
    const otherUser = allUsers.find(u => u.id === otherUserId);
    return otherUser || friends.find(f => f.id === otherUserId) || { name: 'Usuario', avatar: 'https://i.pravatar.cc/50' };
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Justo ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('es');
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConversation) return;
    
    sendMessage(activeConversation.id, messageText);
    setMessageText('');
    
    // Actualizar mensajes
    const updatedMessages = getMessages(activeConversation.id);
    setMessages(updatedMessages);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessageText(messageText + emoji);
  };

  const filteredConversations = conversations.filter(conv => {
    const convUser = getConversationUser(conv);
    return convUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className={`messenger-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="messenger-sidebar">
        <div className="messenger-header">
          <h2>Mensajes</h2>
          <div className="options-menu-container" ref={optionsMenuRef}>
            <button className="icon-btn" onClick={() => setShowOptionsMenu(!showOptionsMenu)}>
              <MoreHorizIcon />
            </button>
            {showOptionsMenu && (
              <div className="options-menu">
                {messageOptions.map((option, index) => (
                  <button key={index} className="options-menu-item" onClick={option.action}>
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="messenger-search">
          <input
            type="text"
            placeholder="Buscar vecinos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="conversations-list">
          {filteredConversations.length === 0 ? (
            <div className="no-conversations">
              <div className="no-conversations-icon">💬</div>
              <h3>No hay conversaciones</h3>
              <p>Inicia un chat con tus vecinos para comenzar</p>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const convUser = getConversationUser(conv);
              const unreadCount = conv.messages.filter(m => m.senderId !== user.id && !m.read).length;
              
              return (
                <div
                  key={conv.id}
                  className={`conversation-item ${activeConversation?.id === conv.id ? 'active' : ''}`}
                  onClick={() => setActiveConversation(conv)}
                >
                  <div className="conv-avatar-wrapper">
                    <img src={convUser.avatar} alt={convUser.name} />
                    <span className="online-dot"></span>
                  </div>
                  <div className="conv-info">
                    <div className="conv-header">
                      <h4>{convUser.name}</h4>
                      <span className="conv-time">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <div className="conv-preview">
                      <p>{conv.lastMessage || 'Nueva conversación'}</p>
                      {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="messenger-main">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar-wrapper">
                  <img src={getConversationUser(activeConversation).avatar} alt={getConversationUser(activeConversation).name} />
                  <span className="online-dot"></span>
                </div>
                <div>
                  <h3>{getConversationUser(activeConversation).name}</h3>
                  <span className="user-status">Activo ahora</span>
                </div>
              </div>
              <div className="chat-actions">
                <button className="icon-btn" onClick={() => showSuccessToast('Llamada de voz iniciada')}>
                  <CallIcon />
                </button>
                <button className="icon-btn" onClick={() => showSuccessToast('Videollamada iniciada')}>
                  <VideocamIcon />
                </button>
                <button className="icon-btn" onClick={() => showSuccessToast('Información del chat')}>
                  <InfoIcon />
                </button>
              </div>
            </div>

            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`message ${msg.senderId === user.id ? 'me' : 'them'}`}>
                  {msg.senderId !== user.id && (
                    <img src={getConversationUser(activeConversation).avatar} alt="" className="message-avatar" />
                  )}
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  {msg.senderId === user.id && (
                    <img src={user?.avatar} alt="" className="message-avatar" />
                  )}
                </div>
              ))}
            </div>

            <div className="chat-input-container">
              <button className="icon-btn"><PhotoLibraryIcon /></button>
              <button className="icon-btn"><AttachFileIcon /></button>
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <SendIcon />
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-icon">💬</div>
            <h3>Selecciona una conversación</h3>
            <p>Elige una conversación de la lista para comenzar a chatear</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;
