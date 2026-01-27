import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useReduxAuth as useAuth } from '../../hooks/useReduxAuth';
import { useSidebar } from '../../context/SidebarContext';
import { showInfoToast, showErrorToast } from '../../utils/sweetalert';
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
  const [loading, setLoading] = useState(false);
  const [showNeighborhoods, setShowNeighborhoods] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapInstance, setMapInstance] = useState(null);
  const [allGeoJsonData, setAllGeoJsonData] = useState(null); // Todos los datos
  const [visibleGeoJsonData, setVisibleGeoJsonData] = useState(null); // Solo los visibles
  const [loadError, setLoadError] = useState(null);
  const [stats, setStats] = useState({ total: 0, visible: 0, loaded: false });
  const [currentZoom, setCurrentZoom] = useState(12);
  const geoJsonLayerRef = useRef(null);
  const loadTimeoutRef = useRef(null);

  // Centro en Santiago, Chile
  const defaultCenter = [-33.4489, -70.6693];
  const defaultZoom = 12;
  const MIN_ZOOM_TO_LOAD = 11; // Zoom mínimo para cargar unidades vecinales

  // Cargar TODOS los datos GeoJSON una sola vez (en background)
  useEffect(() => {
    const loadAllGeoJSON = async () => {
      try {
        console.log('🗺️ Cargando índice de unidades vecinales...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos
        
        const response = await fetch('/data/geo/unidades_vecinales_simple.geojson', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || !data.features || !Array.isArray(data.features)) {
          throw new Error('Formato de GeoJSON inválido');
        }
        
        console.log(`✅ Índice cargado: ${data.features.length} unidades vecinales`);
        
        setAllGeoJsonData(data);
        setStats(prev => ({
          ...prev,
          total: data.features.length,
          loaded: true
        }));
        
      } catch (error) {
        console.error('❌ Error cargando índice:', error);
        setLoadError(error.message);
        showErrorToast('Error al cargar datos del mapa.');
      }
    };

    loadAllGeoJSON();
  }, []);

  // Filtrar unidades vecinales visibles según bounds del mapa
  const filterVisibleFeatures = useCallback((bounds, zoom) => {
    if (!allGeoJsonData || !bounds) return null;

    // No mostrar si el zoom es muy bajo
    if (zoom < MIN_ZOOM_TO_LOAD) {
      console.log(`⚠️ Zoom ${zoom} muy bajo. Mínimo: ${MIN_ZOOM_TO_LOAD}`);
      return null;
    }

    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();

    console.log(`🔍 Filtrando unidades en bounds:`, { south, west, north, east, zoom });

    const visibleFeatures = allGeoJsonData.features.filter(feature => {
      if (!feature.geometry || !feature.geometry.coordinates) return false;

      // Para polígonos, verificar si algún punto está dentro de los bounds
      const coords = feature.geometry.coordinates;
      
      // Función para verificar si un punto está en los bounds
      const isInBounds = (lon, lat) => {
        return lat >= south && lat <= north && lon >= west && lon <= east;
      };

      // Verificar según el tipo de geometría
      if (feature.geometry.type === 'Polygon') {
        // Verificar el primer anillo del polígono
        return coords[0].some(([lon, lat]) => isInBounds(lon, lat));
      } else if (feature.geometry.type === 'MultiPolygon') {
        // Verificar todos los polígonos
        return coords.some(polygon => 
          polygon[0].some(([lon, lat]) => isInBounds(lon, lat))
        );
      }

      return false;
    });

    console.log(`✅ ${visibleFeatures.length} unidades visibles de ${allGeoJsonData.features.length}`);

    return {
      type: 'FeatureCollection',
      features: visibleFeatures
    };
  }, [allGeoJsonData]);

  // Actualizar unidades visibles cuando cambia el mapa
  const updateVisibleFeatures = useCallback(() => {
    if (!mapInstance || !allGeoJsonData || !showNeighborhoods) {
      setVisibleGeoJsonData(null);
      return;
    }

    // Cancelar timeout anterior si existe
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    // Debounce: esperar 300ms después de que el usuario deje de moverse
    loadTimeoutRef.current = setTimeout(() => {
      setLoading(true);
      
      const bounds = mapInstance.getBounds();
      const zoom = mapInstance.getZoom();
      setCurrentZoom(zoom);

      const filtered = filterVisibleFeatures(bounds, zoom);
      
      setVisibleGeoJsonData(filtered);
      setStats(prev => ({
        ...prev,
        visible: filtered ? filtered.features.length : 0
      }));
      
      setLoading(false);
    }, 300);
  }, [mapInstance, allGeoJsonData, showNeighborhoods, filterVisibleFeatures]);

  // Escuchar eventos del mapa
  useEffect(() => {
    if (!mapInstance) return;

    // Actualizar al mover o hacer zoom
    mapInstance.on('moveend', updateVisibleFeatures);
    mapInstance.on('zoomend', updateVisibleFeatures);

    // Cargar inicial
    updateVisibleFeatures();

    return () => {
      mapInstance.off('moveend', updateVisibleFeatures);
      mapInstance.off('zoomend', updateVisibleFeatures);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [mapInstance, updateVisibleFeatures]);

  // Actualizar cuando se muestra/oculta la capa
  useEffect(() => {
    updateVisibleFeatures();
  }, [showNeighborhoods, updateVisibleFeatures]);

  // Estilo para las unidades vecinales
  const getFeatureStyle = useCallback((feature) => {
    return {
      fillColor: '#667eea',
      weight: 1,
      opacity: 0.8,
      color: '#4c51bf',
      fillOpacity: 0.3
    };
  }, []);

  // Evento al hacer hover sobre una unidad vecinal
  const onEachFeature = useCallback((feature, layer) => {
    const properties = feature.properties || {};
    
    // Usar las propiedades correctas del GeoJSON
    const codigoUV = properties.uv_carto || 'S/N';
    const nombre = properties.t_uv_nom || 'Sin nombre';
    const comuna = properties.t_com_nom || 'Sin comuna';
    const region = properties.t_reg_nom || 'Sin región';
    
    // Datos demográficos
    const personas = properties.PERSONAS ? parseInt(properties.PERSONAS).toLocaleString('es-CL') : null;
    const hogares = properties.HOGARES ? parseInt(properties.HOGARES).toLocaleString('es-CL') : null;
    const hombres = properties.HOMBRE ? parseInt(properties.HOMBRE).toLocaleString('es-CL') : null;
    const mujeres = properties.MUJER ? parseInt(properties.MUJER).toLocaleString('es-CL') : null;
    
    console.log('🗺️ UV:', codigoUV, '-', nombre, '-', comuna);
    
    // Popup con información completa - usar openPopup en lugar de bindPopup para mantenerlo abierto
    const popupContent = `
      <div style="padding: 12px; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; color: #667eea; font-size: 16px;">UV ${codigoUV}</h3>
        <p style="margin: 5px 0; font-size: 14px;"><strong>${nombre}</strong></p>
        <p style="margin: 5px 0; font-size: 13px; color: #666;">📍 ${comuna}, ${region}</p>
        
        ${personas ? `
        <div style="background: #f8faff; padding: 10px; border-radius: 8px; margin: 10px 0; border-left: 3px solid #667eea;">
          <p style="margin: 3px 0; font-size: 13px;"><strong>👥 ${personas}</strong> personas</p>
          ${hombres && mujeres ? `<p style="margin: 3px 0; font-size: 12px; color: #666;">${hombres} hombres • ${mujeres} mujeres</p>` : ''}
          ${hogares ? `<p style="margin: 3px 0; font-size: 13px;">🏠 ${hogares} hogares</p>` : ''}
          <p style="margin: 6px 0 0 0; font-size: 10px; color: #666; font-style: italic;">📊 Censo 2017</p>
        </div>
        ` : `
        <div style="background: #fff3e0; padding: 8px; border-radius: 6px; margin: 10px 0;">
          <p style="margin: 0; font-size: 12px; color: #666;">ℹ️ Datos demográficos no disponibles</p>
        </div>
        `}
      </div>
    `;
    
    // Configurar popup con opción de mantenerlo abierto
    layer.bindPopup(popupContent, {
      closeButton: true,
      autoClose: false,  // No cerrar automáticamente al hacer click en otro lugar
      closeOnClick: false  // No cerrar al hacer click en el mapa
    });

    // Hover effect
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          fillOpacity: 0.5
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 1,
          fillOpacity: 0.3
        });
      }
      // Removido el click que hacía fitBounds para que el popup no desaparezca
    });
  }, [mapInstance]);

  // Redimensionar el mapa cuando cambia el estado del sidebar
  useEffect(() => {
    if (mapInstance) {
      const timer = setTimeout(() => {
        try {
          mapInstance.invalidateSize();
        } catch (error) {
          console.warn('Error al redimensionar mapa:', error);
        }
      }, 300);
      
      return () => clearTimeout(timer);
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
        <h1>Mapa de Unidades Vecinales</h1>
        <p>Explora las unidades vecinales de Chile</p>
      </div>

      {/* Buscador */}
      <div className="map-search-container">
        <div className="search-mode-selector">
          <button className="mode-btn active">
            <LocationOnIcon fontSize="small" /> Buscar Dirección
          </button>
          <button 
            className={`mode-btn ${showNeighborhoods ? 'active' : ''}`}
            onClick={() => setShowNeighborhoods(!showNeighborhoods)}
          >
            {showNeighborhoods ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
            {showNeighborhoods ? 'Ocultar' : 'Mostrar'} Vecindarios
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

      {/* Estadísticas */}
      <div className="map-stats">
        <div className="stat-card">
          <span className="stat-number">{stats.total.toLocaleString()}</span>
          <span className="stat-label">Total Unidades</span>
          <span className="stat-note">En Chile</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.visible.toLocaleString()}</span>
          <span className="stat-label">Visibles</span>
          <span className="stat-note">En viewport</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">Zoom {currentZoom}</span>
          <span className="stat-label">Nivel</span>
          <span className="stat-note">{currentZoom >= MIN_ZOOM_TO_LOAD ? 'Activo' : 'Inactivo'}</span>
        </div>
      </div>

      {/* Mapa */}
      <div className="map-container">
        {loading && stats.visible > 0 && (
          <div className="map-loading-overlay">
            <div className="loading-spinner-small"></div>
            <p>Cargando {stats.visible} unidades...</p>
          </div>
        )}
        
        {!stats.loaded && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>Cargando índice de unidades vecinales...</p>
          </div>
        )}
        
        {loadError && (
          <div className="map-error">
            <p>❌ Error: {loadError}</p>
            <button onClick={() => window.location.reload()}>Recargar</button>
          </div>
        )}
        
        {currentZoom < MIN_ZOOM_TO_LOAD && stats.loaded && (
          <div className="map-zoom-hint">
            <p>🔍 Haz zoom para ver las unidades vecinales (mínimo nivel {MIN_ZOOM_TO_LOAD})</p>
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

          {/* Capa GeoJSON de unidades vecinales VISIBLES */}
          {visibleGeoJsonData && showNeighborhoods && currentZoom >= MIN_ZOOM_TO_LOAD && (
            <GeoJSON
              key={`geojson-${showNeighborhoods}`}
              data={visibleGeoJsonData}
              style={getFeatureStyle}
              onEachFeature={onEachFeature}
              ref={geoJsonLayerRef}
            />
          )}
        </MapContainer>
      </div>

      {/* Panel informativo */}
      <div className="map-info-panel">
        <h3>ℹ️ Información del Mapa</h3>
        <ul>
          <li>✅ <strong>Carga inteligente</strong> - Solo muestra unidades visibles</li>
          <li>✅ <strong>Total disponible</strong> - {stats.total.toLocaleString()} unidades en Chile</li>
          <li>✅ <strong>Actualmente visibles</strong> - {stats.visible.toLocaleString()} unidades</li>
          <li>🔍 <strong>Zoom mínimo</strong> - Nivel {MIN_ZOOM_TO_LOAD} para ver unidades</li>
          <li>🗺️ <strong>Performance</strong> - Carga bajo demanda al navegar</li>
        </ul>
        <p className="map-note">
          Las unidades vecinales se cargan automáticamente cuando haces zoom o te mueves por el mapa.
          Solo se muestran las que están en tu vista actual para mejor rendimiento.
        </p>
      </div>
    </div>
  );
};

export default NeighborhoodMap;
