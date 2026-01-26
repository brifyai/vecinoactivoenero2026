const PhotosSection = ({ activeTab, userPhotos, handlePhotoClick }) => {
  if (activeTab !== 'photos') return null;

  return (
    <div style={{ 
      width: '100%', 
      padding: '20px',
      background: '#f8f9fa'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <h3 style={{ marginBottom: '20px' }}>Fotos ({userPhotos.length})</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px',
          width: '100%'
        }}>
          {userPhotos.map((photo, index) => (
            <div 
              key={photo.id} 
              onClick={() => handlePhotoClick(index)} 
              style={{ 
                cursor: 'pointer',
                aspectRatio: '1',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <img 
                src={photo.url} 
                alt={`Foto ${photo.id}`} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div className="photo-overlay">
                <span>❤️ {photo.likes}</span>
              </div>
            </div>
          ))}
        </div>
        {userPhotos.length === 0 && (
          <p style={{ textAlign: 'center', padding: '40px 20px', color: '#65676b' }}>
            No hay fotos para mostrar
          </p>
        )}
      </div>
    </div>
  );
};

export default PhotosSection;