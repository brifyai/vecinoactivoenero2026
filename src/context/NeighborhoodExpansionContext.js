import React, { createContext, useContext, useState, useEffect } from 'react';
import neighborhoodExpansionService from '../services/neighborhoodExpansionService';
import storageService from '../services/storageService';

const NeighborhoodExpansionContext = createContext();

export const useNeighborhoodExpansion = () => {
  const context = useContext(NeighborhoodExpansionContext);
  if (!context) {
    throw new Error('useNeighborhoodExpansion must be used within a NeighborhoodExpansionProvider');
  }
  return context;
};

export const NeighborhoodExpansionProvider = ({ children }) => {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [stats, setStats] = useState({});
  const [recommendations, setRecommendations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNeighborhoodData();
  }, []);

  const loadNeighborhoodData = () => {
    setLoading(true);
    try {
      const savedNeighborhoods = storageService.getNeighborhoods();
      const users = storageService.getUsers();

      setNeighborhoods(savedNeighborhoods);

      // Calcular estadísticas para cada vecindario
      const newStats = {};
      const newRecommendations = {};

      savedNeighborhoods.forEach(neighborhood => {
        const neighborhoodStats = neighborhoodExpansionService.getNeighborhoodStats(
          neighborhood,
          users
        );
        newStats[neighborhood.id] = neighborhoodStats;

        const recs = neighborhoodExpansionService.getRecommendations(
          neighborhood,
          users
        );
        newRecommendations[neighborhood.id] = recs;
      });

      setStats(newStats);
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error loading neighborhood data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAdjacentNeighborhoods = (neighborhoodId, radiusKm = null) => {
    const neighborhood = neighborhoods.find(n => n.id === neighborhoodId);
    if (!neighborhood) return [];

    const radius = radiusKm || stats[neighborhoodId]?.dynamicRadius || 1;
    return neighborhoodExpansionService.getAdjacentNeighborhoods(
      neighborhood,
      neighborhoods,
      radius
    );
  };

  const getMultiNeighborhoodContent = (items, currentNeighborhoodId, radiusKm = null) => {
    const neighborhood = neighborhoods.find(n => n.id === currentNeighborhoodId);
    if (!neighborhood) return items;

    const radius = radiusKm || stats[currentNeighborhoodId]?.dynamicRadius || 1;
    return neighborhoodExpansionService.getMultiNeighborhoodContent(
      items,
      neighborhood,
      neighborhoods,
      radius
    );
  };

  const splitNeighborhood = (neighborhoodId, subCount = 4) => {
    const neighborhood = neighborhoods.find(n => n.id === neighborhoodId);
    if (!neighborhood) return [];

    const subNeighborhoods = neighborhoodExpansionService.splitNeighborhood(
      neighborhood,
      subCount
    );

    // Guardar sub-vecindarios
    const updated = [...neighborhoods, ...subNeighborhoods];
    storageService.saveNeighborhoods(updated);
    setNeighborhoods(updated);

    return subNeighborhoods;
  };

  const getNeighborhoodStats = (neighborhoodId) => {
    return stats[neighborhoodId] || null;
  };

  const getRecommendations = (neighborhoodId) => {
    return recommendations[neighborhoodId] || null;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    return neighborhoodExpansionService.calculateDistance(lat1, lon1, lat2, lon2);
  };

  const shouldExpand = (neighborhoodId) => {
    return stats[neighborhoodId]?.shouldExpand || false;
  };

  const shouldSplit = (neighborhoodId) => {
    return stats[neighborhoodId]?.shouldSplit || false;
  };

  const value = {
    neighborhoods,
    stats,
    recommendations,
    loading,
    getAdjacentNeighborhoods,
    getMultiNeighborhoodContent,
    splitNeighborhood,
    getNeighborhoodStats,
    getRecommendations,
    calculateDistance,
    shouldExpand,
    shouldSplit,
    loadNeighborhoodData
  };

  return (
    <NeighborhoodExpansionContext.Provider value={value}>
      {children}
    </NeighborhoodExpansionContext.Provider>
  );
};
