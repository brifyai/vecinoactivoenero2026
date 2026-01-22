import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactDOM from 'react-dom';
import { selectUser } from '../../store/selectors/authSelectors';
import { selectUnreadCount } from '../../store/selectors/notificationsSelectors';
import { useApp } from '../../context/AppContext';
import HomeIcon from '@mui/icons-material/Home';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NotificationsCenter from '../NotificationsCenter/NotificationsCenter';
import MessagesDropdown from '../MessagesDropdown/MessagesDropdown';
import ProfileDropdown from '../ProfileDropdown/ProfileDropdown';
import SearchModal from '../SearchModal/SearchModal';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const unreadCount = useSelector(selectUnreadCount);
  const { darkMode, toggleDarkMode, unreadMessagesCount } = useApp();
  
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
          <div className="logo" onClick={() => navigate('/')}>
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
          <button className="icon-btn" onClick={() => navigate('/')}>
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
          
          <button className="icon-btn" onClick={toggleDarkMode}>
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
