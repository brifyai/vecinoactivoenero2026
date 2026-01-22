import React, { useState, useEffect } from 'react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useCommunityActions } from '../../context/CommunityActionsContext';
import { useNeighborhoods } from '../../context/NeighborhoodsContext';
import CreateActionModal from '../../components/CreateActionModal/CreateActionModal';
import ActionCard from '../../components/ActionCard/ActionCard';
import AddIcon from '@mui/icons-material/Add';
import './CommunityActions.css';

const CommunityActions = () => {
  const { user } = useAuth();
  const { actions, getUpcomingActions } = useCommunityActions();
  const { calculateDistance } = useNeighborhoods();
  const [filteredActions, setFilteredActions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('upcoming'); // 'upcoming' or 'all'

  useEffect(() => {
    filterActions();
    setLoading(false);
  }, [actions, viewMode]);

  const filterActions = () => {
    let filtered;

    if (viewMode === 'upcoming') {
      filtered = getUpcomingActions(user.neighborhoodId);
    } else {
      filtered = actions.filter(
        a => a.neighborhoodId === user.neighborhoodId && a.status !== 'cancelled'
      );
    }

    // Ordenar por fecha
    filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    setFilteredActions(filtered);
  };

  if (loading) {
    return (
      <div className="community-actions-page">
        <div className="loading">Cargando acciones comunitarias...</div>
      </div>
    );
  }

  return (
    <div className="community-actions-page">
      <div className="actions-header">
        <div className="header-content">
          <h1>Acciones Comunitarias</h1>
          <p>Participa en iniciativas que mejoran tu vecindario</p>
        </div>
        <button
          className="create-action-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <AddIcon />
          Crear Acción
        </button>
      </div>

      <div className="actions-tabs">
        <button
          className={`tab-btn ${viewMode === 'upcoming' ? 'active' : ''}`}
          onClick={() => setViewMode('upcoming')}
        >
          Próximas ({getUpcomingActions(user.neighborhoodId).length})
        </button>
        <button
          className={`tab-btn ${viewMode === 'all' ? 'active' : ''}`}
          onClick={() => setViewMode('all')}
        >
          Todas ({actions.filter(a => a.neighborhoodId === user.neighborhoodId && a.status !== 'cancelled').length})
        </button>
      </div>

      <div className="actions-list">
        {filteredActions.length > 0 ? (
          filteredActions.map(action => (
            <ActionCard
              key={action.id}
              action={action}
              userLocation={{ latitude: user.latitude, longitude: user.longitude }}
            />
          ))
        ) : (
          <div className="no-actions">
            <p>No hay acciones comunitarias disponibles</p>
            <p className="no-actions-desc">
              {viewMode === 'upcoming'
                ? 'Sé el primero en crear una acción'
                : 'No hay acciones en tu vecindario'}
            </p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateActionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            filterActions();
          }}
        />
      )}
    </div>
  );
};

export default CommunityActions;
