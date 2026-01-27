import React, { useState, useRef } from 'react';
import { useReduxPhotos } from '../../hooks/useReduxPhotos';
import { useReduxAuth } from '../../hooks/useReduxAuth';
import { showInputDialog, showConfirmDialog } from '../../utils/sweetalert';
import PhotoLightbox from '../PhotoLightbox/PhotoLightbox';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import './PhotosSection.css';

const PhotosSection = ({ activeTab, isOwnProfile }) => {
  const { user } = useReduxAuth();
  const fileInputRef = useRef(null);
  const [viewMode, setViewMode] = useState('albums'); // 'albums' or 'photos'
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const {
    photos,
    albums,
    loading,
    createAlbum,
    deleteAlbum,
    updateAlbum,
    uploadPhoto,
    deletePhoto,
    getAlbumPhotos
  } = useReduxPhotos();

  if (activeTab !== 'photos') return null;

  const handleCreateAlbum = async () => {
    const result = await showInputDialog('Crear Álbum', 'Nombre del álbum', 'text');
    if (result.isConfirmed && result.value) {
      await createAlbum({
        name: result.value,
        description: ''
      });
    }
  };

  const handleEditAlbum = async (album) => {
    const result = await showInputDialog('Editar Álbum', 'Nombre del álbum', 'text', album.name);
    if (result.isConfirmed && result.value) {
      await updateAlbum(album.id, { name: result.value });
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    const result = await showConfirmDialog(
      '¿Eliminar álbum?',
      'Esta acción no se puede deshacer',
      'warning'
    );
    if (result.isConfirmed) {
      await deleteAlbum(albumId);
    }
  };

  const handleAddPhotos = (albumId = null) => {
    setSelectedAlbumId(albumId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        await uploadPhoto(file, {
          albumId: selectedAlbumId,
          caption: ''
        });
      }
    }

    e.target.value = '';
    setSelectedAlbumId(null);
  };

  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
    setShowLightbox(true);
  };

  const handleDeletePhoto = async (photoId) => {
    const result = await showConfirmDialog(
      '¿Eliminar foto?',
      'Esta acción no se puede deshacer',
      'warning'
    );
    if (result.isConfirmed) {
      await deletePhoto(photoId);
    }
  };

  return (
    <div className="photos-section-container">
      <div className="photos-section-content">
        {/* Header con botones de acción */}
        <div className="photos-section-header">
          <h2>Galería de Fotos</h2>
          {isOwnProfile && (
            <div className="photos-section-actions">
              <button className="create-album-btn" onClick={handleCreateAlbum} disabled={loading}>
                <CreateNewFolderIcon fontSize="small" /> Crear Álbum
              </button>
              <button className="add-photo-btn" onClick={() => handleAddPhotos()} disabled={loading}>
                <AddPhotoAlternateIcon fontSize="small" /> Agregar Fotos
              </button>
            </div>
          )}
        </div>

        {/* Tabs: Álbumes / Fotos */}
        <div className="photos-view-tabs">
          <button 
            className={`photos-view-tab ${viewMode === 'albums' ? 'active' : ''}`}
            onClick={() => setViewMode('albums')}
          >
            Álbumes ({albums.length})
          </button>
          <button 
            className={`photos-view-tab ${viewMode === 'photos' ? 'active' : ''}`}
            onClick={() => setViewMode('photos')}
          >
            Todas las Fotos ({photos.length})
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="photos-loading">
            <div className="loading-spinner"></div>
            <p>Cargando...</p>
          </div>
        )}

        {/* Vista de Álbumes */}
        {viewMode === 'albums' && !loading && (
          <div className="albums-grid-profile">
            {isOwnProfile && (
              <div className="create-album-card-profile" onClick={handleCreateAlbum}>
                <div className="create-icon">
                  <AddCircleOutlineIcon style={{ fontSize: 60 }} />
                </div>
                <h3>Crear Álbum</h3>
                <p>Organiza tus fotos en álbumes</p>
              </div>
            )}
            
            {albums.map((album) => {
              const albumPhotos = getAlbumPhotos(album.id);
              const coverPhoto = album.cover_photo || albumPhotos[0]?.url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop';
              
              return (
                <div key={album.id} className="album-card-profile">
                  <div className="album-image-profile">
                    <img src={coverPhoto} alt={album.name} />
                    <div className="album-overlay-profile">
                      <h3>{album.name}</h3>
                      <p>{album.photo_count || albumPhotos.length} Fotos</p>
                    </div>
                    {isOwnProfile && (
                      <div className="album-actions-profile">
                        <button 
                          className="album-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddPhotos(album.id);
                          }}
                          title="Agregar fotos"
                        >
                          <AddPhotoAlternateIcon />
                        </button>
                        <button 
                          className="album-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAlbum(album);
                          }}
                          title="Editar álbum"
                        >
                          <EditIcon />
                        </button>
                        <button 
                          className="album-action-btn delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAlbum(album.id);
                          }}
                          title="Eliminar álbum"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {albums.length === 0 && !isOwnProfile && (
              <div className="empty-state-profile">
                <PhotoLibraryIcon style={{ fontSize: 80, color: '#ccc' }} />
                <h3>No hay álbumes</h3>
                <p>Este usuario aún no ha creado álbumes</p>
              </div>
            )}
          </div>
        )}

        {/* Vista de Todas las Fotos */}
        {viewMode === 'photos' && !loading && (
          <div className="photos-grid-profile">
            {photos.length === 0 ? (
              <div className="empty-state-profile">
                <PhotoLibraryIcon style={{ fontSize: 80, color: '#ccc' }} />
                <h3>No hay fotos</h3>
                <p>{isOwnProfile ? 'Comienza subiendo tus primeras fotos' : 'Este usuario aún no ha subido fotos'}</p>
                {isOwnProfile && (
                  <button className="add-photo-btn" onClick={() => handleAddPhotos()}>
                    <AddPhotoAlternateIcon fontSize="small" /> Agregar Fotos
                  </button>
                )}
              </div>
            ) : (
              photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className="photo-card-profile" 
                  onClick={() => handlePhotoClick(index)}
                >
                  <img src={photo.url} alt={photo.caption || 'Foto'} />
                  <div className="photo-overlay-profile">
                    <h4>{photo.caption || 'Sin título'}</h4>
                    <div className="photo-stats-profile">
                      <span><FavoriteIcon fontSize="small" /> {photo.likes || 0}</span>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button 
                      className="photo-delete-btn-profile"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                      title="Eliminar foto"
                    >
                      <DeleteIcon />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Input oculto para subir archivos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Lightbox */}
        {showLightbox && photos.length > 0 && (
          <PhotoLightbox
            photos={photos.map(p => ({
              id: p.id,
              image: p.url,
              title: p.caption || 'Sin título',
              description: p.caption || ''
            }))}
            initialIndex={selectedPhotoIndex}
            onClose={() => setShowLightbox(false)}
          />
        )}
      </div>
    </div>
  );
};

export default PhotosSection;