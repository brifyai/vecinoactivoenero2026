import { useNavigate } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LogoutIcon from '@mui/icons-material/Logout';
import './ProfileDropdown.css';

const ProfileDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
    // Pequeño delay para asegurar que el estado se limpie antes de navegar
    setTimeout(() => {
      navigate('/iniciar-sesion', { replace: true });
      window.location.reload(); // Forzar recarga para limpiar todo el estado
    }, 100);
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="profile-dropdown">
      <div className="profile-dropdown-header">
        <img src={user?.avatar} alt={user?.name} />
        <div className="profile-info-dropdown">
          <h4>{user?.name}</h4>
          <p>{user?.email}</p>
        </div>
      </div>
      
      <div className="profile-dropdown-divider"></div>
      
      <div className="profile-dropdown-menu">
        <button className="dropdown-menu-item" onClick={() => {
          const username = user?.username || user?.name?.toLowerCase().replace(/\s+/g, '-') || 'usuario';
          handleNavigation(`/${username}`);
        }}>
          <PersonIcon />
          <span>Ver Perfil</span>
        </button>
        
        <button className="dropdown-menu-item" onClick={() => handleNavigation('/configuracion')}>
          <SettingsIcon />
          <span>Configuración y Privacidad</span>
        </button>
        
        <button className="dropdown-menu-item" onClick={() => handleNavigation('/ayuda')}>
          <HelpIcon />
          <span>Ayuda y Soporte</span>
        </button>
        
        <button className="dropdown-menu-item">
          <FeedbackIcon />
          <span>Dar Opinión</span>
        </button>
      </div>
      
      <div className="profile-dropdown-divider"></div>
      
      <button className="dropdown-menu-item logout-item" onClick={handleLogout}>
        <LogoutIcon />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  );
};

export default ProfileDropdown;
