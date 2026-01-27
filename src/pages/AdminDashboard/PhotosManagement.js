import React, { useState, useEffect } from 'react';
import { useReduxAdmin } from '../../hooks/useReduxAdmin';
import supabasePhotosService from '../../services/supabasePhotosService';
import { showConfirmDialog } from '../../utils/sweetalert';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import './PhotosManagement.css';

const PhotosManagement = () => {
  const { user } = useReduxAdmin();
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('photos'); // 'photos' or 'albums'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Cargar TODAS las fotos de TODOS los usuarios
      const [allPhotos, allAlbums] = await Promise.all([
        supabasePhotosService.getPhotos(), // Sin filtro de usuario
        supabasePhotosService.getAlbums()  // Sin filtro de usuario
      ]);
      setPhotos(allPhotos || []);
      setAlbums(allAlbums || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    const result = await showConfirmDialog(
      '¿Eliminar foto?',
      'Esta acción no se puede deshacer',
      'warning'
    );
    
    if (result.isConfirmed) {
      try {
        // Como admin, necesitamos un método especial que no valide el userId
        await supabasePhotosService.deletePhoto(photoId, user.id);
        setPhotos(photos.filter(p => p.id !== photoId));
      } catch (error) {
        console.error('Error eliminando foto:', error);
      }
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    const result = await showConfirmDialog(
      '¿Eliminar álbum?',
      'Esta acción eliminará el álbum y todas sus fotos',
      'warning'
    );
    
    if (result.isConfirmed) {
      try {
        await supabasePhotosService.deleteAlbum(albumId, user.id);
        setAlbums(albums.filter(a => a.id !== albumId));
        // Recargar fotos
        loadData();
      } catch (error) {
        console.error('Error eliminando álbum:', error);
      }
    }
  };

  const handleViewPhoto = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const filteredPhotos = photos.filter(photo =>
    (photo.caption || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (photo.uploader?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAlbums = albums.filter(album =>
    album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (album.owner?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="photos-management">
      <div className="photos-management-header">
        <div className="header-left">
          <PhotoLibraryIcon style={{ fontSize: 32 }} />
          <div>
            <h1>Gestión de Fotos</h1>
            <p>Administra todas las fotos y álbumes de los usuarios</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{photos.length}</span>
            <span className="stat-label">Fotos Totales</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{albums.length}</span>
            <span className="stat-label">Álbumes</span>
          </div>
        </div>
      </div>

      <div className="photos-management-controls">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
            onClick={() => setActiveTab('photos')}
          >
            <PhotoLibraryIcon fontSize="small" />
            Todas las Fotos ({photos.length})
          </button>
          <button
            className={`tab ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => setActiveTab('albums')}
          >
            <FolderIcon fontSize="small" />
            Álbumes ({albums.length})
          </button>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar fotos o usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando...</p>
        </div>
      ) : (
        <>
          {activeTab === 'photos' && (
            <div className="photos-grid-admin">
              {filteredPhotos.length === 0 ? (
                <div className="empty-state">
                  <PhotoLibraryIcon style={{ fontSize: 80, color: '#ccc' }} />
                  <h3>No hay fotos</h3>
                  <p>Aún no hay fotos subidas por los usuarios</p>
                </div>
              ) : (
                filteredPhotos.map((photo) => (
                  <div key={photo.id} className="photo-card-admin">
                    <div className="photo-image">
                      <img src={photo.url} alt={photo.caption || 'Foto'} />
                      <div className="photo-overlay">
                        <button
                          className="action-btn view"
                          onClick={() => handleViewPhoto(photo)}
                          title="Ver detalles"
                        >
                          <VisibilityIcon />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeletePhoto(photo.id)}
                          title="Eliminar"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                    <div className="photo-info">
                      <div className="photo-user">
                        <PersonIcon fontSize="small" />
                        <span>{photo.uploader?.username || 'Usuario'}</span>
                      </div>
                      {photo.caption && (
                        <p className="photo-caption">{photo.caption}</p>
                      )}
                      {photo.album && (
                        <div className="photo-album">
                          <FolderIcon fontSize="small" />
                          <span>{photo.album.name}</span>
                        </div>
                      )}
                      <span className="photo-date">
                        {new Date(photo.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'albums' && (
            <div className="albums-grid-admin">
              {filteredAlbums.length === 0 ? (
                <div className="empty-state">
                  <FolderIcon style={{ fontSize: 80, color: '#ccc' }} />
                  <h3>No hay álbumes</h3>
                  <p>Aún no hay álbumes creados por los usuarios</p>
                </div>
              ) : (
                filteredAlbums.map((album) => (
                  <div key={album.id} className="album-card-admin">
                    <div className="album-image">
                      <img
                        src={album.cover_photo || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop'}
                        alt={album.name}
                      />
                      <div className="album-overlay">
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteAlbum(album.id)}
                          title="Eliminar álbum"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                    <div className="album-info">
                      <h3>{album.name}</h3>
                      <div className="album-user">
                        <PersonIcon fontSize="small" />
                        <span>{album.owner?.username || 'Usuario'}</span>
                      </div>
                      <p className="album-count">{album.photo_count || 0} fotos</p>
                      <span className="album-date">
                        {new Date(album.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Modal de detalles de foto */}
      {showPhotoModal && selectedPhoto && (
        <div className="photo-modal-overlay" onClick={() => setShowPhotoModal(false)}>
          <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowPhotoModal(false)}>
              ×
            </button>
            <div className="modal-content">
              <div className="modal-image">
                <img src={selectedPhoto.url} alt={selectedPhoto.caption || 'Foto'} />
              </div>
              <div className="modal-details">
                <h2>{selectedPhoto.caption || 'Sin título'}</h2>
                <div className="detail-row">
                  <strong>Usuario:</strong>
                  <span>{selectedPhoto.uploader?.username || 'Desconocido'}</span>
                </div>
                {selectedPhoto.album && (
                  <div className="detail-row">
                    <strong>Álbum:</strong>
                    <span>{selectedPhoto.album.name}</span>
                  </div>
                )}
                <div className="detail-row">
                  <strong>Fecha de subida:</strong>
                  <span>{new Date(selectedPhoto.uploaded_at).toLocaleString()}</span>
                </div>
                {selectedPhoto.tags && selectedPhoto.tags.length > 0 && (
                  <div className="detail-row">
                    <strong>Etiquetas:</strong>
                    <div className="tags">
                      {selectedPhoto.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="modal-actions">
                  <button
                    className="btn-delete"
                    onClick={() => {
                      setShowPhotoModal(false);
                      handleDeletePhoto(selectedPhoto.id);
                    }}
                  >
                    <DeleteIcon /> Eliminar Foto
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotosManagement;
