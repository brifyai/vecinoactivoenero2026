import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';
import { formatNumber } from '../utils/formatNumber';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import ProfileHeader from '../components/ProfileHeader/ProfileHeader';
import FriendCard from '../components/FriendCard/FriendCard';
import SkeletonLoader from '../components/SkeletonLoader/SkeletonLoader';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NearMeIcon from '@mui/icons-material/NearMe';
import './Friends.css';

// Función para calcular distancia usando la fórmula de Haversine
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distancia en km
};

const Friends = () => {
  const navigate = useNavigate();
  const { isRightSidebarCollapsed } = useSidebar();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, verified, same-neighborhood, nearby
  const friendsData = [
    { id: 1, name: 'Carlos Mendoza', username: 'carlosmendoza', email: 'carlos.mendoza@gmail.com', avatar: 'https://i.pravatar.cc/100?img=11', following: 432, likes: 15234, followers: 5432, verified: true, neighborhood: 'Chamisero', address: 'Avenida Chamisero 10460', city: 'Colina', latitude: -33.2000, longitude: -70.6500 },
    { id: 2, name: 'Maria Elena Rodriguez', username: 'mariaelena', email: 'maria.elena@outlook.com', avatar: 'https://i.pravatar.cc/100?img=5', following: 678, likes: 23456, followers: 7890, verified: true, neighborhood: 'Chamisero', address: 'Avenida Chamisero 10500', city: 'Colina', latitude: -33.2010, longitude: -70.6510 },
    { id: 3, name: 'Juan Pablo Torres', username: 'jptorres', email: 'juan.torres@gmail.com', avatar: 'https://i.pravatar.cc/100?img=12', following: 234, likes: 12345, followers: 4567, verified: false, neighborhood: 'Chamisero', address: 'Avenida Chamisero 10550', city: 'Colina', latitude: -33.2020, longitude: -70.6520 },
    { id: 4, name: 'Ana Maria Fernandez', username: 'anafernandez', email: 'ana.fernandez@gmail.com', avatar: 'https://i.pravatar.cc/100?img=9', following: 890, likes: 34567, followers: 9876, verified: true, neighborhood: 'Chamisero', address: 'Camino Los Cerezos 150', city: 'Colina', latitude: -33.2030, longitude: -70.6530 },
    { id: 5, name: 'Josephin Water', username: 'josephinwater', email: 'josephin.water@gmail.com', avatar: 'https://i.pravatar.cc/100?img=8', following: 567, likes: 28901, followers: 6543, verified: true, neighborhood: 'Chamisero', address: 'Avenida Chamisero 10460', city: 'Colina', latitude: -33.2000, longitude: -70.6500 },
    { id: 6, name: 'Roberto Carlos Gomez', username: 'rgomez', email: 'roberto.gomez@gmail.com', avatar: 'https://i.pravatar.cc/100?img=13', following: 345, likes: 19876, followers: 5678, verified: false, neighborhood: 'Chamisero', address: 'Calle Los Aromos 200', city: 'Colina', latitude: -33.2040, longitude: -70.6540 },
    { id: 7, name: 'Patricia Vasquez Lopez', username: 'patyvasquez', email: 'patricia.vasquez@gmail.com', avatar: 'https://i.pravatar.cc/100?img=10', following: 789, likes: 31234, followers: 8765, verified: true, neighborhood: 'Chamisero', address: 'Camino Los Maitenes 250', city: 'Colina', latitude: -33.2050, longitude: -70.6550 },
    { id: 8, name: 'Miguel Angel Santos', username: 'miguelsantos', email: 'miguel.santos@gmail.com', avatar: 'https://i.pravatar.cc/100?img=14', following: 456, likes: 21098, followers: 6789, verified: false, neighborhood: 'Chamisero', address: 'Avenida Chamisero 10600', city: 'Colina', latitude: -33.2060, longitude: -70.6560 },
    { id: 9, name: 'Carmen Gloria Rojas', username: 'carmenrojas', email: 'carmen.rojas@gmail.com', avatar: 'https://i.pravatar.cc/100?img=15', following: 612, likes: 25678, followers: 7234, verified: true, neighborhood: 'Chamisero', address: 'Avenida Chamisero 10650', city: 'Colina', latitude: -33.2070, longitude: -70.6570 },
    { id: 10, name: 'Francisco Javier Diaz', username: 'franciscodiaz', email: 'francisco.diaz@gmail.com', avatar: 'https://i.pravatar.cc/100?img=16', following: 523, likes: 22345, followers: 6123, verified: false, neighborhood: 'Chamisero', address: 'Calle Los Cerezos 300', city: 'Colina', latitude: -33.2080, longitude: -70.6580 },
    { id: 11, name: 'Rosa Maria Herrera', username: 'rosaherrera', email: 'rosa.herrera@gmail.com', avatar: 'https://i.pravatar.cc/100?img=17', following: 734, likes: 29876, followers: 8234, verified: true, neighborhood: 'Chamisero', address: 'Calle Los Aromos 350', city: 'Colina', latitude: -33.2090, longitude: -70.6590 },
    { id: 12, name: 'Luis Alberto Munoz', username: 'luismunoz', email: 'luis.munoz@gmail.com', avatar: 'https://i.pravatar.cc/100?img=18', following: 445, likes: 18765, followers: 5890, verified: false, neighborhood: 'Chamisero', address: 'Camino Los Maitenes 400', city: 'Colina', latitude: -33.2100, longitude: -70.6600 },
  ];
  
  const friends = friendsData;

  // Guardar amigos en localStorage para que UserProfile pueda encontrarlos
  useEffect(() => {
    localStorage.setItem('friendbook_users', JSON.stringify(friendsData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calcular distancia del usuario actual a cada amigo
  // Usamos la ubicación del primer usuario como ubicación del usuario actual (simulado)
  const userLatitude = user?.latitude || -33.2000;
  const userLongitude = user?.longitude || -70.6500;

  // Agregar distancia a cada amigo y ordenar por distancia
  const friendsWithDistance = friends.map(friend => ({
    ...friend,
    distance: calculateDistance(userLatitude, userLongitude, friend.latitude, friend.longitude)
  })).sort((a, b) => a.distance - b.distance);

  const filteredFriends = friendsWithDistance.filter(friend => {
    const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === 'all' ? true :
      filterType === 'verified' ? friend.verified :
      filterType === 'same-neighborhood' ? friend.neighborhood === user?.neighborhood :
      filterType === 'nearby' ? friend.distance <= 5 : true; // Cercanos: hasta 5 km
    
    return matchesSearch && matchesFilter;
  });

  const totalFriends = friends.length;
  const verifiedFriends = friends.filter(f => f.verified).length;
  const sameNeighborhood = friends.filter(f => f.neighborhood === user?.neighborhood).length;

  const { displayedItems, hasMore, isLoading, loadMoreRef } = useInfiniteScroll(filteredFriends, 8);

  return (
    <div className={`friends-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ProfileHeader />
      
      <div className="friends-tabs">
        <button
          className="tab"
          onClick={() => navigate(`/${user?.username || 'usuario'}`)}
        >
          <AccessTimeIcon fontSize="small" /> Línea de Tiempo
        </button>
        <button className="tab" onClick={() => navigate('/acerca-de')}>
          <InfoIcon fontSize="small" /> Acerca de
        </button>
        <button className="tab active">
          <GroupIcon fontSize="small" /> Vecinos
        </button>
        <button className="tab" onClick={() => navigate('/fotos')}>
          <PhotoLibraryIcon fontSize="small" /> Fotos
        </button>
      </div>

      {/* Estadísticas */}
      <div className="friends-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <PeopleIcon style={{ color: '#3b82f6', fontSize: '24px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatNumber(totalFriends)}</span>
            <span className="stat-label">Total Vecinos</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>
            <VerifiedIcon style={{ color: '#10b981', fontSize: '24px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatNumber(verifiedFriends)}</span>
            <span className="stat-label">Verificados</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <LocationOnIcon style={{ color: '#f59e0b', fontSize: '24px' }} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatNumber(sameNeighborhood)}</span>
            <span className="stat-label">Mismo Vecindario</span>
          </div>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="friends-search-bar">
        <div className="search-input-wrapper">
          <input 
            type="text" 
            placeholder="Buscar vecinos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          className={`filter-toggle-btn ${showFilter ? 'active' : ''}`}
          onClick={() => setShowFilter(!showFilter)}
        >
          <FilterListIcon fontSize="small" /> Filtros
        </button>
      </div>

      {/* Panel de Filtros */}
      {showFilter && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Mostrar:</label>
            <div className="filter-buttons">
              <button 
                className={filterType === 'all' ? 'active' : ''}
                onClick={() => setFilterType('all')}
              >
                <PeopleIcon fontSize="small" /> Todos
              </button>
              <button 
                className={filterType === 'verified' ? 'active' : ''}
                onClick={() => setFilterType('verified')}
              >
                <VerifiedIcon fontSize="small" /> Verificados
              </button>
              <button
                className={filterType === 'same-neighborhood' ? 'active' : ''}
                onClick={() => setFilterType('same-neighborhood')}
              >
                <LocationOnIcon fontSize="small" /> Mi Vecindario
              </button>
              <button
                className={filterType === 'nearby' ? 'active' : ''}
                onClick={() => setFilterType('nearby')}
              >
                <NearMeIcon fontSize="small" /> Cercanos (5km)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="friends-header">
        <h2>
          <GroupIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Vecinos ({filteredFriends.length})
        </h2>
        <button className="add-friend-btn">
          <PersonAddIcon fontSize="small" />
          Agregar Vecino
        </button>
      </div>

      <div className="friends-grid">
        {displayedItems.map((friend, index) => (
          <FriendCard key={index} friend={friend} />
        ))}
      </div>

      {isLoading && hasMore && (
        <div className="friends-grid">
          <SkeletonLoader type="card" count={4} />
        </div>
      )}

      {hasMore && <div ref={loadMoreRef} style={{ height: '20px' }} />}
      
      {!hasMore && filteredFriends.length > 0 && (
        <div className="no-more-results">
          No hay más vecinos para mostrar
        </div>
      )}

      {filteredFriends.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">
            <PeopleIcon style={{ fontSize: '64px', opacity: 0.3 }} />
          </div>
          <h3>No se encontraron vecinos</h3>
          <p>Intenta con otro término de búsqueda o filtro</p>
        </div>
      )}
    </div>
  );
};

export default Friends;
