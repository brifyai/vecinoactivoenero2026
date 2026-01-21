import React, { createContext, useContext, useState, useEffect } from 'react';

const ServicesContext = createContext();

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within ServicesProvider');
  }
  return context;
};

export const ServicesProvider = ({ children }) => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    const savedServices = JSON.parse(localStorage.getItem('services') || '[]');
    
    // Si no hay servicios, crear algunos de ejemplo
    if (savedServices.length === 0) {
      const defaultServices = [
        {
          id: 1,
          name: 'Carlos Muñoz',
          category: 'plomero',
          avatar: 'https://i.pravatar.cc/100?img=11',
          rating: 4.9,
          reviews: 28,
          verified: true,
          verifiedBy: 18,
          yearsInNeighborhood: 5,
          priceRange: '$$',
          availability: 'Lun-Sáb 8am-6pm',
          phone: '+56 9 1234 5678',
          email: 'carlos@plomeria.cl',
          description: 'Plomero profesional con más de 10 años de experiencia',
          neighborhoodId: null
        },
        {
          id: 2,
          name: 'Ana Silva',
          category: 'electricista',
          avatar: 'https://i.pravatar.cc/100?img=5',
          rating: 4.7,
          reviews: 15,
          verified: true,
          verifiedBy: 12,
          yearsInNeighborhood: 3,
          priceRange: '$$$',
          availability: 'Lun-Vie 9am-7pm',
          phone: '+56 9 8765 4321',
          email: 'ana@electricidad.cl',
          description: 'Electricista certificada, trabajos residenciales y comerciales',
          neighborhoodId: null
        }
      ];
      
      localStorage.setItem('services', JSON.stringify(defaultServices));
      setServices(defaultServices);
    } else {
      setServices(savedServices);
    }
  };

  const addService = (service) => {
    const newService = {
      id: Date.now(),
      rating: 0,
      reviews: 0,
      verified: false,
      verifiedBy: 0,
      ...service
    };

    const updatedServices = [...services, newService];
    setServices(updatedServices);
    localStorage.setItem('services', JSON.stringify(updatedServices));

    return newService;
  };

  const getServicesByCategory = (category) => {
    if (category === 'all') return services;
    return services.filter(s => s.category === category);
  };

  const getServicesByNeighborhood = (neighborhoodId) => {
    return services.filter(s => s.neighborhoodId === neighborhoodId || !s.neighborhoodId);
  };

  const value = {
    services,
    addService,
    getServicesByCategory,
    getServicesByNeighborhood,
    loadServices
  };

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
};
