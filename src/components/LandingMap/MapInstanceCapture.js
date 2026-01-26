import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const MapInstanceCapture = ({ setMapInstance, setCurrentZoom, setMapBounds }) => {
  const map = useMap();
  
  useEffect(() => {
    setMapInstance(map);
    
    // Capturar zoom inicial
    setCurrentZoom(map.getZoom());
    setMapBounds(map.getBounds());
    
    // Escuchar cambios de zoom y movimiento
    const handleZoomEnd = () => {
      setCurrentZoom(map.getZoom());
      setMapBounds(map.getBounds());
    };
    
    const handleMoveEnd = () => {
      setMapBounds(map.getBounds());
    };
    
    map.on('zoomend', handleZoomEnd);
    map.on('moveend', handleMoveEnd);
    
    // Cleanup
    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('moveend', handleMoveEnd);
    };
  }, [map, setMapInstance, setCurrentZoom, setMapBounds]);
  
  return null;
};

export default MapInstanceCapture;