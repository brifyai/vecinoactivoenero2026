import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/selectors/authSelectors';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useApp } from '../../context/AppContext';
import { useSidebar } from '../../context/SidebarContext';
import { showSuccessToast } from '../../utils/sweetalert';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import MapIcon from '@mui/icons-material/Map';
import BusinessIcon from '@mui/icons-material/Business';
import HelpIcon from '@mui/icons-material/Help';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';

import './MobileMenu.css';

const MobileMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectUser);
  const { logout } = useAuth();
  const { darkMode, toggleDarkMode } = useApp();
  const { closeMobileSidebar } = useSidebar();
  const menuRef = useRef(null);

  // Touch gesture handling for swipe to close
  useEffect(() => {
    // Prevent body scrolling when menu is open
    document.body.style.overflow = 'hidden';
    
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      
      // Only allow left swipe (negative delta)
      if (deltaX < 0 && Math.abs(deltaX) > 10) {
        const menu = menuRef.current;
        if (menu) {
          const translateX = Math.max(deltaX, -320); // Limit to menu width
          menu.style.transform = `translateX(${translateX}px)`;
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      
      const deltaX = currentX - startX;
      const menu = menuRef.current;
      
      if (menu) {
        // If swiped more than 100px to the left, close menu
        if (deltaX < -100) {
          closeMobileSidebar();
        } else {
          // Reset position
          menu.style.transform = 'translateX(0)';
        }
      }
    };

    const menu = menuRef.current;
    if (menu) {
      menu.addEventListener('touchstart', handleTouchStart, { passive: true });
      menu.addEventListener('touchmove', handleTouchMove, { passive: true });
      menu.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      // Restore body scrolling when menu is closed
      document.body.style.overflow = 'unset';
      
      if (menu) {
        menu.removeEventListener('touchstart', handleTouchStart);
        menu.removeEventListener('touchmove', handleTouchMove);
        menu.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [closeMobileSidebar]);

  const handleNavigation = (path) => {
    navigate(path);
    closeMobileSidebar();
  };

  const handleLogout = async () => {
    logout();
    showSuccessToast('¡Sesión cerrada exitosamente!');
    closeMobileSidebar();
  };

  const handleDarkModeToggle = () => {
    toggleDarkMode();
    // No cerramos el menú para que el usuario vea el cambio
  };

  const menuItems = [
    {
      icon: <HomeIcon />,
      label: 'Inicio',
      path: '/app',
      description: 'Feed principal'
    },
    {
      icon: <ExploreIcon />,
      label: 'Descubrir Vecinos',
      path: '/app/descubrir-vecinos',
      description: 'Encuentra vecinos cerca'
    },
    {
      icon: <MapIcon />,
      label: 'Mapa',
      path: '/app/mapa',
      description: 'Explora tu vecindario'
    },
    {
      icon: <BusinessIcon />,
      label: 'Hub Comunitario',
      path: '/app/hub-comunitario',
      description: 'Servicios y directorio'
    },
    {
      icon: <EventIcon />,
      label: 'Eventos',
      path: '/app/eventos',
      description: 'Eventos del vecindario'
    }
  ];

  const profileItems = [
    {
      icon: <PersonIcon />,
      label: 'Mi Perfil',
      path: `/app/${user?.username || 'perfil'}`,
      description: 'Ver mi perfil'
    },
    {
      icon: <SettingsIcon />,
      label: 'Configuración',
      path: '/app/configuracion',
      description: 'Ajustes de cuenta'
    }
  ];

  return (
    <div className="mobile-menu-overlay" onClick={closeMobileSidebar}>
      <div className="mobile-menu" ref={menuRef} onClick={(e) => e.stopPropagation()}>
        {/* Header del menú */}
        <div className="mobile-menu-header">
          {/* Swipe handle indicator */}
          <div className="swipe-handle"></div>
          
          <div className="menu-user-info">
            <img src={user?.avatar} alt={user?.name} className="menu-user-avatar" />
            <div className="menu-user-details">
              <h3>{user?.name}</h3>
              <p>{user?.email}</p>
              {user?.neighborhood && (
                <span className="menu-neighborhood">{user.neighborhood}</span>
              )}
            </div>
          </div>
          <button className="menu-close-btn" onClick={closeMobileSidebar}>
            <CloseIcon />
          </button>
        </div>

        {/* Navegación principal */}
        <div className="mobile-menu-content">
          <div className="menu-section">
            <h4>Navegación</h4>
            <div className="menu-items">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <div className="menu-item-icon">{item.icon}</div>
                  <div className="menu-item-content">
                    <span className="menu-item-label">{item.label}</span>
                    <span className="menu-item-description">{item.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sección de perfil */}
          <div className="menu-section">
            <h4>Perfil</h4>
            <div className="menu-items">
              {profileItems.map((item) => (
                <button
                  key={item.path}
                  className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <div className="menu-item-icon">{item.icon}</div>
                  <div className="menu-item-content">
                    <span className="menu-item-label">{item.label}</span>
                    <span className="menu-item-description">{item.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Controles */}
          <div className="menu-section">
            <h4>Configuración</h4>
            <div className="menu-items">
              <button className="menu-item" onClick={handleDarkModeToggle}>
                <div className="menu-item-icon">
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </div>
                <div className="menu-item-content">
                  <span className="menu-item-label">
                    {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
                  </span>
                  <span className="menu-item-description">
                    Cambiar tema de la aplicación
                  </span>
                </div>
              </button>

              <button className="menu-item logout-item" onClick={handleLogout}>
                <div className="menu-item-icon">
                  <LogoutIcon />
                </div>
                <div className="menu-item-content">
                  <span className="menu-item-label">Cerrar Sesión</span>
                  <span className="menu-item-description">Salir de la aplicación</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;