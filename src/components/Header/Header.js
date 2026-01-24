import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactDOM from 'react-dom';
import { selectUser } from '../../store/selectors/authSelectors';
import { useReduxNotificationsWithPolling } from '../../hooks/useReduxNotificationsWithPolling';
import { useApp } from '../../context/AppContext';
import { useSidebar } from '../../context/SidebarContext';
import HomeIcon from '@mui/icons-material/Home';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsCenter from '../NotificationsCenter/NotificationsCenter';
import MessagesDropdown from '../MessagesDropdown/MessagesDropdown';
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';
import SearchModal from '../SearchModal/SearchModal';
import MobileMenu from '../MobileMenu/MobileMenu';
import RealtimeStatusIndicator from '../RealtimeStatusIndicator/RealtimeStatusIndicator';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const { unreadCount, pollingStatus } = useReduxNotificationsWithPolling({
    enablePolling: true,
    pollingInterval: 2000,
    showBrowserNotifications: true,
    playSound: true
  });
  const { darkMode, toggleDarkMode, unreadMessagesCount } = useApp();
  const { isMobileSidebarOpen, toggleMobileSidebar } = useSidebar();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const notifRef = useRef(null);
  const msgRef = useRef(null);
  const profileRef = useRef(null);

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      // No cerrar si el clic es en un botón dentro del dropdown
      if (event.target.closest('.dropdown-menu-item')) {
        return;
      }
      
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (msgRef.current && !msgRef.current.contains(event.target)) {
        setShowMessages(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="header">
        <div className="header-left">
          {/* Botón hamburguesa para móvil */}
          <button 
            className="hamburger-btn"
            onClick={toggleMobileSidebar}
            aria-label="Abrir menú"
          >
            {isMobileSidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <div className="logo" onClick={() => navigate('/app')}>
            <PeopleIcon className="logo-icon" />
            <span className="logo-text">Vecino Activo</span>
          </div>
          
          {user?.neighborhood && (
            <div className="neighborhood-badge">
              <LocationOnIcon className="neighborhood-icon" />
              <span className="neighborhood-name">{user.neighborhood}</span>
            </div>
          )}
          
          <div className="search-bar" onClick={() => setShowSearch(true)}>
            <input type="text" placeholder="Buscar vecinos..." readOnly />
          </div>
        </div>
        
        <div className="header-right">
          <RealtimeStatusIndicator showDetails={true} />
          
          <button className="icon-btn desktop-only" onClick={() => navigate('/app')}>
            <HomeIcon />
          </button>
          
          <div className="dropdown-container" ref={notifRef}>
            <button 
              className="icon-btn" 
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <NotificationsIcon />
              {unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </button>
          </div>
          
          <div className="dropdown-container" ref={msgRef}>
            <button 
              className="icon-btn" 
              onClick={() => setShowMessages(!showMessages)}
            >
              <ChatBubbleIcon />
              {unreadMessagesCount > 0 && (
                <span className="badge">{unreadMessagesCount}</span>
              )}
            </button>
          </div>
          
          <button className="icon-btn desktop-only" onClick={toggleDarkMode}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </button>
          
          <div className="dropdown-container" ref={profileRef}>
            <div 
              className="user-profile" 
              onClick={() => setShowProfile(!showProfile)}
            >
              <img src={user?.avatar} alt="User" />
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-status">Activo ahora</span>
              </div>
              <KeyboardArrowDownIcon className="dropdown-arrow" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileSidebarOpen && <MobileMenu />}

      {showNotifications && ReactDOM.createPortal(
        <NotificationsCenter 
          isOpen={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />,
        document.body
      )}

      {showMessages && ReactDOM.createPortal(
        <MessagesDropdown onClose={() => setShowMessages(false)} />,
        document.body
      )}

      {showProfile && ReactDOM.createPortal(
        <ProfileDropdown onClose={() => setShowProfile(false)} />,
        document.body
      )}

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </>
  );
};

export default Header;
