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

  // Mostrar solo las primeras 6 fotos reales del usuario
  const displayPhotos = photos.slice(0, 6);

  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handleViewAll = () => {
    // Navegar al perfil del admin con el tab de fotos activo
    navigate('/app/admin', { state: { activeTab: 'photos' } });
  };

  const handleAddPhotos = () => {
    // Navegar al perfil para agregar fotos
    navigate('/app/admin', { state: { activeTab: 'photos' } });
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
          {photos.length > 0 && (
            <button onClick={handleViewAll} className="view-all-link">
              Ver Todas ({photos.length})
            </button>
          )}
        </div>
        
        {displayPhotos.length > 0 ? (
          <div className="photos-grid-home">
            {displayPhotos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="photo-item-home"
                onClick={() => handlePhotoClick(index)}
                style={{ cursor: 'pointer' }}
              >
                <img src={photo.url} alt={photo.caption || 'Foto'} />
              </div>
            ))}
          </div>
        ) : (
          <div className="photos-empty-state">
            <div className="empty-icon">📷</div>
            <p>Aún no tienes fotos</p>
            <button onClick={handleAddPhotos} className="add-photos-btn">
              Agregar Fotos
            </button>
          </div>
        )}
      </div>

      {lightboxOpen && displayPhotos.length > 0 && (
        <PhotoLightbox
          photos={displayPhotos.map(p => ({
            id: p.id,
            image: p.url,
            title: p.caption || 'Sin título',
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
