import React, { createContext, useContext, useState, useEffect } from 'react';
import storageService from '../services/storageService';

const NeighborhoodsContext = createContext();

export const useNeighborhoods = () => {
  const context = useContext(NeighborhoodsContext);
  if (!context) {
    throw new Error('useNeighborhoods must be used within a NeighborhoodsProvider');
  }
  return context;
};

export const NeighborhoodsProvider = ({ children }) => {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedNeighborhoods = storageService.getNeighborhoods();
    if (savedNeighborhoods.length === 0) {
      initializeDefaultNeighborhoods();
    } else {
      setNeighborhoods(savedNeighborhoods);
    }
    setLoading(false);
  }, []);

  const initializeDefaultNeighborhoods = () => {
    const defaultNeighborhoods = [
      {
        id: 'nh-001',
        name: 'Chamisero',
        center: { latitude: -33.3, longitude: -70.7 },
        radiusMeters: 1000,
        activeUsers: 450,
        populationDensity: 0.45,
        state: 'active',
        subNeighborhoods: [],
        parentNeighborhood: null,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'nh-002',
        name: 'Colina Centro',
        center: { latitude: -33.32, longitude: -70.72 },
        radiusMeters: 1200,
        activeUsers: 520,
        populationDensity: 0.52,
        state: 'active',
        subNeighborhoods: [],
        parentNeighborhood: null,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'nh-003',
        name: 'Chicureo',
        center: { latitude: -33.28, longitude: -70.68 },
        radiusMeters: 1500,
        activeUsers: 380,
        populationDensity: 0.38,
        state: 'active',
        subNeighborhoods: [],
        parentNeighborhood: null,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    ];

    storageService.saveNeighborhoods(defaultNeighborhoods);
    setNeighborhoods(defaultNeighborhoods);
  };

  const assignUserToNeighborhood = (userId, latitude, longitude) => {
    const neighborhood = findNearestNeighborhood(latitude, longitude);
    if (neighborhood) {
      storageService.updateUser(userId, {
        neighborhoodId: neighborhood.id,
        neighborhoodName: neighborhood.name,
        latitude,
        longitude
      });
      return neighborhood;
    }
    return null;
  };

  const findNearestNeighborhood = (latitude, longitude) => {
    let nearest = null;
    let minDistance = Infinity;

    neighborhoods.forEach(nh => {
      const distance = calculateDistance(
        latitude,
        longitude,
        nh.center.latitude,
        nh.center.longitude
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = nh;
      }
    });

    return nearest;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getApproximateLocation = (latitude, longitude, radiusMeters = 300) => {
    const offsetLat = (radiusMeters / 111000) * (Math.random() - 0.5) * 2;
    const offsetLon = (radiusMeters / (111000 * Math.cos((latitude * Math.PI) / 180))) * (Math.random() - 0.5) * 2;
    return {
      latitude: latitude + offsetLat,
      longitude: longitude + offsetLon,
      radiusMeters
    };
  };

  const value = {
    neighborhoods,
    loading,
    assignUserToNeighborhood,
    findNearestNeighborhood,
    calculateDistance,
    getApproximateLocation
  };

  return (
    <NeighborhoodsContext.Provider value={value}>
      {children}
    </NeighborhoodsContext.Provider>
  );
};
