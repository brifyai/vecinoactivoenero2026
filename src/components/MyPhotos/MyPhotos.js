import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MyPhotos.css';

const MyPhotos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const photos = [
    'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
  ];

  const handleViewAll = () => {
    // Navegar al perfil del usuario con la pestaña de fotos activa
    const username = user?.username || user?.name?.toLowerCase().replace(/\s+/g, '-') || 'me';
    navigate(`/${username}`, { state: { activeTab: 'photos' } });
  };

  return (
    <div className="my-photos-widget">
      <div className="photos-header">
        <h3>Mis Fotos</h3>
        <button onClick={handleViewAll} className="view-all-link">
          Ver Todas
        </button>
      </div>
      <div className="photos-grid-home">
        {photos.map((photo, index) => (
          <div key={index} className="photo-item-home">
            <img src={photo} alt={`Photo ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPhotos;
