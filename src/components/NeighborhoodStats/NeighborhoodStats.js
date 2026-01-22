import React from 'react';
import { useNeighborhoodExpansion } from '../../context/NeighborhoodExpansionContext';
import { useAuth } from '../../context/AuthContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import InfoIcon from '@mui/icons-material/Info';
import './NeighborhoodStats.css';

const NeighborhoodStats = () => {
  const { user } = useAuth();
  const { getNeighborhoodStats, getRecommendations, neighborhoods } = useNeighborhoodExpansion();

  // Encontrar el vecindario del usuario
  const userNeighborhood = neighborhoods.find(n => n.name === user?.neighborhood);
  
  if (!userNeighborhood) {
    return null;
  }

  const stats = getNeighborhoodStats(userNeighborhood.id);
  const recommendations = getRecommendations(userNeighborhood.id);

  if (!stats || !recommendations) {
    return null;
  }

  return (
    <div className="neighborhood-stats">
      <div className="stats-header">
        <h3>Estado del Vecindario</h3>
        <span className={`status-badge ${stats.status}`}>
          {stats.status === 'expanding' && <ExpandMoreIcon />}
          {stats.status === 'splitting' && <CallSplitIcon />}
          {stats.status === 'normal' && <InfoIcon />}
          {stats.status}
        </span>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Usuarios</span>
          <span className="stat-value">{stats.userCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Radio Dinámico</span>
          <span className="stat-value">{stats.dynamicRadius}km</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Estado</span>
          <span className={`stat-status ${stats.status}`}>
            {stats.status === 'expanding' && 'Expandiendo'}
            {stats.status === 'splitting' && 'Dividiendo'}
            {stats.status === 'normal' && 'Normal'}
          </span>
        </div>
      </div>

      {recommendations.actions.length > 0 && (
        <div className="recommendations">
          <h4>Recomendaciones</h4>
          {recommendations.actions.map((action, index) => (
            <div key={index} className={`recommendation-item ${action.priority}`}>
              <span className="priority-badge">{action.priority}</span>
              <p>{action.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="stats-info">
        <p className="info-text">
          {stats.shouldExpand && (
            <>
              Tu vecindario tiene pocos usuarios. El radio de búsqueda se ha expandido automáticamente a {stats.dynamicRadius}km para mostrar más contenido de vecindarios cercanos.
            </>
          )}
          {stats.shouldSplit && (
            <>
              Tu vecindario es muy poblado. Se recomienda dividirlo en sub-vecindarios para mejorar la experiencia.
            </>
          )}
          {!stats.shouldExpand && !stats.shouldSplit && (
            <>
              Tu vecindario está en estado normal con {stats.userCount} usuarios activos.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default NeighborhoodStats;
