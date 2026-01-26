/**
 * Users Management - Gestión de Usuarios Administrativos
 * Página completa para administrar usuarios del vecindario
 */
import React, { useEffect, useState } from 'react';
import { useReduxAdmin } from '../../hooks/useReduxAdmin';

// Material UI Icons
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BlockIcon from '@mui/icons-material/Block';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SecurityIcon from '@mui/icons-material/Security';

import './UsersManagement.css';

const UsersManagement = () => {
  console.log('👥 UsersManagement component loading');

  const {
    neighborhoodUsers,
    userSearchResults,
    usersLoading,
    searchLoading,
    error,
    getCurrentNeighborhoodId,
    getCurrentNeighborhoodName,
    fetchNeighborhoodUsers,
    searchUsers,
    clearUserSearchResults,
    canManageUsers,
    getTotalUsers,
    getVerifiedUsers
  } = useReduxAdmin();

  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // list, grid
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    verified: ''
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const neighborhoodId = getCurrentNeighborhoodId();
    if (neighborhoodId && canManageUsers()) {
      loadUsers(neighborhoodId);
    }
  }, []);

  const loadUsers = async (neighborhoodId) => {
    console.log('👥 Cargando usuarios para:', neighborhoodId);
    await fetchNeighborhoodUsers(neighborhoodId, filters);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const neighborhoodId = getCurrentNeighborhoodId();
      await searchUsers(searchInput, neighborhoodId);
    } else {
      clearUserSearchResults();
    }
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    
    // Recargar usuarios con nuevos filtros
    const neighborhoodId = getCurrentNeighborhoodId();
    if (neighborhoodId) {
      fetchNeighborhoodUsers(neighborhoodId, newFilters);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getUserRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminPanelSettingsIcon />;
      case 'moderator': return <SecurityIcon />;
      case 'verified': return <VerifiedUserIcon />;
      default: return <PersonIcon />;
    }
  };

  const getUserRoleColor = (role) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'moderator': return '#f59e0b';
      case 'verified': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#6b7280';
      case 'blocked': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Usar resultados de búsqueda si existen, sino usuarios del vecindario
  const displayUsers = userSearchResults.length > 0 ? userSearchResults : neighborhoodUsers;
  const totalUsers = getTotalUsers();
  const verifiedUsers = getVerifiedUsers();

  if (!canManageUsers()) {
    return (
      <div className="users-management">
        <div className="access-denied">
          <PeopleIcon />
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para gestionar usuarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-management">
      {/* Header */}
      <div className="users-header">
        <div className="header-info">
          <PeopleIcon className="header-icon" />
          <div>
            <h1>Gestión de Usuarios</h1>
            <p>{getCurrentNeighborhoodName()} • {totalUsers} usuarios totales</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="invite-user-btn">
            <AddIcon />
            Invitar Usuario
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <PeopleIcon />
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalUsers}</div>
            <div className="stat-label">Total Usuarios</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon verified">
            <VerifiedUserIcon />
          </div>
          <div className="stat-info">
            <div className="stat-value">{verifiedUsers}</div>
            <div className="stat-label">Verificados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <PersonIcon />
          </div>
          <div className="stat-info">
            <div className="stat-value">{displayUsers.filter(u => u.status === 'active').length}</div>
            <div className="stat-label">Activos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon admins">
            <AdminPanelSettingsIcon />
          </div>
          <div className="stat-info">
            <div className="stat-value">{displayUsers.filter(u => u.role === 'admin').length}</div>
            <div className="stat-label">Administradores</div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="users-controls">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar usuarios por nombre, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" disabled={searchLoading}>
              {searchLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
          {userSearchResults.length > 0 && (
            <button 
              className="clear-search"
              onClick={() => {
                setSearchInput('');
                clearUserSearchResults();
              }}
            >
              Limpiar búsqueda
            </button>
          )}
        </div>

        <div className="filter-section">
          <button 
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterListIcon />
            Filtros
          </button>

          <div className="view-modes">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              Lista
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Cuadrícula
            </button>
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Estado:</label>
            <select 
              value={filters.status || ''} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Rol:</label>
            <select 
              value={filters.role || ''} 
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="admin">Administrador</option>
              <option value="moderator">Moderador</option>
              <option value="verified">Verificado</option>
              <option value="user">Usuario</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Verificación:</label>
            <select 
              value={filters.verified || ''} 
              onChange={(e) => handleFilterChange('verified', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="true">Verificados</option>
              <option value="false">No verificados</option>
            </select>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="users-content">
        {usersLoading ? (
          <div className="users-loading">
            <div className="loading-spinner"></div>
            <span>Cargando usuarios...</span>
          </div>
        ) : error ? (
          <div className="users-error">
            <p>Error al cargar usuarios: {error}</p>
            <button onClick={() => loadUsers(getCurrentNeighborhoodId())}>
              Reintentar
            </button>
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="users-empty">
            <PeopleIcon />
            <h3>No hay usuarios</h3>
            <p>
              {userSearchResults.length === 0 && searchInput 
                ? 'No se encontraron usuarios con ese término de búsqueda.'
                : 'No se encontraron usuarios con los filtros aplicados.'
              }
            </p>
          </div>
        ) : (
          <div className={`users-list ${viewMode}`}>
            {displayUsers.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-header">
                  <div className="user-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                  </div>
                  <div 
                    className="user-role-icon"
                    style={{ backgroundColor: getUserRoleColor(user.role) }}
                  >
                    {getUserRoleIcon(user.role)}
                  </div>
                  <div className="user-menu">
                    <MoreVertIcon />
                  </div>
                </div>

                <div className="user-avatar">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  {user.is_verified && (
                    <div className="verified-badge">
                      <VerifiedUserIcon />
                    </div>
                  )}
                </div>

                <div className="user-content">
                  <h3 className="user-name">{user.full_name || 'Usuario sin nombre'}</h3>
                  <p className="user-username">@{user.username || 'sin-username'}</p>

                  <div className="user-meta">
                    <div className="meta-item">
                      <EmailIcon />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="meta-item">
                        <PhoneIcon />
                        <span>{user.phone}</span>
                      </div>
                    )}
                    {user.address && (
                      <div className="meta-item">
                        <LocationOnIcon />
                        <span>{user.address}</span>
                      </div>
                    )}
                    <div className="meta-item">
                      <CalendarTodayIcon />
                      <span>Desde {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="user-footer">
                  <div className={`user-status ${user.status || 'active'}`}>
                    <div 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(user.status || 'active') }}
                    ></div>
                    <span>{user.status || 'active'}</span>
                  </div>

                  <div className="user-actions">
                    <button className="action-btn view" title="Ver perfil">
                      <VisibilityIcon />
                    </button>
                    <button className="action-btn edit" title="Editar usuario">
                      <EditIcon />
                    </button>
                    {user.status !== 'blocked' && (
                      <button className="action-btn block" title="Bloquear usuario">
                        <BlockIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;