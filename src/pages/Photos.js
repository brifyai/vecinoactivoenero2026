import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useReduxPhotos } from '../hooks/useReduxPhotos';
import ProfileHeader from '../components/ProfileHeader/ProfileHeader';
import PhotoLightbox from '../components/PhotoLightbox/PhotoLightbox';
import { showInputDialog, showConfirmDialog } from '../utils/sweetalert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import FeedIcon from '@mui/icons-material/Feed';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import './Photos.css';

const Photos = () => {
  const navigate = useNavigate();
  const { isRightSidebarCollapsed } = useSidebar();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('albums');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);

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

    // Reset input
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

  const filteredAlbums = albums.filter(album =>
    album.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPhotos = photos.filter(photo =>
    (photo.caption || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <ProfileHeader />
      <div className={`photos-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="photos-tabs">
          <button className="tab" onClick={() => navigate('/app/linea-tiempo')}>
            <AccessTimeIcon fontSize="small" /> Línea de Tiempo
          </button>
          <button className="tab" onClick={() => navigate('/app/acerca-de')}>
            <InfoIcon fontSize="small" /> Acerca de
          </button>
          <button className="tab" onClick={() => navigate('/app/descubrir-vecinos')}>
            <GroupIcon fontSize="small" /> Vecinos
          </button>
          <button className="tab active">
            <PhotoLibraryIcon fontSize="small" /> Fotos
          </button>
          <div className="tab-right">
            <input 
              type="text" 
              placeholder="Buscar aquí..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="activity-feed-btn">
              <FeedIcon fontSize="small" /> Feed de Actividad
            </button>
          </div>
        </div>

        <div className="gallery-header">
          <h2>Galería</h2>
          <div className="gallery-actions">
            <button className="create-album-btn" onClick={handleCreateAlbum} disabled={loading}>
              <CreateNewFolderIcon fontSize="small" /> Crear Álbum
            </button>
            <button className="add-photo-btn" onClick={() => handleAddPhotos()} disabled={loading}>
              <AddPhotoAlternateIcon fontSize="small" /> Agregar Fotos
            </button>
          </div>
        </div>

        <div className="gallery-tabs">
          <button 
            className={`gallery-tab ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => setActiveTab('albums')}
          >
            Álbumes ({albums.length})
          </button>
          <button 
            className={`gallery-tab ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            Fotos ({photos.length})
          </button>
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando...</p>
          </div>
        )}

        <div className="albums-grid">
          {activeTab === 'albums' ? (
            <>
              <div className="create-album-card" onClick={handleCreateAlbum}>
                <div className="create-icon">
                  <AddCircleOutlineIcon style={{ fontSize: 60 }} />
                </div>
                <h3>Crear Álbum</h3>
                <p>crea un álbum para ordenar las imágenes</p>
              </div>
              
              {filteredAlbums.map((album) => {
                const albumPhotos = getAlbumPhotos(album.id);
                const coverPhoto = album.cover_photo || albumPhotos[0]?.url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop';
                
                return (
                  <div key={album.id} className="album-card">
                    <div className="album-image">
                      <img src={coverPhoto} alt={album.name} />
                      <div className="album-overlay">
                        <h3>{album.name}</h3>
                        <p>{album.photo_count || albumPhotos.length} Fotos</p>
                      </div>
                      <div className="album-actions">
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
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {filteredPhotos.length === 0 && !loading && (
                <div className="empty-state">
                  <PhotoLibraryIcon style={{ fontSize: 80, color: '#ccc' }} />
                  <h3>No hay fotos</h3>
                  <p>Comienza subiendo tus primeras fotos</p>
                  <button className="add-photo-btn" onClick={() => handleAddPhotos()}>
                    <AddPhotoAlternateIcon fontSize="small" /> Agregar Fotos
                  </button>
                </div>
              )}
              
              {filteredPhotos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className="photo-card" 
                  onClick={() => handlePhotoClick(index)}
                >
                  <img src={photo.url} alt={photo.caption || 'Foto'} />
                  <div className="photo-overlay">
                    <h4>{photo.caption || 'Sin título'}</h4>
                    <div className="photo-stats">
                      <span><FavoriteIcon fontSize="small" /> {photo.likes || 0}</span>
                    </div>
                  </div>
                  <button 
                    className="photo-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePhoto(photo.id);
                    }}
                    title="Eliminar foto"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Input oculto para subir archivos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {showLightbox && filteredPhotos.length > 0 && (
          <PhotoLightbox
            photos={filteredPhotos.map(p => ({
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
    </>
  );
};

export default Photos;
