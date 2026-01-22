import { useState } from 'react';
import { useProjects } from '../../context/ProjectsContext';
import { useHelpRequests } from '../../context/HelpRequestsContext';
import { useSharedResources } from '../../context/SharedResourcesContext';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import Projects from '../Projects/Projects';
import HelpRequests from '../HelpRequests/HelpRequests';
import SharedResources from '../SharedResources/SharedResources';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ShareIcon from '@mui/icons-material/Share';
import './Community.css';

const Community = () => {
  const { user } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'help', 'resources'

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className={`community-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Contenido según pestaña activa */}
      <div className="community-content">
        {activeTab === 'projects' && <Projects />}
        {activeTab === 'help' && <HelpRequests />}
        {activeTab === 'resources' && <SharedResources />}
      </div>
    </div>
  );
};

export default Community;
