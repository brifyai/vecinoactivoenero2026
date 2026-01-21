import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../../utils/formatNumber';
import VerifiedIcon from '@mui/icons-material/Verified';
import './ProfileCard.css';

const ProfileCard = () => {
  const navigate = useNavigate();

  return (
    <div className="profile-card-home">
      <div className="profile-cover-small"></div>
      <div className="profile-avatar-home">
        <img src="https://i.pravatar.cc/80?img=8" alt="Profile" />
        <VerifiedIcon className="verified-badge-small" />
      </div>
      <h3>Josephin Water</h3>
      <p className="profile-email-small">josephin.water@gmail.com</p>
      
      <div className="profile-stats-home">
        <div className="stat-home">
          <strong>{formatNumber(546)}</strong>
          <span>Siguiendo</span>
        </div>
        <div className="stat-home">
          <strong>{formatNumber(26335)}</strong>
          <span>Me gusta</span>
        </div>
        <div className="stat-home">
          <strong>{formatNumber(6845)}</strong>
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
