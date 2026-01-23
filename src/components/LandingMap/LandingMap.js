import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from 'react-leaflet';
import neighborhoodService from '../../services/neighborhoodService';
import geocodingService from '../../services/geocodingService';
import { showErrorAlert, showSuccessAlert, showInfoToast } from '../../utils/sweetalert';
import 'leaflet/dist/leaflet.css';
import './LandingMap.css';

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

const LandingMap = () => {
  const [neighborhoodsData, setNeighborhoodsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNeighborhoods, setShowNeighborhoods] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedUV, setSelectedUV] = useState(null);
  const [searchMode, setSearchMode] = useState('uv'); // 'uv' o 'address'
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressMarker, setAddressMarker] = useState(null);

  // Centro por defecto (Chile completo)
  const defaultCenter = [-38.7359, -71.4394];
  const defaultZoom = 5;

  // Cargar datos de vecindarios al montar el componente
  useEffect(() => {
    loadNeighborhoods();
  }, []);

  const loadNeighborhoods = async () => {
    setLoading(true);
    try {
      // Verificar si el backend está disponible
      const isHealthy = await neighborhoodService.checkHealth();
      if (!isHealthy) {
        console.warn('Backend not available, map will show basic view');
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
    if (!searchTerm || searchTerm.length < 5) {
      showErrorAlert(
        'Dirección Incompleta',
        'Por favor ingresa una dirección válida (ej: Av. Libertador Bernardo O\'Higgins 1234, Santiago)'
      );
      return;
    }

    if (!neighborhoodsData) {
      showInfoToast('Esperando que se carguen los datos del mapa...');
      return;
    }

    setSearchingAddress(true);
    setShowSearchResults(false);
    setAddressMarker(null);

    try {
      const result = await geocodingService.findUVByAddress(searchTerm, neighborhoodsData);

      if (result.error) {
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
      console.error('Error searching address:', error);
      showErrorAlert(
        'Error de Búsqueda',
        'Error al buscar la dirección. Por favor intenta nuevamente.'
      );
    } finally {
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
    <div className="landing-map-container">
      {/* Controles funcionales */}
      <div className="landing-map-controls">
        <div className="demo-search-modes">
          <button
            className={`demo-mode-btn ${searchMode === 'uv' ? 'active' : ''}`}
            onClick={() => handleSearchModeChange('uv')}
          >
            <HomeWorkIcon fontSize="small" /> Buscar UV
          </button>
          <button
            className={`demo-mode-btn ${searchMode === 'address' ? 'active' : ''}`}
            onClick={() => handleSearchModeChange('address')}
          >
            <LocationOnIcon fontSize="small" /> Buscar por Dirección
          </button>
          <button 
            className={`demo-mode-btn ${showNeighborhoods ? 'active' : ''}`}
            onClick={() => setShowNeighborhoods(!showNeighborhoods)}
          >
            {showNeighborhoods ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
            {' '}{showNeighborhoods ? 'Ocultar' : 'Mostrar'} Vecindarios
          </button>
        </div>

        <div className="demo-search-wrapper">
          <input
            type="text"
            className="demo-search-input"
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
            <button className="demo-search-clear" onClick={handleClearSearch}>
              <CloseIcon fontSize="small" />
            </button>
          )}
          {searchMode === 'address' ? (
            <button 
              className="demo-search-btn" 
              onClick={handleAddressSearch}
              disabled={searchingAddress}
            >
              {searchingAddress ? <HourglassEmptyIcon fontSize="small" /> : <SearchIcon fontSize="small" />}
            </button>
          ) : (
            <span className="demo-search-icon">
              <SearchIcon fontSize="small" />
            </span>
          )}
        </div>

        {showSearchResults && searchResults.length > 0 && (
          <div className="demo-search-results">
            {searchResults.map(uv => (
              <div
                key={uv.id}
                className="demo-search-result-item"
                onClick={() => handleSelectUV(uv)}
              >
                <div className="demo-search-result-main">
                  <span className="demo-search-result-code">UV {uv.codigo}</span>
                  <span className="demo-search-result-name">{uv.nombre}</span>
                </div>
                <div className="demo-search-result-location">
                  📍 {uv.comuna}, {uv.region}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estadísticas dinámicas */}
      <div className="landing-map-stats">
        <div className="demo-stat-card">
          <span className="demo-stat-number">{(neighborhoodsData?.features?.length || 0).toLocaleString('es-CL')}</span>
          <span className="demo-stat-label">Unidades Vecinales</span>
          <span className="demo-stat-note">Agosto 2025</span>
        </div>
        <div className="demo-stat-card">
          <span className="demo-stat-number">
            {neighborhoodsData ? 
              neighborhoodsData.features
                .filter(f => f.properties.PERSONAS)
                .reduce((sum, f) => sum + (parseInt(f.properties.PERSONAS) || 0), 0)
                .toLocaleString('es-CL') 
              : '14.509.980'}
          </span>
          <span className="demo-stat-label">Habitantes</span>
          <span className="demo-stat-note">Censo 2017</span>
        </div>
        <div className="demo-stat-card">
          <span className="demo-stat-number">
            {neighborhoodsData ? 
              neighborhoodsData.features
                .filter(f => f.properties.HOGARES)
                .reduce((sum, f) => sum + (parseInt(f.properties.HOGARES) || 0), 0)
                .toLocaleString('es-CL') 
              : '4.570.447'}
          </span>
          <span className="demo-stat-label">Hogares</span>
          <span className="demo-stat-note">Censo 2017</span>
        </div>
      </div>

      {/* Mapa */}
      <div className="landing-map-wrapper">
        {loading && (
          <div className="demo-map-loading">
            <div className="demo-loading-spinner"></div>
            <p>Cargando 6.891 unidades vecinales...</p>
            <p className="demo-loading-tip">💡 Usa el buscador para encontrar UVs rápidamente</p>
          </div>
        )}
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

          {/* Capturar instancia del mapa */}
          <MapInstanceCapture setMapInstance={setMapInstance} />

          {/* Capa de Unidades Vecinales */}
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
                    className: 'demo-uv-label',
                    opacity: 0.9
                  });
                }
                
                // Efecto hover
                layer.on('mouseover', function() {
                  this.setStyle({ fillOpacity: 0.3, weight: 2.5 });
                });
                
                layer.on('mouseout', function() {
                  this.setStyle({ fillOpacity: 0.1, weight: 1.5 });
                });
                
                // Popup con datos completos
                layer.on('click', function() {
                  const personas = props.PERSONAS ? parseInt(props.PERSONAS).toLocaleString('es-CL') : '';
                  const hogares = props.HOGARES ? parseInt(props.HOGARES).toLocaleString('es-CL') : '';
                  const hombres = props.HOMBRE ? parseInt(props.HOMBRE).toLocaleString('es-CL') : '';
                  const mujeres = props.MUJER ? parseInt(props.MUJER).toLocaleString('es-CL') : '';
                  
                  const popupContent = `
                    <div class="demo-neighborhood-popup">
                      <h4>UV ${codigoUV} - ${nombre}</h4>
                      <p class="demo-popup-location">📍 ${comuna}, ${region}</p>
                      
                      ${personas && parseInt(personas.replace(/\./g, '')) > 0 ? `
                      <div class="demo-popup-compact">
                        <p><strong>👥 ${personas}</strong> personas</p>
                        ${hombres && mujeres ? `<p>${hombres} hombres • ${mujeres} mujeres</p>` : ''}
                        <p>🏠 ${hogares} hogares</p>
                        <p class="demo-popup-census">📊 Censo 2017</p>
                      </div>
                      ` : `
                      <div class="demo-popup-info">
                        <p class="demo-popup-note">ℹ️ Datos demográficos no disponibles</p>
                      </div>
                      `}
                      
                      <p class="demo-popup-note">💡 Únete a Vecino Activo para ver más detalles y conectar con tus vecinos</p>
                    </div>
                  `;
                  
                  this.bindPopup(popupContent, {
                    maxWidth: 280,
                    className: 'demo-compact-popup'
                  }).openPopup();
                });
              }}
            />
          )}

          {/* Marcador de dirección buscada */}
          {addressMarker && (
            <Marker position={addressMarker.position}>
              <Popup>
                <div className="demo-address-popup">
                  <h4>📍 Dirección Encontrada</h4>
                  <p className="demo-address-text">{addressMarker.address}</p>
                  {addressMarker.uv ? (
                    <div className="demo-uv-info">
                      <p><strong>Unidad Vecinal:</strong></p>
                      <p>UV {addressMarker.uv.codigo} - {addressMarker.uv.nombre}</p>
                      <p>📍 {addressMarker.uv.comuna}, {addressMarker.uv.region}</p>
                    </div>
                  ) : (
                    <p className="demo-no-uv-warning">⚠️ {addressMarker.error}</p>
                  )}
                  <p class="demo-popup-note">💡 Regístrate para conectar con vecinos de esta zona</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default LandingMap;