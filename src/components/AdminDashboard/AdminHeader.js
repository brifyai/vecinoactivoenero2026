import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCurrentAdmin, clearCurrentNeighborhood } from '../../store/slices/adminDashboardSlice';
import { logout } from '../../store/slices/authSlice';

// Material UI Icons
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';

import './AdminHeader.css';

const AdminHeader = ({ currentAdmin, onSidebarToggle, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      dispatch(setCurrentAdmin(null));
      dispatch(clearCurrentNeighborhood());
      dispatch(logout());
      navigate('/iniciar-sesion-admin');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implementar búsqueda global
      console.log('Searching for:', searchQuery);
    }
  };

  // Notificaciones de ejemplo
  const notifications = [
    {
      id: 1,
      type: 'ticket',
      title: 'Nuevo ticket urgente',
      message: 'Problema de seguridad en Sector A',
      time: '5 min',
      unread: true
    },
    {
      id: 2,
      type: 'campaign',
      title: 'Campaña enviada',
      message: 'Boletín mensual enviado a 1,234 vecinos',
      time: '1 hora',
      unread: true
    },
    {
      id: 3,
      type: 'system',
      title: 'Actualización del sistema',
      message: 'Nueva versión disponible',
      time: '2 horas',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        {/* Toggle sidebar en móvil */}
        <button 
          className="mobile-sidebar-toggle"
          onClick={onSidebarToggle}
        >
          <MenuIcon />
        </button>

        {/* Breadcrumb eliminado */}
      </div>

      <div className="admin-header-center">
        {/* Búsqueda global */}
        <form className="admin-search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Buscar tickets, vecinos, campañas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </form>
      </div>

      <div className="admin-header-right">
        {/* Notificaciones */}
        <div className="header-item notifications-wrapper">
          <button 
            className="header-btn notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <NotificationsIcon />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h4>Notificaciones</h4>
                <span className="notifications-count">{unreadCount} nuevas</span>
              </div>
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.unread ? 'unread' : ''}`}
                  >
                    <div className="notification-content">
                      <h5 className="notification-title">{notification.title}</h5>
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                    {notification.unread && <div className="unread-indicator"></div>}
                  </div>
                ))}
              </div>
              <div className="notifications-footer">
                <button className="view-all-btn">Ver todas las notificaciones</button>
              </div>
            </div>
          )}
        </div>

        {/* Configuración rápida */}
        <div className="header-item">
          <button 
            className="header-btn"
            onClick={() => navigate('/admin/dashboard/settings')}
            title="Configuración"
          >
            <SettingsIcon />
          </button>
        </div>
      </div>

      {/* Overlay para cerrar dropdowns */}
      {showNotifications && (
        <div 
          className="header-overlay"
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default AdminHeader;