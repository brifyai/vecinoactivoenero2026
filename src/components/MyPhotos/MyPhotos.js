import { useState } from 'react';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useReduxPhotos } from '../../hooks/useReduxPhotos';
import { useNavigate } from 'react-router-dom';
import PhotoLightbox from '../PhotoLightbox/PhotoLightbox';
import './MyPhotos.css';

const MyPhotos = () => {
  const { user } = useAuth();
  const { photos, loading } = useReduxPhotos();
  const navigate = useNavigate();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Mostrar solo las primeras 6 fotos
  const displayPhotos = photos.slice(0, 6);

  // Si no hay fotos, mostrar fotos de ejemplo
  const placeholderPhotos = [
    { id: 1, title: 'Foto 1', url: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=200&h=200&fit=crop', caption: 'Mi foto' },
    { id: 2, title: 'Foto 2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop', caption: 'Mi foto' },
    { id: 3, title: 'Foto 3', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop', caption: 'Mi foto' },
    { id: 4, title: 'Foto 4', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop', caption: 'Mi foto' },
    { id: 5, title: 'Foto 5', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', caption: 'Mi foto' },
    { id: 6, title: 'Foto 6', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop', caption: 'Mi foto' },
  ];

  const photosToShow = displayPhotos.length > 0 ? displayPhotos : placeholderPhotos;

  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handleViewAll = () => {
    // Navegar a la página de fotos del panel de administración
    navigate('/app/admin/dashboard/photos');
  };

  if (loading) {
    return (
      <div className="my-photos-widget">
        <div className="photos-header">
          <h3>Mis Fotos</h3>
        </div>
        <div className="photos-loading">
          <div className="loading-spinner-small"></div>
          <p>Cargando fotos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="my-photos-widget">
        <div className="photos-header">
          <h3>Mis Fotos</h3>
          <button onClick={handleViewAll} className="view-all-link">
            Ver Todas {photos.length > 0 && `(${photos.length})`}
          </button>
        </div>
        <div className="photos-grid-home">
          {photosToShow.map((photo, index) => (
            <div 
              key={photo.id} 
              className="photo-item-home"
              onClick={() => handlePhotoClick(index)}
              style={{ cursor: 'pointer' }}
            >
              <img src={photo.url} alt={photo.caption || photo.title || 'Foto'} />
            </div>
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <PhotoLightbox
          photos={photosToShow.map(p => ({
            id: p.id,
            image: p.url,
            title: p.caption || p.title || 'Sin título',
            description: p.caption || ''
          }))}
          initialIndex={selectedPhotoIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
};

export default MyPhotos;
