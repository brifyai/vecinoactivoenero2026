import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNeighborhood } from '../../context/NeighborhoodContext';
import { useReduxPosts as usePosts } from '../../hooks/useReduxPosts';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import Post from '../../components/Post/Post';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import ParkIcon from '@mui/icons-material/Park';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './NeighborhoodProfile.css';

const NeighborhoodProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getNeighborhoodById } = useNeighborhood();
  const { posts } = usePosts();
  const { user } = useAuth();
  const [neighborhood, setNeighborhood] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // posts, neighbors, info

  useEffect(() => {
    const uvData = getNeighborhoodById(id);
    setNeighborhood(uvData);
  }, [id]);

  if (!neighborhood) {
    return <div className="loading">Cargando...</div>;
  }

  const neighborhoodPosts = posts.filter(p => p.neighborhoodId === neighborhood.id);
  const isMyNeighborhood = user?.neighborhoodId === neighborhood.id;

  return (
    <div className="neighborhood-profile">
      <div className="neighborhood-profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </button>
        <div className="header-content">
          <div className="uv-badge">UV {neighborhood.codigo}</div>
          <h1>{neighborhood.nombre}</h1>
          <p className="location">
            <LocationOnIcon />
            {neighborhood.comuna}, {neighborhood.region}
          </p>
          {isMyNeighborhood && (
            <div className="my-neighborhood-badge">
              <VerifiedIcon />
              Tu Vecindario
            </div>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <PeopleIcon className="stat-icon" />
          <div className="stat-info">
            <div className="stat-value">{neighborhood.personas?.toLocaleString('es-CL') || 0}</div>
            <div className="stat-label">Habitantes</div>
          </div>
        </div>
        <div className="stat-card">
          <HomeIcon className="stat-icon" />
          <div className="stat-info">
            <div className="stat-value">{neighborhood.hogares?.toLocaleString('es-CL') || 0}</div>
            <div className="stat-label">Hogares</div>
          </div>
        </div>
        <div className="stat-card">
          <ParkIcon className="stat-icon" />
          <div className="stat-info">
            <div className="stat-value">{neighborhoodPosts.length}</div>
            <div className="stat-label">Publicaciones</div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📝 Publicaciones
        </button>
        <button
          className={`tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          ℹ️ Información
        </button>
        <button
          className={`tab ${activeTab === 'neighbors' ? 'active' : ''}`}
          onClick={() => setActiveTab('neighbors')}
        >
          👥 Vecinos
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'posts' && (
          <div className="posts-section">
            {neighborhoodPosts.length > 0 ? (
              neighborhoodPosts.map(post => (
                <Post key={post.id} post={post} />
              ))
            ) : (
              <div className="no-content">
                <p>No hay publicaciones en este vecindario aún</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="info-section">
            <div className="info-card">
              <h3>Información Demográfica</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Población:</span>
                  <span className="info-value">{neighborhood.personas?.toLocaleString('es-CL') || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Hogares:</span>
                  <span className="info-value">{neighborhood.hogares?.toLocaleString('es-CL') || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Comuna:</span>
                  <span className="info-value">{neighborhood.comuna}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Región:</span>
                  <span className="info-value">{neighborhood.region}</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Contacto Junta de Vecinos</h3>
              <p className="coming-soon">Información próximamente disponible</p>
            </div>
          </div>
        )}

        {activeTab === 'neighbors' && (
          <div className="neighbors-section">
            <div className="coming-soon-card">
              <PeopleIcon style={{ fontSize: 60, opacity: 0.3 }} />
              <h3>Vecinos del Barrio</h3>
              <p>Esta funcionalidad estará disponible próximamente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeighborhoodProfile;
