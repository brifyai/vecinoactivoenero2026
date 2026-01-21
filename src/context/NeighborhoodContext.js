import React, { createContext, useContext, useState, useEffect } from 'react';

const NeighborhoodContext = createContext();

export const useNeighborhood = () => {
  const context = useContext(NeighborhoodContext);
  if (!context) {
    throw new Error('useNeighborhood must be used within NeighborhoodProvider');
  }
  return context;
};

export const NeighborhoodProvider = ({ children }) => {
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  useEffect(() => {
    loadNeighborhoods();
  }, []);

  const loadNeighborhoods = async () => {
    try {
      setLoading(true);
      // Cargar GeoJSON de unidades vecinales
      const response = await fetch('/data/geo/unidades_vecinales_simple.geojson');
      const data = await response.json();
      
      // Procesar features (actualizado para GeoJSON 2024v4 + Censo 2017)
      const processedNeighborhoods = data.features.map(feature => ({
        id: feature.properties.t_id_uv_ca,
        codigo: feature.properties.uv_carto,
        nombre: feature.properties.t_uv_nom,
        comuna: feature.properties.t_com_nom,
        region: feature.properties.t_reg_nom,
        personas: feature.properties.PERSONAS || 0, // Datos del Censo 2017
        hogares: feature.properties.HOGARES || 0,   // Datos del Censo 2017
        geometry: feature.geometry,
        properties: feature.properties
      }));

      setNeighborhoods(processedNeighborhoods);
      setLoading(false);
    } catch (error) {
      console.error('Error loading neighborhoods:', error);
      setLoading(false);
    }
  };

  const findNeighborhoodByCoords = (lat, lng) => {
    // Buscar unidad vecinal que contenga las coordenadas
    // Implementación simplificada - en producción usar turf.js
    return neighborhoods.find(n => {
      // Por ahora retornar la primera (mejorar con point-in-polygon)
      return true;
    });
  };

  const getNeighborhoodById = (id) => {
    return neighborhoods.find(n => n.id === id);
  };

  const value = {
    neighborhoods,
    loading,
    selectedNeighborhood,
    setSelectedNeighborhood,
    findNeighborhoodByCoords,
    getNeighborhoodById
  };

  return (
    <NeighborhoodContext.Provider value={value}>
      {children}
    </NeighborhoodContext.Provider>
  );
};
