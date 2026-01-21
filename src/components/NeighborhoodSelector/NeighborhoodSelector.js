import React, { useState, useEffect } from 'react';
import { useNeighborhood } from '../../context/NeighborhoodContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import './NeighborhoodSelector.css';

const NeighborhoodSelector = ({ onSelect, selectedNeighborhood }) => {
  const { neighborhoods, loading } = useNeighborhood();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState([]);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = neighborhoods.filter(n => 
        n.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.codigo?.toString().includes(searchTerm) ||
        n.comuna?.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10);
      setFilteredNeighborhoods(filtered);
      setShowDropdown(true);
    } else {
      setFilteredNeighborhoods([]);
      setShowDropdown(false);
    }
  }, [searchTerm, neighborhoods]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Buscar el vecindario más cercano
        const nearest = findNearestNeighborhood(latitude, longitude);
        if (nearest) {
          handleSelectNeighborhood(nearest, latitude, longitude);
        } else {
          alert('No se encontró una unidad vecinal cercana');
        }
        setDetectingLocation(false);
      },
      (error) => {
        console.error('Error detecting location:', error);
        alert('No se pudo detectar tu ubicación. Por favor selecciona manualmente.');
        setDetectingLocation(false);
      }
    );
  };

  const findNearestNeighborhood = (lat, lng) => {
    let nearest = null;
    let minDistance = Infinity;

    neighborhoods.forEach(n => {
      if (n.geometry && n.geometry.coordinates) {
        // Calcular centroide aproximado del polígono
        const coords = n.geometry.type === 'Polygon' 
          ? n.geometry.coordinates[0] 
          : n.geometry.coordinates[0][0];
        
        const centroid = calculateCentroid(coords);
        const distance = calculateDistance(lat, lng, centroid[1], centroid[0]);
        
        if (distance < minDistance) {
          minDistance = distance;
          nearest = n;
        }
      }
    });

    return minDistance < 5 ? nearest : null; // Máximo 5km de distancia
  };

  const calculateCentroid = (coords) => {
    let sumLng = 0, sumLat = 0;
    coords.forEach(([lng, lat]) => {
      sumLng += lng;
      sumLat += lat;
    });
    return [sumLng / coords.length, sumLat / coords.length];
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleSelectNeighborhood = (neighborhood, lat = null, lng = null) => {
    // Si no hay coordenadas explícitas, usar el centroide de la unidad vecinal
    let finalLat = lat;
    let finalLng = lng;
    
    if (lat === null && lng === null && neighborhood.geometry && neighborhood.geometry.coordinates) {
      const coords = neighborhood.geometry.type === 'Polygon' 
        ? neighborhood.geometry.coordinates[0] 
        : neighborhood.geometry.coordinates[0][0];
      const centroid = calculateCentroid(coords);
      finalLng = centroid[0];
      finalLat = centroid[1];
    }
    
    onSelect({
      neighborhoodId: neighborhood.id,
      neighborhoodName: neighborhood.nombre,
      neighborhoodCode: neighborhood.codigo,
      latitude: finalLat,
      longitude: finalLng
    });
    setSearchTerm(neighborhood.nombre);
    setShowDropdown(false);
  };

  return (
    <div className="neighborhood-selector">
      <label>Unidad Vecinal</label>
      <div className="selector-input-group">
        <div className="selector-input-wrapper">
          <SearchIcon className="selector-icon" />
          <input
            type="text"
            placeholder="Busca tu unidad vecinal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm && setShowDropdown(true)}
          />
        </div>
        <button
          type="button"
          className="detect-location-btn"
          onClick={handleDetectLocation}
          disabled={detectingLocation}
          title="Detectar mi ubicación"
        >
          <MyLocationIcon />
          {detectingLocation ? 'Detectando...' : ''}
        </button>
      </div>

      {showDropdown && filteredNeighborhoods.length > 0 && (
        <div className="neighborhood-dropdown">
          {filteredNeighborhoods.map(n => (
            <div
              key={n.id}
              className="neighborhood-option"
              onClick={() => handleSelectNeighborhood(n)}
            >
              <LocationOnIcon className="option-icon" />
              <div className="option-content">
                <div className="option-name">UV {n.codigo} - {n.nombre}</div>
                <div className="option-location">{n.comuna}, {n.region}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedNeighborhood && selectedNeighborhood.neighborhoodName && (
        <div className="selected-neighborhood">
          <LocationOnIcon />
          <span>UV {selectedNeighborhood.neighborhoodCode} - {selectedNeighborhood.neighborhoodName}</span>
        </div>
      )}

      <p className="selector-help">
        💡 Selecciona tu unidad vecinal para conectar con tus vecinos
      </p>
    </div>
  );
};

export default NeighborhoodSelector;
