import React, { useState, useEffect } from 'react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useConnections } from '../../context/ConnectionsContext';
import { useNeighborhoods } from '../../context/NeighborhoodsContext';
import storageService from '../../services/storageService';
import geolocationService from '../../services/geolocationService';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './DiscoverNeighbors.css';

const DiscoverNeighbors = () => {
  const { user } = useAuth();
  const { sendConnectionRequest, getConnectionStatus, getAcceptedConnections } = useConnections();
  const { calculateDistance } = useNeighborhoods();
  const [neighbors, setNeighbors] = useState([]);
  const [filteredNeighbors, setFilteredNeighbors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterest, setSelectedInterest] = useState('all');
  const [connectionStatuses, setConnectionStatuses] = useState({});

  useEffect(() => {
    loadNeighbors();
  }, [user]);

  useEffect(() => {
    filterNeighbors();
  }, [neighbors, selectedInterest]);

  const loadNeighbors = () => {
    setLoading(true);
    try {
      const allUsers = storageService.getUsers();
      const acceptedConnections = getAcceptedConnections(user.id);
      const connectedUserIds = acceptedConnections.map(c =>
        c.user1Id === user.id ? c.user2Id : c.user1Id
      );

      // Filtrar vecinos del mismo vecindario, excluyendo al usuario actual y conexiones existentes
      const neighborList = allUsers.filter(u =>
        u.id !== user.id &&
        u.neighborhoodId === user.neighborhoodId &&
        !connectedUserIds.includes(u.id)
      );

      // Ordenar por proximidad
      const sortedNeighbors = neighborList.sort((a, b) => {
        const distA = calculateDistance(
          user.latitude,
          user.longitude,
          a.latitude,
          a.longitude
        );
        const distB = calculateDistance(
          user.latitude,
          user.longitude,
          b.latitude,
          b.longitude
        );
        return distA - distB;
      });

      setNeighbors(sortedNeighbors);

      // Cargar estados de conexión
      const statuses = {};
      sortedNeighbors.forEach(neighbor => {
        statuses[neighbor.id] = getConnectionStatus(user.id, neighbor.id);
      });
      setConnectionStatuses(statuses);
    } catch (error) {
      console.error('Error loading neighbors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNeighbors = () => {
    if (selectedInterest === 'all') {
      setFilteredNeighbors(neighbors);
    } else {
      setFilteredNeighbors(
        neighbors.filter(n =>
          n.interests && n.interests.includes(selectedInterest)
        )
      );
    }
  };

  const handleSendRequest = (neighborId) => {
    const result = sendConnectionRequest(user.id, neighborId);
    if (result.success) {
      setConnectionStatuses(prev => ({
        ...prev,
        [neighborId]: 'pending'
      }));
    }
  };

  const getDistance = (neighbor) => {
    const distance = calculateDistance(
      user.latitude,
      user.longitude,
      neighbor.latitude,
      neighbor.longitude
    );
    return distance < 1000
      ? `${Math.round(distance)}m`
      : `${(distance / 1000).toFixed(1)}km`;
  };

  const getInterests = () => {
    const allInterests = new Set();
    neighbors.forEach(n => {
      if (n.interests) {
        n.interests.forEach(i => allInterests.add(i));
      }
    });
    return Array.from(allInterests).sort();
  };

  if (loading) {
    return (
      <div className="discover-neighbors-page">
        <div className="loading">Cargando vecinos...</div>
      </div>
    );
  }

  return (
    <div className="discover-neighbors-page">
      <div className="discover-header">
        <h1>Descubre Vecinos</h1>
        <p>Conecta con personas en tu vecindario que comparten tus intereses</p>
      </div>

      <div className="discover-filters">
        <button
          className={`filter-btn ${selectedInterest === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedInterest('all')}
        >
          Todos ({neighbors.length})
        </button>
        {getInterests().map(interest => {
          const count = neighbors.filter(n =>
            n.interests && n.interests.includes(interest)
          ).length;
          return (
            <button
              key={interest}
              className={`filter-btn ${selectedInterest === interest ? 'active' : ''}`}
              onClick={() => setSelectedInterest(interest)}
            >
              {interest} ({count})
            </button>
          );
        })}
      </div>

      <div className="neighbors-grid">
        {filteredNeighbors.length > 0 ? (
          filteredNeighbors.map(neighbor => (
            <div key={neighbor.id} className="neighbor-card">
              <div className="neighbor-header">
                <img
                  src={neighbor.avatar}
                  alt={neighbor.name}
                  className="neighbor-avatar"
                />
                <div className="neighbor-info">
                  <h3>{neighbor.name}</h3>
                  <p className="distance">{getDistance(neighbor)}</p>
                </div>
              </div>

              {neighbor.bio && (
                <p className="neighbor-bio">{neighbor.bio}</p>
              )}

              {neighbor.interests && neighbor.interests.length > 0 && (
                <div className="interests-section">
                  <p className="section-label">Intereses</p>
                  <div className="interests-tags">
                    {neighbor.interests.slice(0, 3).map(interest => (
                      <span key={interest} className="interest-tag">
                        {interest}
                      </span>
                    ))}
                    {neighbor.interests.length > 3 && (
                      <span className="interest-tag more">
                        +{neighbor.interests.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {neighbor.skills && neighbor.skills.length > 0 && (
                <div className="skills-section">
                  <p className="section-label">Habilidades</p>
                  <div className="skills-tags">
                    {neighbor.skills.slice(0, 2).map(skill => (
                      <span key={skill} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                    {neighbor.skills.length > 2 && (
                      <span className="skill-tag more">
                        +{neighbor.skills.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="neighbor-actions">
                {connectionStatuses[neighbor.id] === 'accepted' ? (
                  <button className="action-btn connected" disabled>
                    <CheckCircleIcon />
                    Conectado
                  </button>
                ) : connectionStatuses[neighbor.id] === 'pending' ? (
                  <button className="action-btn pending" disabled>
                    <PersonAddIcon />
                    Solicitud Enviada
                  </button>
                ) : (
                  <button
                    className="action-btn"
                    onClick={() => handleSendRequest(neighbor.id)}
                  >
                    <PersonAddIcon />
                    Conectar
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-neighbors">
            <p>No hay vecinos disponibles con estos criterios</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverNeighbors;
