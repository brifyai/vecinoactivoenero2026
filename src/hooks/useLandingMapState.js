import React, { useState, useEffect } from 'react';

export function useLandingMapState() {
  const [showNeighborhoods, setShowNeighborhoods] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(5);
  const [mapBounds, setMapBounds] = useState(null);

  // Centro por defecto (Chile completo)
  const defaultCenter = [-38.7359, -71.4394];
  const defaultZoom = 5;

  return {
    showNeighborhoods,
    setShowNeighborhoods,
    mapInstance,
    setMapInstance,
    currentZoom,
    setCurrentZoom,
    mapBounds,
    setMapBounds,
    defaultCenter,
    defaultZoom
  };
}