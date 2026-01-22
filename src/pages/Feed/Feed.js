import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalNeeds } from '../../context/LocalNeedsContext';
import { useCommunityActions } from '../../context/CommunityActionsContext';
import feedService from '../../services/feedService';
import NeedCard from '../../components/NeedCard/NeedCard';
import ActionCard from '../../components/ActionCard/ActionCard';
import FilterListIcon from '@mui/icons-material/FilterList';
import './Feed.css';

const Feed = () => {
  const { user } = useAuth();
  const { needs, getNeighborhoodNeeds } = useLocalNeeds();
  const { actions, getNeighborhoodActions } = useCommunityActions();
  const [feedItems, setFeedItems] = useState([]);
  const [filteredFeed, setFilteredFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState(['need', 'action']);
  const [maxDistance, setMaxDistance] = useState(5); // km
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    generateFeed();
  }, [needs, actions]);

  useEffect(() => {
    applyFilters();
  }, [feedItems, selectedTypes, maxDistance]);

  const generateFeed = () => {
    setLoading(true);

    try {
      const neighborhoodNeeds = getNeighborhoodNeeds(user.neighborhoodId);
      const neighborhoodActions = getNeighborhoodActions(user.neighborhoodId);

      const feed = feedService.generateFeed(
        neighborhoodNeeds,
        neighborhoodActions,
        [], // updates (no implementado aún)
        [], // services (no implementado aún)
        {
          latitude: user.latitude,
          longitude: user.longitude
        },
        50 // limit
      );

      setFeedItems(feed);
    } catch (error) {
      console.error('Error generating feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = feedItems;

    // Filtrar por tipo
    filtered = feedService.filterFeedByType(filtered, selectedTypes);

    // Filtrar por distancia
    filtered = feedService.filterFeedByDistance(
      filtered,
      { latitude: user.latitude, longitude: user.longitude },
      maxDistance
    );

    setFilteredFeed(filtered);
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const stats = feedService.getFeedStats(feedItems);

  if (loading) {
    return (
      <div className="feed-page">
        <div className="loading">Generando feed personalizado...</div>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <div className="feed-header">
        <h1>Feed de Vecindario</h1>
        <p>Contenido priorizado por relevancia, proximidad y urgencia</p>
      </div>

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
            <p><strong>Relevancia Promedio:</strong> {stats.averageRelevance.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="feed-list">
        {filteredFeed.length > 0 ? (
          filteredFeed.map(item => (
            <div key={`${item.type}-${item.id}`} className="feed-item">
              {item.type === 'need' && (
                <NeedCard
                  need={item}
                  userLocation={{ latitude: user.latitude, longitude: user.longitude }}
                />
              )}
              {item.type === 'action' && (
                <ActionCard
                  action={item}
                  userLocation={{ latitude: user.latitude, longitude: user.longitude }}
                />
              )}
            </div>
          ))
        ) : (
          <div className="no-feed">
            <p>No hay contenido disponible con estos filtros</p>
            <p className="no-feed-desc">Intenta cambiar los filtros o aumentar la distancia</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
