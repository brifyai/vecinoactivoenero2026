import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const savedReports = JSON.parse(localStorage.getItem('securityReports') || '[]');
    
    // Si no hay reportes, crear algunos de ejemplo
    if (savedReports.length === 0) {
      const exampleReports = [
        {
          id: 1,
          userId: 1,
          userName: 'Juan Pérez',
          userAvatar: 'https://i.pravatar.cc/100?img=11',
          type: 'robo',
          title: 'Intento de robo a vehículo',
          description: 'Rompieron vidrio de auto estacionado. Carabineros ya vino. Ojo con dejar cosas a la vista.',
          lat: -33.4489,
          lng: -70.6693,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hace 2 horas
          neighborhoodId: null
        },
        {
          id: 2,
          userId: 2,
          userName: 'María González',
          userAvatar: 'https://i.pravatar.cc/100?img=5',
          type: 'sospechoso',
          title: 'Persona sospechosa merodeando',
          description: 'Persona merodeando hace 20 min, probando manillas de autos. Vestía ropa oscura.',
          lat: -33.4495,
          lng: -70.6700,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Hace 30 min
          neighborhoodId: null
        },
        {
          id: 3,
          userId: 3,
          userName: 'Carlos Muñoz',
          userAvatar: 'https://i.pravatar.cc/100?img=12',
          type: 'vehiculo',
          title: 'Auto sospechoso',
          description: 'Auto sin patente dando vueltas por la cuadra. Ya pasó 3 veces.',
          lat: -33.4480,
          lng: -70.6685,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // Hace 5 horas
          neighborhoodId: null
        }
      ];
      
      localStorage.setItem('securityReports', JSON.stringify(exampleReports));
      setReports(exampleReports);
    } else {
      setReports(savedReports);
    }
  };

  const createReport = (report) => {
    const newReport = {
      id: Date.now(),
      userId: user?.id,
      userName: user?.name,
      userAvatar: user?.avatar,
      timestamp: new Date().toISOString(),
      ...report
    };

    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    localStorage.setItem('securityReports', JSON.stringify(updatedReports));

    return newReport;
  };

  const getReportsByNeighborhood = (neighborhoodId) => {
    return reports.filter(r => r.neighborhoodId === neighborhoodId);
  };

  const getRecentReports = (hours = 24) => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    return reports.filter(r => new Date(r.timestamp) > cutoff);
  };

  const value = {
    reports,
    createReport,
    getReportsByNeighborhood,
    getRecentReports,
    loadReports
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
