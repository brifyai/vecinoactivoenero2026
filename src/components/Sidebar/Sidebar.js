import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MapIcon from '@mui/icons-material/Map';
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import PollIcon from '@mui/icons-material/Poll';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PagesIcon from '@mui/icons-material/Pages';
import { useAuth } from '../../context/AuthContext';
import { showConfirmDialog, showSuccessToast } from '../../utils/sweetalert';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: <DashboardIcon />, path: '/', label: 'Inicio' },
    { icon: <MapIcon />, path: '/mapa', label: 'Mapa del Barrio' },
    { icon: <BusinessIcon />, path: '/directorio', label: 'Directorio' },
    { icon: <PollIcon />, path: '/votaciones', label: 'Votaciones' },
    { icon: <RocketLaunchIcon />, path: '/comunidad', label: 'Comunidad' },
    { icon: <PagesIcon />, path: '/paginas', label: 'Páginas' },
    // { icon: <GroupIcon />, path: '/grupos', label: 'Grupos' },
    { icon: <CalendarMonthIcon />, path: '/eventos', label: 'Eventos' },
    { icon: <PersonIcon />, path: `/${user?.username || user?.name?.toLowerCase().replace(/\s+/g, '-') || 'usuario'}`, label: 'Perfil', matchPaths: ['/linea-tiempo', '/acerca-de', '/vecinos', '/fotos'] },
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
      navigate('/iniciar-sesion');
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
            {item.icon}
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
