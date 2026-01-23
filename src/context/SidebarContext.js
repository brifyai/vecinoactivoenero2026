import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleRightSidebar = () => {
    setIsRightSidebarCollapsed(prev => !prev);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <SidebarContext.Provider value={{ 
      isRightSidebarCollapsed, 
      setIsRightSidebarCollapsed,
      toggleRightSidebar,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      toggleMobileSidebar,
      closeMobileSidebar
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarContext;
