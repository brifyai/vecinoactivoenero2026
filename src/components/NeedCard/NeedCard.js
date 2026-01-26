import React, { useState } from 'react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useReduxLocalNeeds } from '../../hooks/useReduxLocalNeeds';
import { useNeighborhoods } from '../../context/NeighborhoodsContext';
import storageService from '../../services/storageService';
import RespondNeedModal from '../RespondNeedModal/RespondNeedModal';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import './NeedCard.css';

const NeedCard = ({ need, userLocation }) => {
  const { user } = useAuth();
  const { respondToNeed } = useReduxLocalNeeds();
  const { calculateDistance } = useNeighborhoods();
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [creator, setCreator] = useState(null);

  React.useEffect(() => {
    const creatorData = storageService.getUser(need.userId);
    setCreator(creatorData);
  }, [need.userId]);

  const getDistance = () => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      need.location.latitude,
      need.location.longitude
    );
    return distance < 1000
      ? `${Math.round(distance)}m`
      : `${(distance / 1000).toFixed(1)}km`;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const createdDate = new Date(date);
    const diffMs = now - createdDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return createdDate.toLocaleDateString();
  };

  const getTypeIcon = (type) => {
    const icons = {
      help_request: '🆘',
      resource_needed: '📦',
      skill_sought: '🎯'
    };
    return icons[type] || '📌';
  };

  const getTypeLabel = (type) => {
    const labels = {
      help_request: 'Solicitud de Ayuda',
      resource_needed: 'Recurso Necesario',
      skill_sought: 'Habilidad Buscada'
    };
    return labels[type] || type;
  };

  const getUrgencyClass = (urgency) => {
    return `urgency-${urgency}`;
  };

  const getUrgencyLabel = (urgency) => {
    const labels = {
      critical: 'Crítica',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return labels[urgency] || urgency;
  };

  const isCreator = need.userId === user.id;
  const hasResponded = need.responses.some(r => r.userId === user.id);

  return (
    <>
      <div className="need-card">
        <div className="need-header">
          <div className="need-type">
            <span className="type-icon">{getTypeIcon(need.type)}</span>
            <span className="type-label">{getTypeLabel(need.type)}</span>
          </div>
          <div className={`urgency-badge ${getUrgencyClass(need.urgency)}`}>
            {getUrgencyLabel(need.urgency)}
          </div>
        </div>

        <h3 className="need-title">{need.title}</h3>

        <p className="need-description">{need.description}</p>

        {need.requiredSkills && need.requiredSkills.length > 0 && (
          <div className="required-skills">
            <p className="skills-label">Habilidades requeridas:</p>
            <div className="skills-list">
              {need.requiredSkills.map(skill => (
                <span key={skill} className="skill-badge">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="need-meta">
          <div className="meta-item">
            <LocationOnIcon className="meta-icon" />
            <span>{getDistance()}</span>
          </div>
          <div className="meta-item">
            <AccessTimeIcon className="meta-icon" />
            <span>{getTimeAgo(need.createdAt)}</span>
          </div>
          {need.responses.length > 0 && (
            <div className="meta-item">
              <PersonIcon className="meta-icon" />
              <span>{need.responses.length} respuesta{need.responses.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {creator && (
          <div className="need-creator">
            <img src={creator.avatar} alt={creator.name} className="creator-avatar" />
            <div className="creator-info">
              <p className="creator-name">{creator.name}</p>
              <p className="creator-location">{creator.neighborhoodName}</p>
            </div>
          </div>
        )}

        <div className="need-actions">
          {isCreator ? (
            <button className="action-btn creator-btn" disabled>
              Tu Necesidad
            </button>
          ) : hasResponded ? (
            <button className="action-btn responded-btn" disabled>
              Ya Respondiste
            </button>
          ) : (
            <button
              className="action-btn respond-btn"
              onClick={() => setShowRespondModal(true)}
            >
              Responder
            </button>
          )}
        </div>
      </div>

      {showRespondModal && (
        <RespondNeedModal
          need={need}
          onClose={() => setShowRespondModal(false)}
          onSuccess={() => {
            setShowRespondModal(false);
          }}
        />
      )}
    </>
  );
};

export default NeedCard;
