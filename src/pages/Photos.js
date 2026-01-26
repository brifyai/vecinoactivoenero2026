import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import ProfileHeader from '../components/ProfileHeader/ProfileHeader';
import PhotoLightbox from '../components/PhotoLightbox/PhotoLightbox';
import { showInputDialog, showSuccessToast } from '../utils/sweetalert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import FeedIcon from '@mui/icons-material/Feed';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import './Photos.css';

const Photos = () => {
  const navigate = useNavigate();
  const { isRightSidebarCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState('albums');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [albums, setAlbums] = useState([
    { id: 1, title: 'Fotos de Portada', count: 5, image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=300&fit=crop' },
    { id: 2, title: 'Fotos de Perfil', count: 8, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop' },
    { id: 3, title: 'Viaje Familiar', count: 12, image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop' },
    { id: 4, title: 'Reunión de Amigos', count: 9, image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop' },
    { id: 5, title: 'Vacaciones en la Playa', count: 15, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop' },
    { id: 6, title: 'Mi Viaje', count: 7, image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=300&fit=crop' },
  ]);

  const allPhotos = [
    { id: 1, title: 'Atardecer en la playa', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop', description: 'Hermoso atardecer en la costa' },
    { id: 2, title: 'Montañas nevadas', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop', description: 'Vista panorámica de las montañas' },
    { id: 3, title: 'Ciudad nocturna', image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop', description: 'Luces de la ciudad por la noche' },
    { id: 4, title: 'Bosque otoñal', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', description: 'Colores del otoño en el bosque' },
    { id: 5, title: 'Playa tropical', image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=600&fit=crop', description: 'Paraíso tropical' },
    { id: 6, title: 'Arquitectura moderna', image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&h=600&fit=crop', description: 'Diseño arquitectónico contemporáneo' },
  ];

  const handleCreateAlbum = async () => {
    const result = await showInputDialog('Crear Álbum', 'Nombre del álbum', 'text');
    if (result.isConfirmed && result.value) {
      const newAlbum = {
        id: Date.now(),
        title: result.value,
        count: 0,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop'
      };
      setAlbums([...albums, newAlbum]);
      showSuccessToast('¡Álbum creado exitosamente!');
    }
  };

  const handleAddPhotos = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      showSuccessToast(`${files.length} archivo(s) agregado(s)`);
    };
    input.click();
  };

  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
    setShowLightbox(true);
  };

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPhotos = allPhotos.filter(photo =>
    photo.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <ProfileHeader />
      <div className={`photos-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="photos-tabs">
        <button className="tab" onClick={() => navigate('/linea-tiempo')}><AccessTimeIcon fontSize="small" /> Línea de Tiempo</button>
        <button className="tab" onClick={() => navigate('/acerca-de')}><InfoIcon fontSize="small" /> Acerca de</button>
        <button className="tab" onClick={() => navigate('/descubrir-vecinos')}><GroupIcon fontSize="small" /> Vecinos</button>
        <button className="tab active"><PhotoLibraryIcon fontSize="small" /> Fotos</button>
        <div className="tab-right">
          <input 
            type="text" 
            placeholder="Buscar aquí..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="activity-feed-btn"><FeedIcon fontSize="small" /> Feed de Actividad</button>
        </div>
      </div>

      <div className="gallery-header">
        <h2>Galería</h2>
        <div className="gallery-actions">
          <button className="create-album-btn" onClick={handleCreateAlbum}>
            <CreateNewFolderIcon fontSize="small" /> Crear Álbum
          </button>
          <button className="add-photo-btn" onClick={handleAddPhotos}>
            <AddPhotoAlternateIcon fontSize="small" /> Agregar Fotos/Video
          </button>
        </div>
      </div>

      <div className="gallery-tabs">
        <button 
          className={`gallery-tab ${activeTab === 'albums' ? 'active' : ''}`}
          onClick={() => setActiveTab('albums')}
        >
          Álbumes
        </button>
        <button 
          className={`gallery-tab ${activeTab === 'photos' ? 'active' : ''}`}
          onClick={() => setActiveTab('photos')}
        >
          Fotos
        </button>
      </div>

      <div className="albums-grid">
        {activeTab === 'albums' ? (
          <>
            <div className="create-album-card" onClick={handleCreateAlbum}>
              <div className="create-icon"><AddCircleOutlineIcon style={{ fontSize: 60 }} /></div>
              <h3>Crear Álbum</h3>
              <p>crea un álbum para ordenar las imágenes</p>
            </div>
            
            {filteredAlbums.map((album) => (
              <div key={album.id} className="album-card">
                <div className="album-image">
                  <img src={album.image} alt={album.title} />
                  <div className="album-overlay">
                    <h3>{album.title}</h3>
                    <p>{album.count} Fotos</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {filteredPhotos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="photo-card" 
                onClick={() => handlePhotoClick(index)}
                style={{ cursor: 'pointer' }}
              >
                <img src={photo.image} alt={photo.title} />
                <div className="photo-overlay">
                  <h4>{photo.title}</h4>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showLightbox && (
        <PhotoLightbox
          photos={allPhotos}
          initialIndex={selectedPhotoIndex}
          onClose={() => setShowLightbox(false)}
        />
      )}
      </div>
    </>
  );
};

export default Photos;
