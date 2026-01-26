import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../../store/selectors/authSelectors';
import { selectAllPosts as selectPosts, selectPostsLoading, selectPostsError } from '../../store/selectors/postsSelectors';
import { loadPosts, createPost } from '../../store/slices/postsSlice';
import { useHybridRealtimeContext } from '../../components/HybridRealtimeProvider/HybridRealtimeProvider';
import { useReduxLocalNeeds } from '../../hooks/useReduxLocalNeeds';
import { useReduxCommunityActions } from '../../hooks/useReduxCommunityActions';
import feedService from '../../services/feedService';
import Post from '../../components/Post/Post';
import CreatePost from '../../components/CreatePost/CreatePost';
import NeedCard from '../../components/NeedCard/NeedCard';
import ActionCard from '../../components/ActionCard/ActionCard';
import FilterListIcon from '@mui/icons-material/FilterList';
import './Feed.css';

const Feed = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const posts = useSelector(selectPosts);
  const postsLoading = useSelector(selectPostsLoading);
  const postsError = useSelector(selectPostsError);
  
  // Contextos existentes
  const { needs, getNeighborhoodNeeds } = useReduxLocalNeeds();
  const { actions, getNeighborhoodActions } = useReduxCommunityActions();
  
  // Sistema híbrido
  const hybridRealtime = useHybridRealtimeContext();
  
  // Estados locales
  const [feedItems, setFeedItems] = useState([]);
  const [filteredFeed, setFilteredFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState(['post', 'need', 'action']);
  const [maxDistance, setMaxDistance] = useState(5); // km
  const [showFilters, setShowFilters] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Cargar posts iniciales
  useEffect(() => {
    if (user?.neighborhood_id) {
      dispatch(loadPosts({ 
        neighborhoodId: user.neighborhood_id, 
        limit: 50 
      }));
    }
  }, [dispatch, user?.neighborhood_id]);

  // Escuchar actualizaciones híbridas de posts
  useEffect(() => {
    const handleHybridPostsUpdate = (event) => {
      console.log('🔄 Posts actualizados desde sistema híbrido:', event.detail);
      
      // Recargar posts cuando hay actualizaciones híbridas
      if (user?.neighborhood_id) {
        dispatch(loadPosts({ 
          neighborhoodId: user.neighborhood_id, 
          limit: 50 
        }));
      }
    };

    // Escuchar eventos del sistema híbrido
    window.addEventListener('hybridPostsUpdate', handleHybridPostsUpdate);
    
    return () => {
      window.removeEventListener('hybridPostsUpdate', handleHybridPostsUpdate);
    };
  }, [dispatch, user?.neighborhood_id]);

  // Generar feed combinado
  useEffect(() => {
    generateFeed();
  }, [posts, needs, actions]);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [feedItems, selectedTypes, maxDistance]);

  const generateFeed = useCallback(() => {
    setLoading(true);

    try {
      // Obtener datos de diferentes fuentes
      const neighborhoodNeeds = user?.neighborhood_id ? 
        getNeighborhoodNeeds(user.neighborhood_id) : [];
      const neighborhoodActions = user?.neighborhood_id ? 
        getNeighborhoodActions(user.neighborhood_id) : [];

      // Convertir posts a formato de feed
      const postsForFeed = posts.map(post => ({
        ...post,
        type: 'post',
        timestamp: new Date(post.created_at),
        relevanceScore: calculatePostRelevance(post),
        distance: 0 // Posts del mismo vecindario
      }));

      // Generar feed combinado
      const feed = feedService.generateFeed(
        neighborhoodNeeds,
        neighborhoodActions,
        [], // updates (no implementado aún)
        [], // services (no implementado aún)
        {
          latitude: user?.latitude || 0,
          longitude: user?.longitude || 0
        },
        100 // limit aumentado para incluir posts
      );

      // Combinar posts con otros items del feed
      const combinedFeed = [...postsForFeed, ...feed]
        .sort((a, b) => {
          // Ordenar por relevancia y timestamp
          const relevanceDiff = (b.relevanceScore || 0) - (a.relevanceScore || 0);
          if (relevanceDiff !== 0) return relevanceDiff;
          
          return new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at);
        });

      setFeedItems(combinedFeed);
    } catch (error) {
      console.error('Error generating feed:', error);
    } finally {
      setLoading(false);
    }
  }, [posts, needs, actions, user, getNeighborhoodNeeds, getNeighborhoodActions]);

  // Calcular relevancia de posts
  const calculatePostRelevance = (post) => {
    let score = 1.0;
    
    // Boost por likes y comentarios
    score += (post.likes || 0) * 0.1;
    score += (post.comments_count || 0) * 0.2;
    
    // Boost por recencia (posts más nuevos)
    const hoursAgo = (Date.now() - new Date(post.created_at)) / (1000 * 60 * 60);
    if (hoursAgo < 1) score += 0.5;
    else if (hoursAgo < 6) score += 0.3;
    else if (hoursAgo < 24) score += 0.1;
    
    // Boost por categoría
    if (post.category === 'emergency') score += 1.0;
    else if (post.category === 'community') score += 0.3;
    
    return score;
  };

  const applyFilters = () => {
    let filtered = feedItems;

    // Filtrar por tipo
    filtered = filtered.filter(item => selectedTypes.includes(item.type));

    // Filtrar por distancia (solo para items con ubicación)
    if (user?.latitude && user?.longitude) {
      filtered = filtered.filter(item => {
        if (item.type === 'post') return true; // Posts del mismo vecindario
        return !item.distance || item.distance <= maxDistance;
      });
    }

    setFilteredFeed(filtered);
  };

  // Manejar creación de post
  const handleCreatePost = async (postData) => {
    try {
      const result = await dispatch(createPost(postData)).unwrap();
      
      // Sincronizar con sistema híbrido
      if (hybridRealtime.isConnected) {
        await hybridRealtime.syncPost(result);
        console.log('📝 Post sincronizado al sistema híbrido');
      }
      
      setShowCreatePost(false);
      
      // Recargar feed
      generateFeed();
      
    } catch (error) {
      console.error('Error creando post:', error);
    }
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const stats = {
    ...feedService.getFeedStats(feedItems.filter(item => item.type !== 'post')),
    byType: {
      ...feedService.getFeedStats(feedItems.filter(item => item.type !== 'post')).byType,
      post: feedItems.filter(item => item.type === 'post').length
    }
  };

  if (loading || postsLoading) {
    return (
      <div className="feed-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Generando feed personalizado...</p>
        </div>
      </div>
    );
  }

  if (postsError) {
    return (
      <div className="feed-page">
        <div className="error-message">
          <p>Error cargando el feed: {postsError}</p>
          <button onClick={() => dispatch(loadPosts({ neighborhoodId: user?.neighborhood_id }))}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <div className="feed-header">
        <h1>Feed de Vecindario</h1>
        <p>Contenido priorizado por relevancia, proximidad y urgencia</p>
        {hybridRealtime.isConnected && (
          <div className="realtime-indicator">
            <span className="realtime-dot"></span>
            Tiempo real activo
          </div>
        )}
      </div>

      <div className="feed-actions">
        <button
          className="create-post-btn"
          onClick={() => setShowCreatePost(true)}
        >
          ✏️ Crear Publicación
        </button>
      </div>

      {showCreatePost && (
        <div className="create-post-modal">
          <div className="modal-overlay" onClick={() => setShowCreatePost(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <CreatePost
                onSubmit={handleCreatePost}
                onCancel={() => setShowCreatePost(false)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="feed-controls">
        <button
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FilterListIcon />
          Filtros
        </button>
        <div className="feed-stats">
          <span>{filteredFeed.length} items</span>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Tipos de Contenido</label>
            <div className="filter-options">
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes('post')}
                  onChange={() => handleTypeToggle('post')}
                />
                <span>Publicaciones ({stats.byType.post || 0})</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes('need')}
                  onChange={() => handleTypeToggle('need')}
                />
                <span>Necesidades Locales ({stats.byType.need || 0})</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes('action')}
                  onChange={() => handleTypeToggle('action')}
                />
                <span>Acciones Comunitarias ({stats.byType.action || 0})</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes('update')}
                  onChange={() => handleTypeToggle('update')}
                />
                <span>Actualizaciones ({stats.byType.update || 0})</span>
              </label>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes('service')}
                  onChange={() => handleTypeToggle('service')}
                />
                <span>Servicios ({stats.byType.service || 0})</span>
              </label>
            </div>
          </div>

          <div className="filter-group">
            <label>Distancia Máxima: {maxDistance}km</label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseFloat(e.target.value))}
              className="distance-slider"
            />
          </div>

          <div className="filter-stats">
            <p><strong>Relevancia Promedio:</strong> {stats.averageRelevance?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
      )}

      <div className="feed-list">
        {filteredFeed.length > 0 ? (
          filteredFeed.map(item => (
            <div key={`${item.type}-${item.id}`} className="feed-item">
              {item.type === 'post' && (
                <Post
                  post={item}
                  onUpdate={() => generateFeed()}
                />
              )}
              {item.type === 'need' && (
                <NeedCard
                  need={item}
                  userLocation={{ 
                    latitude: user?.latitude || 0, 
                    longitude: user?.longitude || 0 
                  }}
                />
              )}
              {item.type === 'action' && (
                <ActionCard
                  action={item}
                  userLocation={{ 
                    latitude: user?.latitude || 0, 
                    longitude: user?.longitude || 0 
                  }}
                />
              )}
            </div>
          ))
        ) : (
          <div className="no-feed">
            <p>No hay contenido disponible con estos filtros</p>
            <p className="no-feed-desc">
              {selectedTypes.length === 0 
                ? 'Selecciona al menos un tipo de contenido'
                : 'Intenta cambiar los filtros o aumentar la distancia'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
