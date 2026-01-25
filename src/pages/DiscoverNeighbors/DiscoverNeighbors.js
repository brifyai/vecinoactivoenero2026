import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useReduxFriends } from '../../hooks/useReduxFriends';
import { useSidebar } from '../../context/SidebarContext';
import storageService from '../../services/storageService';
import './DiscoverNeighbors.css';

const DiscoverNeighbors = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { friends } = useReduxFriends();
  const { isRightSidebarCollapsed } = useSidebar();
  const [neighbors, setNeighbors] = useState([]);
  const [filteredNeighbors, setFilteredNeighbors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    console.log('🔍 DiscoverNeighbors: Component mounted');
    console.log('👤 Current user:', currentUser);
    console.log('👥 Friends:', friends);
    
    if (currentUser) {
      loadNeighbors();
    } else {
      console.log('⚠️ No current user, setting loading to false');
      setLoading(false);
    }
  }, [currentUser]);

  const loadNeighbors = () => {
    console.log('🔄 Loading neighbors...');
    setLoading(true);
    try {
      const allUsers = storageService.getUsers();
      console.log('📊 All users from storage:', allUsers.length);
      
      if (!currentUser) {
        console.log('❌ No current user available');
        setLoading(false);
        return;
      }

      // Filter neighbors - use neighborhoodName as fallback if neighborhoodId doesn't exist
      const neighborList = allUsers.filter(u => {
        if (u.id === currentUser.id) return false;
        
        // Try multiple neighborhood matching strategies
        if (currentUser.neighborhoodId && u.neighborhoodId) {
          return u.neighborhoodId === currentUser.neighborhoodId;
        }
        
        if (currentUser.neighborhoodName && u.neighborhoodName) {
          return u.neighborhoodName === currentUser.neighborhoodName;
        }
        
        if (currentUser.neighborhoodCode && u.neighborhoodCode) {
          return u.neighborhoodCode === currentUser.neighborhoodCode;
        }
        
        // If no neighborhood info, include all users except current
        return true;
      });

      console.log('🏘️ Filtered neighbors:', neighborList.length);

      const sortedNeighbors = neighborList.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setNeighbors(sortedNeighbors);
      setFilteredNeighbors(sortedNeighbors);
      setFilter('all');
      
      console.log('✅ Neighbors loaded successfully');
    } catch (error) {
      console.error('❌ Error loading neighbors:', error);
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
    console.log('🔍 Filter clicked:', filterValue);
    setFilter(filterValue);
    applyFilter(neighbors, filterValue);
  };

  const handleNeighborClick = (neighbor) => {
    console.log('👤 Neighbor clicked:', neighbor.username);
    navigate(`/${neighbor.username}`);
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`discover-neighbors-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="loading">Cargando vecinos...</div>
      </div>
    );
  }

  // Show message if no current user
  if (!currentUser) {
    return (
      <div className={`discover-neighbors-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="discover-header">
          <h1>Descubre Vecinos</h1>
          <p>Debes iniciar sesión para ver a tus vecinos</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`discover-neighbors-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="discover-header">
        <h1>Descubre Vecinos</h1>
        <p>Conoce a los vecinos de tu comunidad</p>
        {currentUser.neighborhoodName && (
          <p className="neighborhood-info">📍 {currentUser.neighborhoodName}</p>
        )}
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
          No amigos ({Math.max(0, neighbors.length - friends.length)})
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
                  onError={(e) => {
                    e.target.src = 'https://i.pravatar.cc/150?img=1';
                  }}
                />
              </div>
              <h3>{neighbor.name}</h3>
              <p className="neighbor-username">@{neighbor.username}</p>
              {neighbor.bio && (
                <p className="neighbor-bio">{neighbor.bio}</p>
              )}
              {neighbor.neighborhoodName && (
                <p className="neighbor-location">📍 {neighbor.neighborhoodName}</p>
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
            <p style={{ fontSize: '14px', marginTop: '10px', color: '#9ca3af' }}>
              Revisa la consola del navegador para más detalles
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverNeighbors;
