import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useReduxFriends } from '../../hooks/useReduxFriends';
import { useSidebar } from '../../context/SidebarContext';
import storageService from '../../services/storageService';
import { performanceMonitor, loadWithRetry } from '../../utils/performanceUtils';
import './DiscoverNeighbors.css';

const DiscoverNeighbors = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { friends, loading: friendsLoading, loadFriends } = useReduxFriends();
  const { isRightSidebarCollapsed } = useSidebar();
  const [neighbors, setNeighbors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Memoize expensive operations with performance monitoring
  const allUsers = useMemo(() => {
    performanceMonitor.start('load-users');
    try {
      const users = storageService.getUsers();
      performanceMonitor.end('load-users');
      return users;
    } catch (err) {
      console.error('Error loading users:', err);
      performanceMonitor.end('load-users');
      return [];
    }
  }, []);

  // Memoize filtered neighbors based on current user and all users
  const filteredNeighborsList = useMemo(() => {
    if (!currentUser || !allUsers.length) return [];

    performanceMonitor.start('filter-neighbors');
    console.log('🔄 Filtering neighbors for user:', currentUser.username);
    
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

    const sortedNeighbors = neighborList.sort((a, b) => a.name.localeCompare(b.name));
    performanceMonitor.end('filter-neighbors');
    
    return sortedNeighbors;
  }, [currentUser, allUsers]);

  // Memoize friends IDs for faster filtering
  const friendIds = useMemo(() => {
    return new Set(friends.map(f => f.id));
  }, [friends]);

  // Memoize filtered neighbors based on current filter
  const displayedNeighbors = useMemo(() => {
    if (filter === 'friends') {
      return filteredNeighborsList.filter(n => friendIds.has(n.id));
    } else if (filter === 'non-friends') {
      return filteredNeighborsList.filter(n => !friendIds.has(n.id));
    }
    return filteredNeighborsList;
  }, [filteredNeighborsList, friendIds, filter]);

  // Load friends data when user is available with retry logic
  useEffect(() => {
    if (currentUser && !friendsLoading) {
      console.log('🔄 Loading friends for user:', currentUser.id);
      
      const loadFriendsWithRetry = async () => {
        try {
          await loadWithRetry(
            () => loadFriends(),
            2, // max retries
            3000 // timeout
          );
        } catch (error) {
          console.error('Failed to load friends after retries:', error);
          // Continue without friends data
        }
      };
      
      loadFriendsWithRetry();
    }
  }, [currentUser, loadFriends, friendsLoading]);

  // Initialize component state with performance monitoring
  useEffect(() => {
    console.log('🔍 DiscoverNeighbors: Component mounted');
    console.log('👤 Current user:', currentUser);
    console.log('🔄 Auth loading:', authLoading);
    
    const initializeComponent = async () => {
      performanceMonitor.start('initialize-component');
      
      try {
        setLoading(true);
        setError(null);

        // Wait for auth to complete
        if (authLoading) {
          console.log('⏳ Waiting for auth to complete...');
          performanceMonitor.end('initialize-component');
          return;
        }

        if (!currentUser) {
          console.log('❌ No current user available');
          setLoading(false);
          performanceMonitor.end('initialize-component');
          return;
        }

        // Use setTimeout to defer heavy operations and improve perceived performance
        setTimeout(() => {
          try {
            // Set neighbors from memoized list
            setNeighbors(filteredNeighborsList);
            console.log('✅ Neighbors loaded:', filteredNeighborsList.length);
            performanceMonitor.end('initialize-component');
          } catch (err) {
            console.error('❌ Error setting neighbors:', err);
            setError('Error procesando vecinos. Por favor, recarga la página.');
            performanceMonitor.end('initialize-component');
          } finally {
            setLoading(false);
          }
        }, 0);
        
      } catch (err) {
        console.error('❌ Error initializing component:', err);
        setError('Error cargando vecinos. Por favor, recarga la página.');
        performanceMonitor.end('initialize-component');
        setLoading(false);
      }
    };

    initializeComponent();
  }, [currentUser, authLoading, filteredNeighborsList]);

  const handleFilterClick = useCallback((filterValue) => {
    console.log('🔍 Filter clicked:', filterValue);
    setFilter(filterValue);
  }, []);

  const handleNeighborClick = useCallback((neighbor) => {
    console.log('👤 Neighbor clicked:', neighbor.username);
    navigate(`/${neighbor.username}`);
  }, [navigate]);

  // Show loading state
  if (loading || authLoading) {
    return (
      <div className={`discover-neighbors-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando vecinos...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`discover-neighbors-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Recargar página
          </button>
        </div>
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
        {displayedNeighbors.length > 0 ? (
          displayedNeighbors.map(neighbor => (
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
            {friendsLoading && (
              <p style={{ fontSize: '14px', marginTop: '10px', color: '#9ca3af' }}>
                Cargando información de amigos...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverNeighbors;
