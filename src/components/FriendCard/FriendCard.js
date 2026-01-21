import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../../utils/formatNumber';
import './FriendCard.css';

// Formatear distancia para mostrar
const formatDistance = (km) => {
  if (km === undefined || km === null) return '';
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} KM`;
};

const FriendCard = ({ friend }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    // Convert name to username slug and navigate to profile
    const username = friend.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/${username}`);
  };

  return (
    <div className="friend-card">
      <div className="friend-avatar-container">
        <img src={friend.avatar} alt={friend.name} />
        {friend.verified && <span className="verified-badge">✓</span>}
      </div>
      
      <h3>{friend.name}</h3>
      
      {/* Mostrar ubicación y distancia juntos */}
      <div className="friend-location-row">
        <span className="friend-location">{friend.neighborhood}, {friend.city}</span>
        {friend.distance !== undefined && (
          <>
            <span className="location-separator">•</span>
            <span className="friend-distance">{formatDistance(friend.distance)}</span>
          </>
        )}
      </div>
      
      <div className="friend-stats">
        <div className="friend-stat">
          <span className="stat-number">{formatNumber(friend.following)}</span>
          <span className="stat-label">Siguiendo</span>
        </div>
        <div className="friend-stat">
          <span className="stat-number">{formatNumber(friend.likes)}</span>
          <span className="stat-label">Me Gusta</span>
        </div>
        <div className="friend-stat">
          <span className="stat-number">{formatNumber(friend.followers)}</span>
          <span className="stat-label">Seguidores</span>
        </div>
      </div>
      
      <button className="view-profile-btn" onClick={handleViewProfile}>Ver Perfil</button>
    </div>
  );
};

export default FriendCard;
