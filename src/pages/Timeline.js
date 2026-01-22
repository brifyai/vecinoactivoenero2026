import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { useSidebar } from '../context/SidebarContext';
import ProfileHeader from '../components/ProfileHeader/ProfileHeader';
import Post from '../components/Post/Post';
import EventsWidget from '../components/EventsWidget/EventsWidget';
import ActivityNewsWidget from '../components/ActivityNewsWidget/ActivityNewsWidget';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import GroupIcon from '@mui/icons-material/Group';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SearchIcon from '@mui/icons-material/Search';
import FeedIcon from '@mui/icons-material/Feed';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import './Timeline.css';

const Timeline = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();

  // Redirigir a la URL del username
  useEffect(() => {
    if (user?.username) {
      navigate(`/${user.username}`, { replace: true });
    }
  }, [user, navigate]);

  // Mientras redirige, mostrar loading
  return (
    <div className="timeline">
      <div className="loading-profile">Cargando perfil...</div>
    </div>
  );
};

export default Timeline;
