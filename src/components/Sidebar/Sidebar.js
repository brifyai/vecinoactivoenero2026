import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MapIcon from '@mui/icons-material/Map';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ExploreIcon from '@mui/icons-material/Explore';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
// PagesIcon removed - generic Facebook feature
// import PagesIcon from '@mui/icons-material/Pages';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { showConfirmDialog, showSuccessToast } from '../../utils/sweetalert';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: <DashboardIcon />, path: '/', label: 'Inicio' },
    { icon: <ExploreIcon />, path: '/descubrir-vecinos', label: 'Descubrir' },
    { icon: <MapIcon />, path: '/mapa', label: 'Mapa del Barrio' },
    { icon: <RocketLaunchIcon />, path: '/hub-comunitario', label: 'Hub Comunitario' },
    // Pages removed - generic Facebook feature
    // { icon: <PagesIcon />, path: '/paginas', label: 'Páginas' },
    { icon: <CalendarMonthIcon />, path: '/eventos', label: 'Eventos' },
    { icon: null, avatar: user?.avatar, path: `/${user?.username || user?.name?.toLowerCase().replace(/\s+/g, '-') || 'usuario'}`, label: 'Perfil', matchPaths: ['/linea-tiempo', '/acerca-de', '/fotos'] },
    { icon: <MessageIcon />, path: '/mensajes', label: 'Mensajes' },
  ];

  const isActive = (item) => {
    if (item.matchPaths) {
      return item.matchPaths.includes(location.pathname);
    }
    return location.pathname === item.path;
  };

  const handleLogout = async () => {
    const result = await showConfirmDialog(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      'Sí, cerrar sesión',
      'Cancelar'
    );
    
    if (result.isConfirmed) {
      logout();
      showSuccessToast('¡Sesión cerrada exitosamente!');
      navigate('/iniciar-sesion', { replace: true });
    }
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`sidebar-item ${isActive(item) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            {item.avatar ? (
              <img src={item.avatar} alt={item.label} className="sidebar-avatar" />
            ) : (
              item.icon
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button 
          className="sidebar-item" 
          title="Configuración"
          onClick={() => navigate('/configuracion')}
        >
          <SettingsIcon />
        </button>
        <button 
          className="sidebar-item logout" 
          title="Cerrar sesión"
          onClick={handleLogout}
        >
          <LogoutIcon />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
