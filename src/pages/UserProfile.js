import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import storageService from '../services/storageService';
import ProfileHeader from '../components/ProfileHeader/ProfileHeader';
import Post from '../components/Post/Post';
import BirthdayWidget from '../components/BirthdayWidget/BirthdayWidget';
import EventsWidget from '../components/EventsWidget/EventsWidget';
import ActivityNewsWidget from '../components/ActivityNewsWidget/ActivityNewsWidget';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SearchIcon from '@mui/icons-material/Search';
import FeedIcon from '@mui/icons-material/Feed';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import { showErrorToast, showSuccessToast } from '../utils/sweetalert';
import './Timeline.css';

const UserProfile = () => {
  const { username, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();
  const [profileUser, setProfileUser] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visiblePosts, setVisiblePosts] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'timeline');
  const [userFriends, setUserFriends] = useState([]);
  const [userPhotos, setUserPhotos] = useState([]);

  // Determinar tipo de ruta
  const isPage = location.pathname.startsWith('/pagina/') || location.pathname.startsWith('/paginas/');
  const isGroup = location.pathname.startsWith('/grupo/');
  const isEvent = location.pathname.startsWith('/evento/');
  const isProject = location.pathname.startsWith('/proyecto/');
  const isHelp = location.pathname.startsWith('/ayuda/');
  const isResource = location.pathname.startsWith('/recursos/');
  const identifier = isPage || isGroup || isEvent || isProject || isHelp || isResource ? slug : username;

  useEffect(() => {
    if (!identifier) {
      setLoading(false);
      return;
    }

    if (isPage) {
      // Buscar página usando storageService
      const pages = storageService.getPages();
      const foundPage = pages.find(p => p.slug === identifier || p.id === parseInt(identifier));

      if (foundPage) {
        setPageData(foundPage);
        setProfileUser({
          id: foundPage.id,
          name: foundPage.name,
          username: foundPage.slug,
          email: foundPage.email,
          avatar: foundPage.image || foundPage.avatar,
          bio: foundPage.description || `Página: ${foundPage.name}`,
          isPage: true
        });
      } else {
        showErrorToast('Página no encontrada');
        navigate('/paginas');
      }
    } else if (isGroup) {
      // Buscar grupo usando storageService
      const groups = storageService.getGroups();
      const foundGroup = groups.find(g => g.slug === identifier || g.id === parseInt(identifier));

      if (foundGroup) {
        setProfileUser({
          id: foundGroup.id,
          name: foundGroup.name,
          username: foundGroup.slug,
          email: foundGroup.description,
          avatar: foundGroup.image,
          bio: `Grupo: ${foundGroup.name}`,
          members: foundGroup.members,
          isGroup: true
        });
      } else {
        showErrorToast('Grupo no encontrado');
        navigate('/grupos');
      }
    } else if (isEvent) {
      // Buscar evento en localStorage
      const events = JSON.parse(localStorage.getItem('events') || '[]');
      const foundEvent = events.find(e => e.slug === identifier);

      if (foundEvent) {
        const eventDate = new Date(foundEvent.date);
        setProfileUser({
          id: foundEvent.id,
          name: foundEvent.title,
          username: foundEvent.slug,
          email: foundEvent.location,
          avatar: foundEvent.image,
          bio: `Evento: ${foundEvent.title}`,
          date: eventDate.toLocaleDateString('es-CL'),
          time: eventDate.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
          attendees: foundEvent.attendees,
          isEvent: true
        });
      } else {
        showErrorToast('Evento no encontrado');
        navigate('/eventos');
      }
    } else if (isProject) {
      // Buscar proyecto en localStorage
      const projects = JSON.parse(localStorage.getItem('communityProjects') || '[]');
      const foundProject = projects.find(p => p.slug === identifier);

      if (foundProject) {
        setProfileUser({
          id: foundProject.id,
          name: foundProject.title,
          username: foundProject.slug,
          email: foundProject.category,
          avatar: foundProject.creatorAvatar,
          bio: foundProject.description,
          status: foundProject.status,
          votes: foundProject.votes,
          volunteers: foundProject.volunteers,
          budget: foundProject.budget,
          creatorName: foundProject.creatorName,
          neighborhoodName: foundProject.neighborhoodName,
          isProject: true
        });
      } else {
        showErrorToast('Proyecto no encontrado');
        navigate('/proyectos');
      }
    } else if (isHelp) {
      // Buscar solicitud de ayuda en localStorage
      const helpRequests = JSON.parse(localStorage.getItem('helpRequests') || '[]');
      const foundHelp = helpRequests.find(h => h.slug === identifier);

      if (foundHelp) {
        setProfileUser({
          id: foundHelp.id,
          name: foundHelp.title,
          username: foundHelp.slug,
          email: foundHelp.type,
          avatar: foundHelp.requesterAvatar,
          bio: foundHelp.description,
          status: foundHelp.status,
          urgency: foundHelp.urgency,
          location: foundHelp.location,
          offers: foundHelp.offers,
          requesterName: foundHelp.requesterName,
          neighborhoodName: foundHelp.neighborhoodName,
          isHelp: true
        });
      } else {
        showErrorToast('Solicitud de ayuda no encontrada');
        navigate('/solicitudes-ayuda');
      }
    } else if (isResource) {
      // Buscar recurso compartido en localStorage
      const sharedResources = JSON.parse(localStorage.getItem('sharedResources') || '[]');
      const foundResource = sharedResources.find(r => r.slug === identifier);

      if (foundResource) {
        setProfileUser({
          id: foundResource.id,
          name: foundResource.name,
          username: foundResource.slug,
          email: foundResource.category,
          avatar: foundResource.ownerAvatar,
          bio: foundResource.description,
          condition: foundResource.condition,
          maxLoanDays: foundResource.maxLoanDays,
          requiresDeposit: foundResource.requiresDeposit,
          depositAmount: foundResource.depositAmount,
          totalLoans: foundResource.totalLoans,
          isAvailable: foundResource.isAvailable,
          ownerName: foundResource.ownerName,
          neighborhoodName: foundResource.neighborhoodName,
          isResource: true
        });
      } else {
        showErrorToast('Recurso no encontrado');
        navigate('/recursos-compartidos');
      }
    } else {
      // Buscar usuario
      // Primero buscar en el usuario actual (currentUser)
      if (currentUser?.username === identifier) {
        setProfileUser(currentUser);
        setLoading(false);
        return;
      }
      
      // Luego buscar en la lista de usuarios (usar la misma clave que storageService)
      const users = storageService.getUsers();
      
      // Buscar por username exacto o por nombre convertido a slug
      const foundUser = users.find(u => 
        u.username === identifier || 
        u.name.toLowerCase().replace(/\s+/g, '-') === identifier
      );

      if (foundUser) {
        setProfileUser(foundUser);
      } else {
        // No redirigir, simplemente dejar profileUser como null
        // y mostrar un mensaje en la página
      }
    }
    setLoading(false);
  }, [identifier, currentUser, navigate, isPage, isGroup, isEvent, isProject, isHelp, isResource]);

  // Cargar amigos y fotos del usuario
  useEffect(() => {
    if (profileUser?.id) {
      // Obtener amigos del usuario
      const allUsers = storageService.getUsers();
      const friends = allUsers.filter(u => u.id !== profileUser.id).slice(0, 9); // Primeros 9 amigos
      setUserFriends(friends);

      // Generar fotos de ejemplo del usuario
      const photos = [
        { id: 1, url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop', likes: 45 },
        { id: 2, url: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=400&fit=crop', likes: 32 },
        { id: 3, url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=400&fit=crop', likes: 28 },
        { id: 4, url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&h=400&fit=crop', likes: 56 },
        { id: 5, url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop', likes: 41 },
        { id: 6, url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop', likes: 38 },
        { id: 7, url: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=400&fit=crop', likes: 52 },
        { id: 8, url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop', likes: 29 },
        { id: 9, url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=400&fit=crop', likes: 47 }
      ];
      setUserPhotos(photos);
    }
  }, [profileUser]);

  const allPosts = [
    {
      id: 1,
      author: profileUser?.name || 'Usuario',
      time: 'hace 30 min',
      avatar: profileUser?.avatar || 'https://i.pravatar.cc/50?img=1',
      content: '¡Hoy es el cumpleaños de nuestros tres lindos cachorros!',
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=500&fit=crop',
      hashtags: ['#cachorros', '#cumpleaños', '#perros'],
      likes: 175,
      comments: 4368,
      shares: 936,
      reactions: ['😊', '😍', '😮', '👍']
    },
    {
      id: 2,
      author: profileUser?.name || 'Usuario',
      time: 'hace 1 hora',
      avatar: profileUser?.avatar || 'https://i.pravatar.cc/50?img=16',
      content: 'Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto.',
      image: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&h=500&fit=crop',
      hashtags: ['#estilodeVida', '#inspiración'],
      likes: 234,
      comments: 89,
      shares: 45,
      reactions: ['😊', '❤️', '👍']
    }
  ];

  const posts = allPosts.slice(0, visiblePosts);

  const loadMore = () => {
    setVisiblePosts(prev => Math.min(prev + 3, allPosts.length));
  };

  if (loading) {
    return (
      <div className="timeline">
        <div className="loading-profile">Cargando perfil...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className={`timeline ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="user-not-found">
          <h2>Usuario no encontrado</h2>
          <p>El usuario "{identifier}" no existe o ha sido eliminado.</p>
          <button onClick={() => navigate('/vecinos')}>Volver a Vecinos</button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser?.id;

  return (
    <div className={`timeline ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ProfileHeader 
        user={{
          id: profileUser.id,
          name: profileUser.name,
          username: profileUser.username,
          email: profileUser.email,
          avatar: profileUser.avatar,
          coverPhoto: profileUser.cover,
          bio: profileUser.bio,
          location: profileUser.location,
          following: profileUser.following,
          followers: profileUser.followers,
          verified: profileUser.verified || false,
          neighborhoodName: profileUser.neighborhoodName,
          neighborhoodCode: profileUser.neighborhoodCode,
          isVerifiedNeighbor: profileUser.isVerifiedNeighbor
        }}
        isOwnProfile={isOwnProfile}
      />
      
      <div className="timeline-tabs">
        <button 
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <AccessTimeIcon fontSize="small" /> Línea de tiempo
        </button>
        <button 
          className={`tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          <InfoIcon fontSize="small" /> Acerca de
        </button>
        <button 
          className={`tab ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          <GroupIcon fontSize="small" /> Vecinos
        </button>
        <button 
          className={`tab ${activeTab === 'photos' ? 'active' : ''}`}
          onClick={() => setActiveTab('photos')}
        >
          <PhotoLibraryIcon fontSize="small" /> Fotos
        </button>
        <div className="tab-right">
          <input 
            type="text" 
            placeholder="Buscar aquí..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="timeline-content">
        {isOwnProfile && activeTab === 'timeline' && (
          <div className="activity-feed">
            <div className="feed-header">
              <h3>Feed de actividad</h3>
              <div className="feed-actions">
                <button><RefreshIcon fontSize="small" /></button>
                <button><SettingsIcon fontSize="small" /></button>
              </div>
            </div>
            <div className="feed-timeline">
              <h4>Hoy</h4>
              <div className="feed-item">
                <img src="https://i.pravatar.cc/40?img=12" alt="" />
                <div>
                  <p><strong>Usuario</strong> comentó en una foto</p>
                  <span>hace 3 horas</span>
                </div>
              </div>
              <div className="feed-item">
                <img src="https://i.pravatar.cc/40?img=1" alt="" />
                <div>
                  <p><strong>Usuario</strong> le gustó una foto</p>
                  <span>hace 5 horas</span>
                </div>
              </div>
              <button className="load-more-feed-btn">Cargar más</button>
            </div>
          </div>
        )}

        <div className="posts-container">
          {activeTab === 'timeline' && (
            <>
              {posts.length > 0 ? (
                <>
                  {posts.map(post => (
                    <Post key={post.id} post={post} />
                  ))}
                  
                  {visiblePosts < allPosts.length && (
                    <button className="load-more-btn" onClick={loadMore}>
                      Cargar más
                    </button>
                  )}
                </>
              ) : (
                <div className="no-posts">
                  <p>{isOwnProfile ? 'Aún no has publicado nada.' : 'Este usuario aún no ha publicado nada.'}</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'about' && (
            <div className="profile-info-card">
              <h3>Información Personal</h3>
              {profileUser.bio && (
                <div className="info-item">
                  <strong>Biografía:</strong>
                  <p>{profileUser.bio}</p>
                </div>
              )}
              {profileUser.email && (
                <div className="info-item">
                  <strong>Email:</strong>
                  <p>{profileUser.email}</p>
                </div>
              )}
              {profileUser.location && (
                <div className="info-item">
                  <strong>Ubicación:</strong>
                  <p>{profileUser.location}</p>
                </div>
              )}
              {profileUser.neighborhood && (
                <div className="info-item">
                  <strong>Barrio:</strong>
                  <p>{profileUser.neighborhood}</p>
                </div>
              )}
              {profileUser.address && (
                <div className="info-item">
                  <strong>Dirección:</strong>
                  <p>{profileUser.address}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="friends-grid-container">
              <h3 style={{ marginBottom: '20px' }}>Vecinos ({userFriends.length})</h3>
              <div className="friends-grid">
                {userFriends.map(friend => (
                  <div key={friend.id} className="friend-card-small" onClick={() => navigate(`/${friend.username}`)}>
                    <img src={friend.avatar} alt={friend.name} />
                    <h4>{friend.name}</h4>
                    <p>{friend.neighborhood || 'Vecino'}</p>
                  </div>
                ))}
              </div>
              {userFriends.length === 0 && (
                <p style={{ textAlign: 'center', padding: '40px 20px', color: '#65676b' }}>
                  No hay vecinos para mostrar
                </p>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="photos-grid-container">
              <h3 style={{ marginBottom: '20px' }}>Fotos ({userPhotos.length})</h3>
              <div className="photos-grid">
                {userPhotos.map(photo => (
                  <div key={photo.id} className="photo-card">
                    <img src={photo.url} alt={`Foto ${photo.id}`} />
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
          )}
        </div>
        
        {activeTab === 'timeline' && (
          <div className="widgets-sidebar">
            {isOwnProfile ? (
              <>
                <BirthdayWidget />
                <EventsWidget />
                <ActivityNewsWidget />
              </>
            ) : (
              <div className="profile-info-card">
                <h3>Información</h3>
                {profileUser.bio && (
                  <div className="info-item">
                    <strong>Biografía:</strong>
                    <p>{profileUser.bio}</p>
                  </div>
                )}
                {profileUser.neighborhoodName && (
                  <div className="info-item">
                    <strong>Unidad Vecinal:</strong>
                    <p>{profileUser.neighborhoodName} ({profileUser.neighborhoodCode})</p>
                  </div>
                )}
                <div className="info-item">
                  <strong>URL del perfil:</strong>
                  <div className="url-display">
                    {isPage ? `vecinoactivo.cl/pagina/${profileUser.username}` : isGroup ? `vecinoactivo.cl/grupo/${profileUser.username}` : isEvent ? `vecinoactivo.cl/evento/${profileUser.username}` : isProject ? `vecinoactivo.cl/proyecto/${profileUser.username}` : isHelp ? `vecinoactivo.cl/ayuda/${profileUser.username}` : isResource ? `vecinoactivo.cl/recursos/${profileUser.username}` : `vecinoactivo.cl/${profileUser.username}`}
                  </div>
                </div>
              {isGroup && profileUser.members && (
                <div className="info-item">
                  <strong>Miembros:</strong>
                  <p>{profileUser.members.length} miembros</p>
                </div>
              )}
              {isEvent && profileUser.date && (
                <>
                  <div className="info-item">
                    <strong>Fecha:</strong>
                    <p>{profileUser.date}</p>
                  </div>
                  <div className="info-item">
                    <strong>Hora:</strong>
                    <p>{profileUser.time}</p>
                  </div>
                  <div className="info-item">
                    <strong>Ubicación:</strong>
                    <p>{profileUser.email}</p>
                  </div>
                  <div className="info-item">
                    <strong>Asistentes:</strong>
                    <p>{profileUser.attendees?.length || 0} personas</p>
                  </div>
                </>
              )}
              {isProject && (
                <>
                  <div className="info-item">
                    <strong>Estado:</strong>
                    <p>{profileUser.status}</p>
                  </div>
                  <div className="info-item">
                    <strong>Votos:</strong>
                    <p>{profileUser.votes}</p>
                  </div>
                  <div className="info-item">
                    <strong>Voluntarios:</strong>
                    <p>{profileUser.volunteers?.length || 0}</p>
                  </div>
                  <div className="info-item">
                    <strong>Presupuesto:</strong>
                    <p>${profileUser.budget || 0}</p>
                  </div>
                  <div className="info-item">
                    <strong>Creador:</strong>
                    <p>{profileUser.creatorName}</p>
                  </div>
                  <div className="info-item">
                    <strong>Unidad Vecinal:</strong>
                    <p>{profileUser.neighborhoodName}</p>
                  </div>
                </>
              )}
              {isHelp && (
                <>
                  <div className="info-item">
                    <strong>Estado:</strong>
                    <p>{profileUser.status}</p>
                  </div>
                  <div className="info-item">
                    <strong>Urgencia:</strong>
                    <p>{profileUser.urgency}</p>
                  </div>
                  <div className="info-item">
                    <strong>Tipo:</strong>
                    <p>{profileUser.email}</p>
                  </div>
                  {profileUser.location && (
                    <div className="info-item">
                      <strong>Ubicación:</strong>
                      <p>{profileUser.location}</p>
                    </div>
                  )}
                  <div className="info-item">
                    <strong>Ofertas de ayuda:</strong>
                    <p>{profileUser.offers?.length || 0}</p>
                  </div>
                  <div className="info-item">
                    <strong>Solicitante:</strong>
                    <p>{profileUser.requesterName}</p>
                  </div>
                  <div className="info-item">
                    <strong>Unidad Vecinal:</strong>
                    <p>{profileUser.neighborhoodName}</p>
                  </div>
                </>
              )}
              {isResource && (
                <>
                  <div className="info-item">
                    <strong>Categoría:</strong>
                    <p>{profileUser.email}</p>
                  </div>
                  <div className="info-item">
                    <strong>Condición:</strong>
                    <p>{profileUser.condition}</p>
                  </div>
                  <div className="info-item">
                    <strong>Disponible:</strong>
                    <p>{profileUser.isAvailable ? 'Sí' : 'No'}</p>
                  </div>
                  <div className="info-item">
                    <strong>Días máx. de préstamo:</strong>
                    <p>{profileUser.maxLoanDays}</p>
                  </div>
                  {profileUser.requiresDeposit && (
                    <div className="info-item">
                      <strong>Depósito:</strong>
                      <p>${profileUser.depositAmount}</p>
                    </div>
                  )}
                  <div className="info-item">
                    <strong>Préstamos realizados:</strong>
                    <p>{profileUser.totalLoans}</p>
                  </div>
                  <div className="info-item">
                    <strong>Dueño:</strong>
                    <p>{profileUser.ownerName}</p>
                  </div>
                  <div className="info-item">
                    <strong>Unidad Vecinal:</strong>
                    <p>{profileUser.neighborhoodName}</p>
                  </div>
                </>
              )}
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
