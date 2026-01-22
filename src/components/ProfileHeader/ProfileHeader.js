import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVerification } from '../../context/VerificationContext';
import imageService from '../../services/imageService';
import { showSuccessToast, showErrorToast } from '../../utils/sweetalert';
import { formatNumber } from '../../utils/formatNumber';
import EditProfileModal from '../EditProfileModal/EditProfileModal';
import VerificationModal from '../VerificationModal/VerificationModal';
import VerifiedBadge from '../VerifiedBadge/VerifiedBadge';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VerifiedIcon from '@mui/icons-material/Verified';
import './ProfileHeader.css';

const ProfileHeader = ({ user: propUser, isOwnProfile = true }) => {
  const { user: currentUser, updateUser } = useAuth();
  const { getVerificationStatus } = useVerification();
  
  // Usar el usuario del prop si existe, sino usar el usuario actual
  const displayUser = propUser || currentUser;
  
  const [coverPhoto, setCoverPhoto] = useState(displayUser?.coverPhoto || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=300&fit=crop');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const verificationStatus = getVerificationStatus(displayUser?.id);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    showSuccessToast(isFollowing ? 'Dejaste de seguir' : '¡Ahora sigues a este usuario!');
  };

  const handleMessage = () => {
    showSuccessToast('Función de mensajería próximamente');
  };

  const handleCoverPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (!imageService.validateImageType(file)) {
        showErrorToast('Tipo de archivo no válido. Solo se permiten imágenes.');
        return;
      }

      const processedImage = await imageService.processImage(file);
      const savedCover = imageService.saveCoverPhoto(currentUser.id, processedImage);
      
      setCoverPhoto(savedCover);
      updateUser({ ...currentUser, coverPhoto: savedCover });
      showSuccessToast('¡Foto de portada actualizada!');
    } catch (error) {
      showErrorToast(error.message || 'Error al cargar la imagen');
    }
  };

  return (
    <>
      <div className="profile-header">
        <div className="cover-photo">
          <img src={coverPhoto} alt="Cover" />
          {isOwnProfile && (
            <label className="edit-cover-btn">
              <PhotoCameraIcon />
              Editar Portada
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverPhotoChange}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>
        
        <div className="profile-info-container">
          <div className="profile-avatar">
            <img src={displayUser?.avatar || 'https://i.pravatar.cc/150?img=8'} alt="Profile" />
            <span className="verified-badge">✓</span>
          </div>
          
          <div className="profile-info">
            <h2>
              {displayUser?.name || 'Usuario'} 
              {verificationStatus?.verified && <VerifiedBadge />}
              {' ❤️'}
            </h2>
            {displayUser?.username && (
              <p className="profile-username">@{displayUser.username}</p>
            )}
            <p className="profile-email">{displayUser?.email || 'email@example.com'}</p>
            {verificationStatus?.verified && (
              <p className="verification-status verified">✓ Vecino Verificado</p>
            )}
            {verificationStatus?.status === 'pending' && (
              <p className="verification-status pending">⏳ Verificación en proceso</p>
            )}
            {verificationStatus?.status === 'rejected' && (
              <p className="verification-status rejected">✗ Verificación rechazada</p>
            )}
          </div>

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{formatNumber(displayUser?.following || 0)}</span>
              <span className="stat-label">Siguiendo</span>
            </div>
            <div className="stat">
              <span className="stat-number">{formatNumber(displayUser?.likes || 0)}</span>
              <span className="stat-label">Me gusta</span>
            </div>
            <div className="stat">
              <span className="stat-number">{formatNumber(displayUser?.followers || 0)}</span>
              <span className="stat-label">Seguidores</span>
            </div>
          </div>
          
          <div className="profile-actions">
            {isOwnProfile ? (
              <>
                <button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>
                  Editar Perfil
                </button>
                {!verificationStatus?.verified && verificationStatus?.status !== 'pending' && (
                  <button className="verify-profile-btn" onClick={() => setShowVerificationModal(true)}>
                    <VerifiedIcon /> Verificar Perfil
                  </button>
                )}
              </>
            ) : (
              <>
                <button className="follow-btn" onClick={handleFollow}>
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </button>
                <button className="message-btn" onClick={handleMessage}>
                  Mensaje
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showEditModal && isOwnProfile && <EditProfileModal onClose={() => setShowEditModal(false)} />}
      {showVerificationModal && isOwnProfile && <VerificationModal onClose={() => setShowVerificationModal(false)} />}
    </>
  );
};

export default ProfileHeader;
