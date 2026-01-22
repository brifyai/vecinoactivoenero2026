import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { formatNumber } from '../../utils/formatNumber';
import VerifiedIcon from '@mui/icons-material/Verified';
import './ProfileCard.css';

const ProfileCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="profile-card-home">
      <div className="profile-cover-small" style={{ backgroundImage: `url(${user?.coverPhoto})` }}></div>
      <div className="profile-avatar-home">
        <img src={user?.avatar} alt={user?.name} />
        {user?.verified && <VerifiedIcon className="verified-badge-small" />}
      </div>
      <h3>{user?.name}</h3>
      <p className="profile-email-small">{user?.email}</p>
      
      <div className="profile-stats-home">
        <div className="stat-home">
          <strong>{formatNumber(user?.following || 0)}</strong>
          <span>Siguiendo</span>
        </div>
        <div className="stat-home">
          <strong>{formatNumber(0)}</strong>
          <span>Me gusta</span>
        </div>
        <div className="stat-home">
          <strong>{formatNumber(user?.followers || 0)}</strong>
          <span>Seguidores</span>
        </div>
      </div>
      
      <button 
        className="edit-profile-btn-home"
        onClick={() => navigate('/configuracion')}
      >
        Editar perfil
      </button>
    </div>
  );
};

export default ProfileCard;
