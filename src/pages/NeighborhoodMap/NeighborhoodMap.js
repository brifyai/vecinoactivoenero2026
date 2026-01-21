import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, GeoJSON, useMap, Marker, Popup } from 'react-leaflet';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import neighborhoodService from '../../services/neighborhoodService';
import geocodingService from '../../services/geocodingService';
import { showErrorAlert, showSuccessAlert, showInfoToast } from '../../utils/sweetalert';
import 'leaflet/dist/leaflet.css';
import './NeighborhoodMap.css';

// Material UI Icons
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
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
  const [neighborhoodsData, setNeighborhoodsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNeighborhoods, setShowNeighborhoods] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [, setSelectedUV] = useState(null); // Solo se usa el setter
  const [searchMode, setSearchMode] = useState('uv'); // 'uv' o 'address'
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressMarker, setAddressMarker] = useState(null);

  // Centro por defecto (Chile completo)
  const defaultCenter = [-38.7359, -71.4394]; // Centro de Chile
  const defaultZoom = 5; // Zoom para ver todo Chile

  // Cargar datos de vecindarios al montar el componente
  useEffect(() => {
    loadNeighborhoods();
  }, []);

  // Redimensionar el mapa cuando cambia el estado del sidebar
  useEffect(() => {
    if (mapInstance) {
      // Pequeño delay para que la transición CSS termine
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 300);
    }
  }, [isRightSidebarCollapsed, mapInstance]);

  const loadNeighborhoods = async () => {
    setLoading(true);
    try {
      // Verificar si el backend está disponible
      const isHealthy = await neighborhoodService.checkHealth();
      if (!isHealthy) {
        console.warn('Backend not available, map will show only security reports');
        setLoading(false);
        return;
      }

      // Cargar todos los vecindarios de Chile
      const data = await neighborhoodService.getAllNeighborhoods();
      if (data) {
        setNeighborhoodsData(data);
        console.log(`Cargados ${data.features?.length || 0} vecindarios de Chile`);
      }
    } catch (error) {
      console.error('Error loading neighborhoods:', error);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda de UVs
  const handleSearch = (value) => {
    setSearchTerm(value);
    
    if (value.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    if (!neighborhoodsData) return;

    // Si está en modo dirección, no hacer búsqueda automática
    if (searchMode === 'address') {
      return;
    }

    const searchLower = value.toLowerCase();
    const results = neighborhoodsData.features
      .filter(feature => {
        const props = feature.properties;
        const nombre = (props.t_uv_nom || '').toLowerCase();
        const codigo = (props.uv_carto || '').toString();
        const comuna = (props.t_com_nom || '').toLowerCase();
        const region = (props.t_reg_nom || '').toLowerCase();
        
        return nombre.includes(searchLower) ||
               codigo.includes(searchLower) ||
               comuna.includes(searchLower) ||
               region.includes(searchLower);
      })
      .slice(0, 10)
      .map(feature => ({
        id: feature.properties.t_id_uv_ca,
        codigo: feature.properties.uv_carto,
        nombre: feature.properties.t_uv_nom,
        comuna: feature.properties.t_com_nom,
        region: feature.properties.t_reg_nom,
        geometry: feature.geometry,
        feature: feature
      }));

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };

  // Búsqueda por dirección
  const handleAddressSearch = async () => {
    console.log('🔍 handleAddressSearch called');
    console.log('📍 searchTerm:', searchTerm);
    console.log('🗺️ neighborhoodsData:', neighborhoodsData ? 'loaded' : 'not loaded');
    console.log('🔄 searchMode:', searchMode);
    
    if (!searchTerm || searchTerm.length < 5) {
      console.log('❌ Dirección muy corta');
      showErrorAlert(
        'Dirección Incompleta',
        'Por favor ingresa una dirección válida (ej: Av. Libertador Bernardo O\'Higgins 1234, Santiago)'
      );
      return;
    }

    if (!neighborhoodsData) {
      console.log('⏳ Esperando datos del mapa');
      showInfoToast('Esperando que se carguen los datos del mapa...');
      return;
    }

    console.log('✅ Iniciando búsqueda de dirección...');
    setSearchingAddress(true);
    setShowSearchResults(false);
    setAddressMarker(null);

    try {
      console.log('📡 Llamando a geocodingService.findUVByAddress...');
      const result = await geocodingService.findUVByAddress(searchTerm, neighborhoodsData);
      console.log('📦 Resultado recibido:', result);

      if (result.error) {
        console.log('⚠️ Error en resultado:', result.error);
        // Mostrar la ubicación aunque no esté en una UV
        if (result.coordinates) {
          const [lat, lon] = result.coordinates;
          setAddressMarker({
            position: [lat, lon],
            address: result.results[0]?.displayName || searchTerm,
            error: result.error
          });
          mapInstance?.setView([lat, lon], 16);
        }
        showErrorAlert('Dirección No Encontrada', result.error);
      } else if (result.success && result.primaryMatch) {
        console.log('✅ Dirección encontrada exitosamente');
        const match = result.primaryMatch;
        
        // Mostrar marcador en la dirección
        setAddressMarker({
          position: match.coordinates,
          address: match.address.displayName,
          uv: match.uv
        });

        // Hacer zoom a la UV encontrada
        handleSelectUV(match.uv);
        
        // Mostrar mensaje de éxito
        setTimeout(() => {
          showSuccessAlert(
            '¡Dirección Encontrada!',
            `Unidad Vecinal: UV ${match.uv.codigo}\nNombre: ${match.uv.nombre}\nComuna: ${match.uv.comuna}`
          );
        }, 500);
      }
    } catch (error) {
      console.error('💥 Error searching address:', error);
      showErrorAlert(
        'Error de Búsqueda',
        'Error al buscar la dirección. Por favor intenta nuevamente.'
      );
    } finally {
      console.log('🏁 Búsqueda finalizada');
      setSearchingAddress(false);
    }
  };

  // Cambiar modo de búsqueda
  const handleSearchModeChange = (mode) => {
    setSearchMode(mode);
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
    setAddressMarker(null);
  };

  // Seleccionar UV del buscador
  const handleSelectUV = (uv) => {
    if (!mapInstance) return;

    setSelectedUV(uv);
    setSearchTerm(`UV ${uv.codigo} - ${uv.nombre}`);
    setShowSearchResults(false);

    // Calcular centro del polígono
    const coords = uv.geometry.type === 'Polygon' 
      ? uv.geometry.coordinates[0] 
      : uv.geometry.coordinates[0][0];
    
    let sumLat = 0, sumLng = 0;
    coords.forEach(([lng, lat]) => {
      sumLat += lat;
      sumLng += lng;
    });
    const centerLat = sumLat / coords.length;
    const centerLng = sumLng / coords.length;

    // Hacer zoom a la UV
    mapInstance.setView([centerLat, centerLng], 15);

    // Abrir popup (simulando click en el polígono)
    setTimeout(() => {
      const layers = mapInstance._layers;
      Object.values(layers).forEach(layer => {
        if (layer.feature && layer.feature.properties.t_id_uv_ca === uv.id) {
          layer.openPopup();
        }
      });
    }, 500);
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedUV(null);
    setAddressMarker(null);
  };

  return (
    <div className={`neighborhood-map-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="map-header">
        <h1>Mapa de Chile</h1>
        <p>Unidades vecinales de todo Chile</p>
      </div>

      {/* Buscador de UVs y Direcciones */}
      <div className="map-search-container">
        {/* Selector de modo de búsqueda */}
        <div className="search-mode-selector">
          <button
            className={`mode-btn ${searchMode === 'uv' ? 'active' : ''}`}
            onClick={() => handleSearchModeChange('uv')}
          >
            <HomeWorkIcon fontSize="small" /> Buscar UV
          </button>
          <button
            className={`mode-btn ${searchMode === 'address' ? 'active' : ''}`}
            onClick={() => handleSearchModeChange('address')}
          >
            <LocationOnIcon fontSize="small" /> Buscar por Dirección
          </button>
          <button 
            className={`mode-btn toggle-neighborhoods-btn ${showNeighborhoods ? 'active' : ''}`}
            onClick={() => setShowNeighborhoods(!showNeighborhoods)}
            title="Mostrar/Ocultar Unidades Vecinales"
          >
            {showNeighborhoods ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
            {' '}{showNeighborhoods ? 'Ocultar' : 'Mostrar'} Vecindarios
          </button>
        </div>

        <div className="map-search-wrapper">
          <input
            type="text"
            className="map-search-input"
            placeholder={
              searchMode === 'uv'
                ? "Buscar por región, comuna, nombre o código de UV..."
                : "Ingresa tu dirección (ej: Av. Libertador 1234, Santiago)..."
            }
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchMode === 'uv' && searchResults.length > 0 && setShowSearchResults(true)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && searchMode === 'address') {
                handleAddressSearch();
              }
            }}
          />
          {searchTerm && (
            <button className="map-search-clear" onClick={handleClearSearch}>
              <CloseIcon fontSize="small" />
            </button>
          )}
          {searchMode === 'address' ? (
            <button 
              className="map-search-btn" 
              onClick={() => {
                console.log('🖱️ Click en botón de búsqueda');
                handleAddressSearch();
              }}
              disabled={searchingAddress}
            >
              {searchingAddress ? <HourglassEmptyIcon fontSize="small" /> : <SearchIcon fontSize="small" />}
            </button>
          ) : (
            <span className="map-search-icon">
              <SearchIcon fontSize="small" />
            </span>
          )}
        </div>

        {showSearchResults && searchResults.length > 0 && (
          <div className="map-search-results">
            {searchResults.map(uv => (
              <div
                key={uv.id}
                className="map-search-result-item"
                onClick={() => handleSelectUV(uv)}
              >
                <div className="search-result-main">
                  <span className="search-result-code">UV {uv.codigo}</span>
                  <span className="search-result-name">{uv.nombre}</span>
                </div>
                <div className="search-result-location">
                  📍 {uv.comuna}, {uv.region}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estadísticas - Calculadas solo una vez */}
      <div className="map-stats">
        <div className="stat-card">
          <span className="stat-number">{(neighborhoodsData?.features?.length || 0).toLocaleString('es-CL')}</span>
          <span className="stat-label">Unidades Vecinales</span>
          <span className="stat-note">Agosto 2025</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {neighborhoodsData ? 
              neighborhoodsData.features
                .filter(f => f.properties.PERSONAS)
                .reduce((sum, f) => sum + (parseInt(f.properties.PERSONAS) || 0), 0)
                .toLocaleString('es-CL') 
              : 0}
          </span>
          <span className="stat-label">Habitantes</span>
          <span className="stat-note">Censo 2017</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {neighborhoodsData ? 
              neighborhoodsData.features
                .filter(f => f.properties.HOGARES)
                .reduce((sum, f) => sum + (parseInt(f.properties.HOGARES) || 0), 0)
                .toLocaleString('es-CL') 
              : 0}
          </span>
          <span className="stat-label">Hogares</span>
          <span className="stat-note">Censo 2017</span>
        </div>
      </div>

      {/* Mapa */}
      <div className="map-container">
        {loading && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>Cargando 6.891 unidades vecinales...</p>
            <p className="loading-tip">💡 Usa el buscador para encontrar UVs rápidamente</p>
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

          {/* Capa de Unidades Vecinales - Optimizada */}
          {showNeighborhoods && neighborhoodsData && (
            <GeoJSON
              data={neighborhoodsData}
              style={{
                fillColor: '#f97316',
                fillOpacity: 0.1,
                color: '#f97316',
                weight: 1.5
              }}
              onEachFeature={(feature, layer) => {
                if (!feature.properties) return;
                
                const props = feature.properties;
                let nombre = props.t_uv_nom || 'Unidad Vecinal';
                const codigoUV = props.uv_carto || '';
                
                // Limpiar el nombre si ya contiene el código UV
                if (codigoUV && nombre.startsWith(codigoUV)) {
                  nombre = nombre.substring(codigoUV.length).replace(/^[-\s]+/, '').trim();
                }
                
                const comuna = props.t_com_nom || '';
                const region = props.t_reg_nom || '';
                
                // Tooltip simple en hover
                if (codigoUV) {
                  layer.bindTooltip(`UV ${codigoUV} - ${nombre}`, {
                    permanent: false,
                    direction: 'top',
                    className: 'uv-label',
                    opacity: 0.9
                  });
                }
                
                // Efecto hover optimizado
                layer.on('mouseover', function() {
                  this.setStyle({ fillOpacity: 0.3, weight: 2.5 });
                });
                
                layer.on('mouseout', function() {
                  this.setStyle({ fillOpacity: 0.1, weight: 1.5 });
                });
                
                // Popup con datos - Generado solo al hacer click
                layer.on('click', function() {
                  const personas = props.PERSONAS ? parseInt(props.PERSONAS).toLocaleString('es-CL') : '';
                  const hogares = props.HOGARES ? parseInt(props.HOGARES).toLocaleString('es-CL') : '';
                  const hombres = props.HOMBRE ? parseInt(props.HOMBRE).toLocaleString('es-CL') : '';
                  const mujeres = props.MUJER ? parseInt(props.MUJER).toLocaleString('es-CL') : '';
                  const areaVerde = props.AREA_VERDE ? parseFloat(props.AREA_VERDE).toLocaleString('es-CL', { maximumFractionDigits: 0 }) : '';
                  const educacion = props.T_EDUCACIO || 0;
                  const salud = props.TOTAL_SALU || 0;
                  const deportes = props.DEPORTE || 0;
                  
                  // Iconos SVG inline para Material Design
                  const homeIcon = '<svg class="popup-icon" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>';
                  const locationIcon = '<svg class="popup-icon" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
                  const peopleIcon = '<svg class="popup-icon" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>';
                  const houseIcon = '<svg class="popup-icon" viewBox="0 0 24 24"><path d="M19 9.3V4h-3v2.6L12 3 2 12h3v8h5v-6h4v6h5v-8h3l-3-2.7zm-9 .7c0-1.1.9-2 2-2s2 .9 2 2h-4z"/></svg>';
                  const chartIcon = '<svg class="popup-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>';
                  const infoIcon = '<svg class="popup-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
                  const parkIcon = '<svg class="popup-icon" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>';
                  const schoolIcon = '<svg class="popup-icon" viewBox="0 0 24 24"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>';
                  const healthIcon = '<svg class="popup-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>';
                  const sportsIcon = '<svg class="popup-icon" viewBox="0 0 24 24"><path d="M11.23 6c-1.66 0-3.22.66-4.36 1.73C6.54 6.73 5.61 6 4.5 6 2.57 6 1 7.57 1 9.5S2.57 13 4.5 13c.71 0 1.37-.23 1.91-.62.9 1.18 2.26 2.12 3.82 2.12 2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>';
                  
                  const popupContent = `
                    <div class="neighborhood-popup">
                      <h4>${homeIcon} UV ${codigoUV} - ${nombre}</h4>
                      <p class="popup-location">${locationIcon} ${comuna}, ${region}</p>
                      
                      ${personas && parseInt(personas.replace(/\./g, '')) > 0 ? `
                      <div class="popup-compact">
                        <p><strong>${peopleIcon} ${personas}</strong> personas</p>
                        ${hombres && mujeres ? `<p>${hombres} hombres • ${mujeres} mujeres</p>` : ''}
                        <p>${houseIcon} ${hogares} hogares</p>
                        <p class="popup-census">${chartIcon} Censo 2017</p>
                      </div>
                      ` : `
                      <div class="popup-info">
                        <p class="popup-note">${infoIcon} Datos demográficos no disponibles</p>
                      </div>
                      `}
                      
                      ${areaVerde && parseFloat(areaVerde.replace(/\./g, '')) > 0 ? `<p class="popup-green">${parkIcon} ${areaVerde} m² áreas verdes</p>` : ''}
                      
                      ${(educacion > 0 || salud > 0 || deportes > 0) ? `
                      <div class="popup-services">
                        ${educacion > 0 ? `<span>${schoolIcon} ${educacion}</span>` : ''}
                        ${salud > 0 ? `<span>${healthIcon} ${salud}</span>` : ''}
                        ${deportes > 0 ? `<span>${sportsIcon} ${deportes}</span>` : ''}
                      </div>
                      ` : ''}
                    </div>
                  `;
                  
                  this.bindPopup(popupContent, {
                    maxWidth: 280,
                    className: 'compact-popup'
                  }).openPopup();
                });
              }}
            />
          )}

          {/* Marcador de dirección buscada */}
          {addressMarker && (
            <Marker position={addressMarker.position}>
              <Popup>
                <div className="address-popup">
                  <h4><LocationOnIcon fontSize="small" /> Dirección Encontrada</h4>
                  <p className="address-text">{addressMarker.address}</p>
                  {addressMarker.uv ? (
                    <div className="uv-info">
                      <p><strong>Unidad Vecinal:</strong></p>
                      <p>UV {addressMarker.uv.codigo} - {addressMarker.uv.nombre}</p>
                      <p><LocationOnIcon fontSize="small" /> {addressMarker.uv.comuna}, {addressMarker.uv.region}</p>
                    </div>
                  ) : (
                    <p className="no-uv-warning">⚠️ {addressMarker.error}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Círculo de área del usuario (ejemplo) */}
          {user && (
            <Circle
              center={defaultCenter}
              radius={500}
              pathOptions={{
                color: '#f97316',
                fillColor: '#f97316',
                fillOpacity: 0.1
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default NeighborhoodMap;
