import React, { useState } from 'react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useCommunityActions } from '../../context/CommunityActionsContext';
import { useNeighborhoods } from '../../context/NeighborhoodsContext';
import storageService from '../../services/storageService';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import './ActionCard.css';

const ActionCard = ({ action, userLocation }) => {
  const { user } = useAuth();
  const { joinAction, leaveAction } = useCommunityActions();
  const { calculateDistance } = useNeighborhoods();
  const [organizer, setOrganizer] = useState(null);
  const [isJoined, setIsJoined] = useState(
    action.participants.some(p => p.userId === user.id)
  );
  const [isWaitlisted, setIsWaitlisted] = useState(
    action.waitlist.some(p => p.userId === user.id)
  );

  React.useEffect(() => {
    const organizerData = storageService.getUser(action.organizerId);
    setOrganizer(organizerData);
  }, [action.organizerId]);

  const getDistance = () => {
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      action.location.latitude,
      action.location.longitude
    );
    return distance < 1000
      ? `${Math.round(distance)}m`
      : `${(distance / 1000).toFixed(1)}km`;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleJoin = () => {
    const result = joinAction(action.id, user.id);
    if (result.success) {
      setIsJoined(true);
      if (result.action.waitlist.some(p => p.userId === user.id)) {
        setIsWaitlisted(true);
      }
    }
  };

  const handleLeave = () => {
    const result = leaveAction(action.id, user.id);
    if (result.success) {
      setIsJoined(false);
      setIsWaitlisted(false);
    }
  };

  const isFull = action.participantLimit && action.participants.length >= action.participantLimit;
  const isOrganizer = action.organizerId === user.id;

  return (
    <div className="action-card">
      <div className="action-header">
        <div className="action-title-section">
          <h3 className="action-title">{action.title}</h3>
          <p className="action-description">{action.description}</p>
        </div>
        <div className={`action-status ${action.status}`}>
          {action.status === 'planned' && '📅 Planificada'}
          {action.status === 'in_progress' && '🔄 En Progreso'}
          {action.status === 'completed' && '✅ Completada'}
          {action.status === 'cancelled' && '❌ Cancelada'}
        </div>
      </div>

      {action.requiredSkills && action.requiredSkills.length > 0 && (
        <div className="required-skills">
          <p className="skills-label">Habilidades requeridas:</p>
          <div className="skills-list">
            {action.requiredSkills.map(skill => (
              <span key={skill} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="action-meta">
        <div className="meta-item">
          <EventIcon className="meta-icon" />
          <span>{formatDate(action.startDate)}</span>
        </div>
        <div className="meta-item">
          <LocationOnIcon className="meta-icon" />
          <span>{action.location.name} ({getDistance()})</span>
        </div>
        <div className="meta-item">
          <GroupIcon className="meta-icon" />
          <span>
            {action.participants.length}
            {action.participantLimit ? `/${action.participantLimit}` : ''} participantes
          </span>
        </div>
      </div>

      {action.waitlist.length > 0 && (
        <div className="waitlist-info">
          <span className="waitlist-badge">{action.waitlist.length} en lista de espera</span>
        </div>
      )}

      {organizer && (
        <div className="action-organizer">
          <img src={organizer.avatar} alt={organizer.name} className="organizer-avatar" />
          <div className="organizer-info">
            <p className="organizer-label">Organizado por</p>
            <p className="organizer-name">{organizer.name}</p>
          </div>
        </div>
      )}

      <div className="action-actions">
        {isOrganizer ? (
          <button className="action-btn organizer-btn" disabled>
            Eres el Organizador
          </button>
        ) : isJoined ? (
          <button
            className={`action-btn joined-btn ${isWaitlisted ? 'waitlisted' : ''}`}
            onClick={handleLeave}
          >
            {isWaitlisted ? '⏳ En Lista de Espera' : '✓ Participando'}
          </button>
        ) : (
          <button
            className={`action-btn join-btn ${isFull ? 'full' : ''}`}
            onClick={handleJoin}
            disabled={false}
          >
            {isFull ? '⏳ Unirse a Lista de Espera' : '🎯 Unirse'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionCard;
