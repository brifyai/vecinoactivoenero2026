import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useReduxFriends } from '../../hooks/useReduxFriends';
import { useSidebar } from '../../context/SidebarContext';
import { supabase } from '../../config/supabase';
import supabaseUsersService from '../../services/supabaseUsersService';
import { performanceMonitor, loadWithRetry } from '../../utils/performanceUtils';
import './DiscoverNeighbors.css';

const DiscoverNeighbors = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { friends, loading: friendsLoading, loadFriends } = useReduxFriends();
  const { isRightSidebarCollapsed } = useSidebar();
  const [neighbors, setNeighbors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  // Cargar usuarios desde Supabase con suscripción en tiempo real
  useEffect(() => {
    if (!currentUser || authLoading) return;

    let subscription = null;

    const loadUsersFromDatabase = async () => {
      performanceMonitor.start('load-users-supabase');
      console.log('🔄 Cargando usuarios desde Supabase...');
      
      try {
        setLoading(true);
        setError(null);

        // Cargar usuarios por ubicación si el usuario tiene barrio
        let users = [];
        if (currentUser.neighborhood_id || currentUser.neighborhood_name || currentUser.neighborhood_code) {
          users = await supabaseUsersService.getNeighborsByLocation(
            currentUser.neighborhood_id,
            currentUser.neighborhood_name,
            currentUser.neighborhood_code
          );
        } else {
          // Si no tiene barrio, cargar todos los usuarios
          users = await supabaseUsersService.getAllUsers();
        }

        // Filtrar el usuario actual
        const filteredUsers = users.filter(u => u.id !== currentUser.id);
        
        setAllUsers(filteredUsers);
        setNeighbors(filteredUsers);
        
        console.log('✅ Usuarios cargados desde Supabase:', filteredUsers.length);
        performanceMonitor.end('load-users-supabase');
      } catch (err) {
        console.error('❌ Error cargando usuarios desde Supabase:', err);
        setError('Error cargando vecinos. Por favor, recarga la página.');
        performanceMonitor.end('load-users-supabase');
      } finally {
        setLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      console.log('🔴 Configurando suscripción en tiempo real para usuarios...');
      
      // Suscribirse a cambios en la tabla users
      // ❌ DESHABILITADO - Supabase Realtime no configurado
      // Usar polling o Firebase si se necesita realtime
      console.log('ℹ️ Realtime deshabilitado - usando carga manual');
    };

    // Cargar datos iniciales
    loadUsersFromDatabase();
    
    // ❌ DESHABILITADO - No configurar suscripción Supabase Realtime
    // setupRealtimeSubscription();

    // Cleanup: ya no hay suscripción que limpiar
    return () => {
      console.log('🔴 Componente desmontado');
    };
  }, [currentUser, authLoading]);

  // Memoize friends IDs for faster filtering
  const friendIds = useMemo(() => {
    return new Set(friends.map(f => f.id));
  }, [friends]);

  // Memoize filtered neighbors based on current filter
  const displayedNeighbors = useMemo(() => {
    if (filter === 'friends') {
      return neighbors.filter(n => friendIds.has(n.id));
    } else if (filter === 'non-friends') {
      return neighbors.filter(n => !friendIds.has(n.id));
    }
    return neighbors;
  }, [neighbors, friendIds, filter]);

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
        {currentUser.neighborhood_name && (
          <p className="neighborhood-info">📍 {currentUser.neighborhood_name}</p>
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
              {neighbor.neighborhood_name && (
                <p className="neighbor-location">📍 {neighbor.neighborhood_name}</p>
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
