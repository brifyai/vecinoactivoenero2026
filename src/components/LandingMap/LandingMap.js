import React, { useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useLandingMapData } from '../../hooks/useLandingMapData';
import { useLandingMapSearch } from '../../hooks/useLandingMapSearch';
import { useLandingMapState } from '../../hooks/useLandingMapState';
import MapInstanceCapture from './MapInstanceCapture';
import MapControls from './MapControls';
import MapStats from './MapStats';
import MapLoadingOverlay from './MapLoadingOverlay';
import MapNoDataMessage from './MapNoDataMessage';
import NeighborhoodsLayer from './NeighborhoodsLayer';
import AddressMarker from './AddressMarker';
import 'leaflet/dist/leaflet.css';
import './LandingMap.css';

// Fix para iconos de Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LandingMap = () => {
  // Custom hooks for data, search, and state management
  const {
    neighborhoodsData,
    loading,
    visibleFeatures,
    filterVisibleFeatures,
    loadNeighborhoods,
    MIN_ZOOM_FOR_UVS
  } = useLandingMapData();

  const {
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
  } = useLandingMapState();

  const {
    searchTerm,
    searchResults,
    showSearchResults,
    searchMode,
    searchingAddress,
    addressMarker,
    handleSearch,
    handleAddressSearch,
    handleSearchModeChange,
    handleSelectUV,
    handleClearSearch,
    setShowSearchResults
  } = useLandingMapSearch(neighborhoodsData, mapInstance);

  // Filter visible features when map bounds or zoom changes
  useEffect(() => {
    filterVisibleFeatures(mapBounds, currentZoom);
  }, [mapBounds, currentZoom, filterVisibleFeatures]);

  // Event handlers
  const handleToggleNeighborhoods = () => {
    setShowNeighborhoods(!showNeighborhoods);
  };

  const handleFocusSearch = () => {
    if (searchMode === 'uv' && searchResults.length > 0) {
      setShowSearchResults(true);
    }
  };

  return (
    <div className="landing-map-container">
      <MapControls
        searchMode={searchMode}
        showNeighborhoods={showNeighborhoods}
        searchTerm={searchTerm}
        searchingAddress={searchingAddress}
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        onSearchModeChange={handleSearchModeChange}
        onToggleNeighborhoods={handleToggleNeighborhoods}
        onSearch={handleSearch}
        onAddressSearch={handleAddressSearch}
        onClearSearch={handleClearSearch}
        onSelectUV={handleSelectUV}
        onFocusSearch={handleFocusSearch}
      />

      <MapNoDataMessage
        loading={loading}
        neighborhoodsData={neighborhoodsData}
        onRetry={loadNeighborhoods}
      />

      <MapStats
        neighborhoodsData={neighborhoodsData}
        currentZoom={currentZoom}
        visibleFeatures={visibleFeatures}
        MIN_ZOOM_FOR_UVS={MIN_ZOOM_FOR_UVS}
      />

      <div className="landing-map-wrapper">
        <MapLoadingOverlay loading={loading} />
        
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapInstanceCapture 
            setMapInstance={setMapInstance} 
            setCurrentZoom={setCurrentZoom} 
            setMapBounds={setMapBounds} 
          />

          <NeighborhoodsLayer
            showNeighborhoods={showNeighborhoods}
            visibleFeatures={visibleFeatures}
            currentZoom={currentZoom}
            MIN_ZOOM_FOR_UVS={MIN_ZOOM_FOR_UVS}
          />

          <AddressMarker addressMarker={addressMarker} />
        </MapContainer>
      </div>
    </div>
  );
};

export default LandingMap;