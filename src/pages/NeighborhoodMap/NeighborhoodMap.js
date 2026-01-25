import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useSidebar } from '../../context/SidebarContext';
import { showInfoToast } from '../../utils/sweetalert';
import 'leaflet/dist/leaflet.css';
import './NeighborhoodMap.css';

// Material UI Icons
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

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

// Componente para capturar la instancia del mapa
const MapInstanceCapture = ({ setMapInstance }) => {
  const map = useMap();
  
  useEffect(() => {
    setMapInstance(map);
  }, [map, setMapInstance]);
  
  return null;
};

const NeighborhoodMap = () => {
  const { user } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();
  const [loading, setLoading] = useState(false); // Sin carga de datos externos
  const [showNeighborhoods, setShowNeighborhoods] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const [searchMode, setSearchMode] = useState('address');

  // Centro en Santiago, Chile
  const defaultCenter = [-33.4489, -70.6693];
  const defaultZoom = 12;

  // Redimensionar el mapa cuando cambia el estado del sidebar
  useEffect(() => {
    if (mapInstance) {
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 300);
    }
  }, [isRightSidebarCollapsed, mapInstance]);

  // Búsqueda simple de direcciones usando Nominatim
  const handleAddressSearch = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 5) {
      showInfoToast('Ingresa una dirección más específica');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: `${searchTerm}, Chile`,
        format: 'json',
        countrycodes: 'cl',
        limit: '1'
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: {
          'User-Agent': 'VecinoActivo/1.0'
        }
      });

      if (response.ok) {
        const results = await response.json();
        if (results.length > 0) {
          const result = results[0];
          const lat = parseFloat(result.lat);
          const lon = parseFloat(result.lon);
          
          if (mapInstance) {
            mapInstance.setView([lat, lon], 16);
            showInfoToast(`Ubicación encontrada: ${result.display_name}`);
          }
        } else {
          showInfoToast('No se encontró la dirección');
        }
      }
    } catch (error) {
      console.error('Error buscando dirección:', error);
      showInfoToast('Error al buscar la dirección');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, mapInstance]);

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddressSearch();
    }
  };

  return (
    <div className={`neighborhood-map-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="map-header">
        <h1>Mapa de Chile</h1>
        <p>Explora ubicaciones y direcciones en Chile</p>
      </div>

      {/* Buscador simplificado */}
      <div className="map-search-container">
        <div className="search-mode-selector">
          <button className="mode-btn active">
            <LocationOnIcon fontSize="small" /> Buscar Dirección
          </button>
          <button 
            className={`mode-btn ${showNeighborhoods ? 'active' : ''}`}
            onClick={() => {
              setShowNeighborhoods(!showNeighborhoods);
              showInfoToast(showNeighborhoods ? 'Función de vecindarios deshabilitada' : 'Función de vecindarios no disponible sin backend');
            }}
            title="Función requiere backend"
          >
            {showNeighborhoods ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
            Vecindarios (No disponible)
          </button>
        </div>

        <div className="map-search-wrapper">
          <input
            type="text"
            className="map-search-input"
            placeholder="Buscar dirección en Chile (ej: Av. Libertador 1234, Santiago)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {searchTerm && (
            <button className="map-search-clear" onClick={handleClearSearch}>
              <CloseIcon fontSize="small" />
            </button>
          )}
          <button 
            className="map-search-btn" 
            onClick={handleAddressSearch}
            disabled={loading}
          >
            <SearchIcon fontSize="small" />
          </button>
        </div>
      </div>

      {/* Estadísticas simplificadas */}
      <div className="map-stats">
        <div className="stat-card">
          <span className="stat-number">Mapa</span>
          <span className="stat-label">Interactivo</span>
          <span className="stat-note">OpenStreetMap</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">Chile</span>
          <span className="stat-label">Cobertura</span>
          <span className="stat-note">Nacional</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">Búsqueda</span>
          <span className="stat-label">Direcciones</span>
          <span className="stat-note">Nominatim</span>
        </div>
      </div>

      {/* Mapa simplificado */}
      <div className="map-container">
        {loading && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>Buscando dirección...</p>
          </div>
        )}
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Capturar instancia del mapa */}
          <MapInstanceCapture setMapInstance={setMapInstance} />
        </MapContainer>
      </div>

      {/* Mensaje informativo */}
      <div className="map-info-panel">
        <h3>ℹ️ Información del Mapa</h3>
        <ul>
          <li>✅ <strong>Búsqueda de direcciones</strong> - Funcional con OpenStreetMap</li>
          <li>❌ <strong>Datos de vecindarios</strong> - Requiere backend con datos GeoJSON</li>
          <li>🗺️ <strong>Mapa base</strong> - OpenStreetMap gratuito</li>
          <li>🔍 <strong>Geocodificación</strong> - Nominatim (OpenStreetMap)</li>
        </ul>
        <p className="map-note">
          Para habilitar los datos de vecindarios, necesitas configurar un backend 
          con los archivos GeoJSON de las Unidades Vecinales de Chile.
        </p>
      </div>
    </div>
  );
};

export default NeighborhoodMap;
