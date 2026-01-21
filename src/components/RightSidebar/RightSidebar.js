import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useAuth } from '../../context/AuthContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import './RightSidebar.css';

// Función para calcular distancia usando la fórmula de Haversine
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distancia en km
};

// Formatear distancia para mostrar
const formatDistance = (km) => {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} KM`;
};

const RightSidebar = () => {
  const navigate = useNavigate();
  const { isRightSidebarCollapsed, toggleRightSidebar } = useSidebar();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [closeFriendsExpanded, setCloseFriendsExpanded] = useState(true);
  const [recentChatsExpanded, setRecentChatsExpanded] = useState(true);

  // Ubicación del usuario actual
  const userLat = user?.latitude || -33.2000;
  const userLon = user?.longitude || -70.6500;
  const currentUserName = user?.name || '';

  const closeFriends = [
    { id: 1, name: 'Carlos Mendoza', location: 'Chamisero, Colina', avatar: 'https://i.pravatar.cc/50?img=11', lat: -33.2000, lon: -70.6500 },
    { id: 2, name: 'Maria Elena Rodriguez', location: 'Chamisero, Colina', avatar: 'https://i.pravatar.cc/50?img=5', lat: -33.2010, lon: -70.6510 },
  ];

  const recentChats = [
    { id: 3, name: 'Josephin Water', location: 'Chamisero, Colina', avatar: 'https://i.pravatar.cc/50?img=8', lat: -33.2000, lon: -70.6500, online: true },
    { id: 4, name: 'Juan Pablo Torres', location: 'Chamisero, Colina', avatar: 'https://i.pravatar.cc/50?img=12', lat: -33.2020, lon: -70.6520, online: true },
    { id: 5, name: 'Ana Maria Fernandez', location: 'Chamisero, Colina', avatar: 'https://i.pravatar.cc/50?img=9', lat: -33.2030, lon: -70.6530, online: false },
    { id: 6, name: 'Roberto Carlos Gomez', location: 'Chicureo, Colina', avatar: 'https://i.pravatar.cc/50?img=13', lat: -33.2300, lon: -70.6800, online: false },
    { id: 7, name: 'Patricia Vasquez', location: 'Chamisero, Colina', avatar: 'https://i.pravatar.cc/50?img=10', lat: -33.2050, lon: -70.6550, online: false },
  ];

  // Calcular distancia para cada amigo
  const closeFriendsWithDistance = closeFriends.map(friend => ({
    ...friend,
    distance: calculateDistance(userLat, userLon, friend.lat, friend.lon)
  })).sort((a, b) => a.distance - b.distance);

  const recentChatsWithDistance = recentChats.map(chat => ({
    ...chat,
    distance: calculateDistance(userLat, userLon, chat.lat, chat.lon)
  })).sort((a, b) => a.distance - b.distance);

  const handleChatClick = (friend) => {
    navigate('/mensajes', { state: { selectedFriend: friend } });
  };

  const filteredCloseFriends = closeFriendsWithDistance.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecentChats = recentChatsWithDistance.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    chat.name !== currentUserName
  );

  return (
    <>
      <button 
        className={`collapse-toggle-btn ${isRightSidebarCollapsed ? 'collapsed' : ''}`}
        onClick={toggleRightSidebar}
        title={isRightSidebarCollapsed ? 'Expandir chat' : 'Ocultar chat'}
      >
        {isRightSidebarCollapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </button>

      <aside className={`right-sidebar ${isRightSidebarCollapsed ? 'collapsed' : ''}`}>
      {!isRightSidebarCollapsed && (
        <>
          <div className="sidebar-section">
        <div className="section-header">
          <h3>Vecinos</h3>
        </div>
        <p className="section-subtitle">Iniciar Nueva Conversación</p>
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Buscar vecinos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="friends-list">
          <div className="list-header">
            <h4>Vecinos Cercanos</h4>
            <button 
              className="toggle-btn" 
              onClick={() => setCloseFriendsExpanded(!closeFriendsExpanded)}
            >
              {closeFriendsExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </button>
          </div>
          {closeFriendsExpanded && filteredCloseFriends.map((friend) => (
            <div 
              key={friend.id} 
              className="friend-item"
              onClick={() => handleChatClick(friend)}
              style={{ cursor: 'pointer' }}
            >
              <img src={friend.avatar} alt={friend.name} />
              <div className="friend-info">
                <span className="friend-name">{friend.name}</span>
                <span className="friend-location">{friend.location} • {formatDistance(friend.distance)}</span>
              </div>
            </div>
          ))}
          {closeFriendsExpanded && filteredCloseFriends.length === 0 && (
            <p style={{ textAlign: 'center', color: '#65676b', padding: '10px', fontSize: '14px' }}>
              No se encontraron vecinos
            </p>
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="list-header">
          <h4>Chats Recientes</h4>
          <button 
            className="toggle-btn"
            onClick={() => setRecentChatsExpanded(!recentChatsExpanded)}
          >
            {recentChatsExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </button>
        </div>
        {recentChatsExpanded && filteredRecentChats.map((chat) => (
          <div 
            key={chat.id} 
            className="friend-item"
            onClick={() => handleChatClick(chat)}
            style={{ cursor: 'pointer' }}
          >
            <div className="avatar-wrapper">
              <img src={chat.avatar} alt={chat.name} />
              {chat.online && <span className="online-indicator"></span>}
            </div>
            <div className="friend-info">
              <span className="friend-name">{chat.name}</span>
              <span className="friend-location">{chat.location} • {formatDistance(chat.distance)}</span>
            </div>
          </div>
        ))}
        {recentChatsExpanded && filteredRecentChats.length === 0 && (
          <p style={{ textAlign: 'center', color: '#65676b', padding: '10px', fontSize: '14px' }}>
            No se encontraron chats
          </p>
        )}
      </div>
        </>
      )}
    </aside>
    </>
  );
};

export default RightSidebar;
