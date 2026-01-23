import { useState } from 'react';
import { useProjects } from '../../context/ProjectsContext';
import { useSharedResources } from '../../context/SharedResourcesContext';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useSidebar } from '../../context/SidebarContext';
import Projects from '../Projects/Projects';
import SharedResources from '../SharedResources/SharedResources';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import ShareIcon from '@mui/icons-material/Share';
import './Community.css';

const Community = () => {
  const { user } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'resources'

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className={`community-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Contenido según pestaña activa */}
      <div className="community-content">
        {activeTab === 'projects' && <Projects />}
        {activeTab === 'resources' && <SharedResources />}
      </div>
    </div>
  );
};

export default Community;
