import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCurrentAdmin, clearCurrentNeighborhood } from '../../store/slices/adminDashboardSlice';
import { logout } from '../../store/slices/authSlice';

// Material UI Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuIcon from '@mui/icons-material/Menu';
import BusinessIcon from '@mui/icons-material/Business';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';

import './AdminSidebar.css';

const AdminSidebar = ({ collapsed, onToggle, currentAdmin, adminRole }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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

  const menuItems = [
    {
      id: 'overview',
      label: 'Resumen General',
      icon: <DashboardIcon />,
      path: '/admin/dashboard/overview',
      description: 'Vista general del dashboard'
    },
    {
      id: 'emergencies',
      label: 'Emergencias',
      icon: <WarningIcon />,
      path: '/admin/dashboard/emergencies',
      description: 'Gestión de alertas de emergencia',
      priority: true // Marcar como prioritario
    },
    {
      id: 'tickets',
      label: 'Gestión de Tickets',
      icon: <ConfirmationNumberIcon />,
      path: '/admin/dashboard/tickets',
      description: 'Bandeja de reportes y tickets',
      badge: '12' // Ejemplo de badge con tickets pendientes
    },
    {
      id: 'campaigns',
      label: 'Comunicación Masiva',
      icon: <CampaignIcon />,
      path: '/admin/dashboard/campaigns',
      description: 'Push, Email y WhatsApp'
    },
    {
      id: 'users',
      label: 'Gestión de Vecinos',
      icon: <PeopleIcon />,
      path: '/admin/dashboard/users',
      description: 'Audiencia y verificación'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <AnalyticsIcon />,
      path: '/admin/dashboard/analytics',
      description: 'Métricas y reportes'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <SettingsIcon />,
      path: '/admin/dashboard/settings',
      description: 'Ajustes del sistema'
    }
  ];

  return (
    <div className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header del Sidebar */}
      <div className="admin-sidebar-header">
        <button 
          className="sidebar-toggle-btn"
          onClick={onToggle}
          title={collapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
        >
          <MenuIcon />
        </button>
        
        {!collapsed && (
          <div className="sidebar-brand">
            <div className="brand-icon">
              <AdminPanelSettingsIcon />
            </div>
            <div className="brand-text">
              <h3>Panel Admin</h3>
              <span>Unidad Vecinal</span>
            </div>
          </div>
        )}
      </div>

      {/* Navegación */}
      <nav className="admin-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className={`nav-item ${item.priority ? 'priority' : ''}`}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''} ${item.priority ? 'priority-link' : ''}`
                }
                title={collapsed ? item.label : ''}
              >
                <div className="nav-icon">
                  {item.icon}
                </div>
                {!collapsed && (
                  <>
                    <div className="nav-content">
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-description">{item.description}</span>
                    </div>
                    {item.badge && (
                      <div className="nav-badge">
                        {item.badge}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer del Sidebar */}
      <div className="admin-sidebar-footer">
        <button 
          className="logout-btn"
          onClick={handleLogout}
          title={collapsed ? 'Cerrar sesión' : ''}
        >
          <LogoutIcon />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;