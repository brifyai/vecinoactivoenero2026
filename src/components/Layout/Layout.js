import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import RightSidebar from '../RightSidebar/RightSidebar';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isRightSidebarCollapsed } = useSidebar();
  
  // Páginas que tienen su propio layout completo (ProfileHeader) y no necesitan sidebars
  const fullWidthPages = [];
  const isFullWidth = fullWidthPages.includes(location.pathname);
  
  // Páginas que no necesitan el chat lateral derecho
  const noRightSidebarPages = ['/contacto'];
  const hideRightSidebar = noRightSidebarPages.includes(location.pathname);

  return (
    <div className="layout">
      <Header />
      <div className={`layout-container ${isFullWidth ? 'full-width' : ''} ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {!isFullWidth && <Sidebar />}
        <main className={`main-content ${isFullWidth ? 'full-width-content' : ''}`}>
          {children}
        </main>
        {!isFullWidth && !hideRightSidebar && <RightSidebar />}
      </div>
    </div>
  );
};

export default Layout;
