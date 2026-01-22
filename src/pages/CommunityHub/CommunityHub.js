import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ModernDirectory from '../../components/ModernDirectory/ModernDirectory';
import ModernPolls from '../../components/ModernPolls/ModernPolls';
import ModernProjects from '../../components/ModernProjects/ModernProjects';
import './CommunityHub.css';

const CommunityHub = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isRightSidebarCollapsed } = useSidebar();
  const activeTab = searchParams.get('tab') || 'directorio';

  const tabs = [
    {
      id: 'directorio',
      label: 'Directorio',
      icon: <StorefrontIcon />,
      description: 'Servicios y negocios locales',
      component: <ModernDirectory />
    },
    {
      id: 'votaciones',
      label: 'Votaciones',
      icon: <HowToVoteIcon />,
      description: 'Decisiones comunitarias',
      component: <ModernPolls />
    },
    {
      id: 'proyectos',
      label: 'Proyectos',
      icon: <AccountTreeIcon />,
      description: 'Iniciativas vecinales',
      component: <ModernProjects />
    }
  ];

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const activeTabData = tabs.find(tab => tab.id === activeTab) || tabs[0];

  return (
    <div className={`community-hub ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="hub-header">
        <div className="hub-title-section">
          <h1 className="hub-title">Hub Comunitario</h1>
          <p className="hub-subtitle">Centro de recursos y servicios del vecindario</p>
        </div>
      </div>

      <div className="hub-tabs-container">
        <div className="hub-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`hub-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <div className="tab-icon">{tab.icon}</div>
              <div className="tab-content">
                <span className="tab-label">{tab.label}</span>
                <span className="tab-description">{tab.description}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="tab-indicator" style={{ transform: `translateX(${tabs.findIndex(t => t.id === activeTab) * 100}%)` }} />
      </div>

      <div className="hub-content">
        <div className="content-wrapper">
          {activeTabData.component}
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
