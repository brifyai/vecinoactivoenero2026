import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useReduxFriends } from '../../hooks/useReduxFriends';
import storageService from '../../services/storageService';
import './DiscoverNeighbors.css';

const DiscoverNeighbors = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { friends } = useReduxFriends();
  const [neighbors, setNeighbors] = useState([]);
  const [filteredNeighbors, setFilteredNeighbors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNeighbors();
  }, [currentUser]);

  const loadNeighbors = () => {
    setLoading(true);
    try {
      const allUsers = storageService.getUsers();
      const neighborList = allUsers.filter(u =>
        u.id !== currentUser.id &&
        u.neighborhoodId === currentUser.neighborhoodId
      );

      const sortedNeighbors = neighborList.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setNeighbors(sortedNeighbors);
      setFilteredNeighbors(sortedNeighbors);
      setFilter('all');
    } catch (error) {
      console.error('Error loading neighbors:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (neighborsList, filterValue) => {
    let filtered = neighborsList;

    if (filterValue === 'friends') {
      const friendIds = friends.map(f => f.id);
      filtered = neighborsList.filter(n => friendIds.includes(n.id));
    } else if (filterValue === 'non-friends') {
      const friendIds = friends.map(f => f.id);
      filtered = neighborsList.filter(n => !friendIds.includes(n.id));
    }

    setFilteredNeighbors(filtered);
  };

  const handleFilterClick = (filterValue) => {
    setFilter(filterValue);
    applyFilter(neighbors, filterValue);
  };

  const handleNeighborClick = (neighbor) => {
    navigate(`/${neighbor.username}`);
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
        <p>Conoce a los vecinos de tu comunidad</p>
      </div>

      <div className="filter-buttons">
        <div 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onMouseDown={() => handleFilterClick('all')}
          role="button"
          tabIndex="0"
          aria-pressed={filter === 'all'}
          data-testid="filter-all"
          style={{ cursor: 'pointer' }}
        >
          Todos ({neighbors.length})
        </div>
        <div 
          className={`filter-btn ${filter === 'friends' ? 'active' : ''}`}
          onMouseDown={() => handleFilterClick('friends')}
          role="button"
          tabIndex="0"
          aria-pressed={filter === 'friends'}
          data-testid="filter-friends"
          style={{ cursor: 'pointer' }}
        >
          Amigos ({friends.length})
        </div>
        <div 
          className={`filter-btn ${filter === 'non-friends' ? 'active' : ''}`}
          onMouseDown={() => handleFilterClick('non-friends')}
          role="button"
          tabIndex="0"
          aria-pressed={filter === 'non-friends'}
          data-testid="filter-non-friends"
          style={{ cursor: 'pointer' }}
        >
          No amigos ({neighbors.length - friends.length})
        </div>
      </div>

      <div className="neighbors-grid">
        {filteredNeighbors.length > 0 ? (
          filteredNeighbors.map(neighbor => (
            <div 
              key={neighbor.id} 
              className="neighbor-card"
              onClick={() => handleNeighborClick(neighbor)}
              style={{ cursor: 'pointer' }}
            >
              <div className="neighbor-avatar-large">
                <img
                  src={neighbor.avatar}
                  alt={neighbor.name}
                />
              </div>
              <h3>{neighbor.name}</h3>
              <p className="neighbor-username">@{neighbor.username}</p>
              {neighbor.bio && (
                <p className="neighbor-bio">{neighbor.bio}</p>
              )}
            </div>
          ))
        ) : (
          <div className="no-neighbors">
            <p>
              {filter === 'friends' && 'No tienes amigos en tu comunidad'}
              {filter === 'non-friends' && 'No hay vecinos sin ser amigos'}
              {filter === 'all' && 'No hay vecinos en tu comunidad'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverNeighbors;
