import React, { useState, useEffect } from 'react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import './FriendSuggestions.css';

// Función para calcular distancia entre dos puntos (haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const FriendSuggestions = ({ maxDistance = 5, limit = 5 }) => {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.latitude || !user.longitude) {
      setLoading(false);
      return;
    }

    // Cargar usuarios y filtrar por distancia
    const loadSuggestions = () => {
      const allUsers = JSON.parse(localStorage.getItem('friendbook_users') || '[]');
      const currentUserId = user.id;

      // Filtrar usuarios que no son el actual y calcular distancia
      const nearbyUsers = allUsers
        .filter(u => u.id !== currentUserId && u.latitude && u.longitude)
        .map(u => ({
          ...u,
          distance: calculateDistance(
            user.latitude, user.longitude,
            u.latitude, u.longitude
          )
        }))
        .filter(u => u.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit);

      setSuggestions(nearbyUsers);
      setLoading(false);
    };

    loadSuggestions();
  }, [user, maxDistance, limit]);

  const handleAddFriend = (userId) => {
    // Agregar amistad
    const friends = JSON.parse(localStorage.getItem('friendbook_friends') || '{}');
    if (!friends[user.id]) friends[user.id] = [];
    if (!friends[user.id].includes(userId)) {
      friends[user.id].push(userId);
      localStorage.setItem('friendbook_friends', JSON.stringify(friends));
    }

    // Eliminar de sugerencias
    setSuggestions(suggestions.filter(s => s.id !== userId));
  };

  const handleDismiss = (userId) => {
    setSuggestions(suggestions.filter(s => s.id !== userId));
  };

  if (loading) {
    return (
      <div className="friend-suggestions loading">
        <div className="suggestions-loader"></div>
        <p>Buscando vecinos cerca de ti...</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="friend-suggestions empty">
        <PersonAddIcon className="empty-icon" />
        <h4>No hay vecinos cerca</h4>
        <p>No se encontraron vecinos dentro de {maxDistance}km de distancia.</p>
        <p className="tip">💡 Ajusta tu distancia máxima en la configuración para ver más vecinos.</p>
      </div>
    );
  }

  return (
    <div className="friend-suggestions">
      <div className="suggestions-header">
        <PersonAddIcon className="header-icon" />
        <h3>Vecinos Cerca de Ti</h3>
        <span className="suggestions-count">{suggestions.length}</span>
      </div>

      <div className="suggestions-list">
        {suggestions.map(suggestion => (
          <div key={suggestion.id} className="suggestion-card">
            <div className="suggestion-avatar">
              <img src={suggestion.avatar} alt={suggestion.name} />
              <span className="distance-badge">
                {suggestion.distance.toFixed(1)} km
              </span>
            </div>
            
            <div className="suggestion-info">
              <h4>{suggestion.name}</h4>
              <p className="suggestion-username">@{suggestion.username}</p>
              {suggestion.neighborhoodName && (
                <p className="suggestion-neighborhood">
                  📍 {suggestion.neighborhoodName}
                </p>
              )}
            </div>

            <div className="suggestion-actions">
              <button 
                className="btn-add"
                onClick={() => handleAddFriend(suggestion.id)}
                title="Agregar como amigo"
              >
                <PersonAddIcon />
              </button>
              <button 
                className="btn-dismiss"
                onClick={() => handleDismiss(suggestion.id)}
                title="Omitir"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="suggestions-footer">
        <p>Mostrando vecinos dentro de {maxDistance}km</p>
      </div>
    </div>
  );
};

export default FriendSuggestions;