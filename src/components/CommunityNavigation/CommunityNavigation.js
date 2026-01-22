import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessagesContext';
import { useNotifications } from '../../context/NotificationsContext';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import StorefrontIcon from '@mui/icons-material/Storefront';
import MapIcon from '@mui/icons-material/Map';
import MailIcon from '@mui/icons-material/Mail';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import './CommunityNavigation.css';

const CommunityNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUnreadCount } = useMessages();
  const { unreadCount } = useNotifications();

  const unreadMessages = getUnreadCount(user?.id);

  const navItems = [
    {
      path: '/',
      label: 'Inicio',
      icon: <HomeIcon />,
      badge: null
    },
    {
      path: '/necesidades-locales',
      label: 'Necesidades',
      icon: <AssignmentIcon />,
      badge: null
    },
    {
      path: '/acciones-comunitarias',
      label: 'Acciones',
      icon: <GroupWorkIcon />,
      badge: null
    },
    {
      path: '/directorio',
      label: 'Directorio',
      icon: <StorefrontIcon />,
      badge: null
    },
    {
      path: '/mapa',
      label: 'Mapa',
      icon: <MapIcon />,
      badge: null
    },
    {
      path: '/mensajes-directos',
      label: 'Mensajes',
      icon: <MailIcon />,
      badge: unreadMessages > 0 ? unreadMessages : null
    },
    {
      path: '/:username',
      label: 'Perfil',
      icon: <PersonIcon />,
      badge: unreadCount > 0 ? unreadCount : null,
      onClick: () => navigate(`/${user?.username || user?.id}`)
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="community-navigation">
      <div className="nav-container">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => item.onClick ? item.onClick() : navigate(item.path)}
            title={item.label}
          >
            <div className="nav-icon">
              {item.icon}
              {item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default CommunityNavigation;
