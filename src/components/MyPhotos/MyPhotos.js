import { useState } from 'react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useNavigate } from 'react-router-dom';
import PhotoLightbox from '../PhotoLightbox/PhotoLightbox';
import './MyPhotos.css';

const MyPhotos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const photos = [
    { id: 1, title: 'Foto 1', image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=200&h=200&fit=crop', description: 'Mi foto' },
    { id: 2, title: 'Foto 2', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', description: 'Mi foto' },
    { id: 3, title: 'Foto 3', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop', description: 'Mi foto' },
    { id: 4, title: 'Foto 4', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop', description: 'Mi foto' },
    { id: 5, title: 'Foto 5', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', description: 'Mi foto' },
    { id: 6, title: 'Foto 6', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop', description: 'Mi foto' },
  ];

  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handleViewAll = () => {
    // Navegar a la página de fotos
    navigate('/app/fotos');
  };

  return (
    <>
      <div className="my-photos-widget">
        <div className="photos-header">
          <h3>Mis Fotos</h3>
          <button onClick={handleViewAll} className="view-all-link">
            Ver Todas
          </button>
        </div>
        <div className="photos-grid-home">
          {photos.map((photo, index) => (
            <div 
              key={photo.id} 
              className="photo-item-home"
              onClick={() => handlePhotoClick(index)}
              style={{ cursor: 'pointer' }}
            >
              <img src={photo.image} alt={photo.title} />
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <PhotoLightbox
          photos={photos}
          initialIndex={selectedPhotoIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};

export default MyPhotos;
