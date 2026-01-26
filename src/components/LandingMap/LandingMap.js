import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from 'react-leaflet';
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

// Componente para capturar la instancia del mapa y eventos de zoom
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

const LandingMap = () => {
  const [neighborhoodsData, setNeighborhoodsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNeighborhoods, setShowNeighborhoods] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [searchMode, setSearchMode] = useState('uv'); // 'uv' o 'address'
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressMarker, setAddressMarker] = useState(null);
  const [currentZoom, setCurrentZoom] = useState(5); // Zoom actual del mapa
  const [isDemoData, setIsDemoData] = useState(false); // Indica si se están usando datos de demo
  const [mapBounds, setMapBounds] = useState(null); // Bounds actuales del mapa
  const [visibleFeatures, setVisibleFeatures] = useState([]); // Features visibles en el viewport

  // Configuración de zoom para mostrar UVs
  const MIN_ZOOM_FOR_UVS = 10; // Solo mostrar UVs cuando zoom >= 10
  const MAX_FEATURES_TO_RENDER = 500; // Máximo de UVs a renderizar simultáneamente

  // Centro por defecto (Chile completo)
  const defaultCenter = [-38.7359, -71.4394];
  const defaultZoom = 5;

  // Filtrar features visibles en el viewport actual
  useEffect(() => {
    if (!neighborhoodsData || !mapBounds || currentZoom < MIN_ZOOM_FOR_UVS) {
      setVisibleFeatures([]);
      return;
    }

    console.log('🔍 Filtrando UVs visibles en viewport...');
    const startTime = Date.now();
    
    // Obtener bounds del mapa
    const bounds = {
      north: mapBounds.getNorth(),
      south: mapBounds.getSouth(),
      east: mapBounds.getEast(),
      west: mapBounds.getWest()
    };
    
    // Filtrar features que intersectan con el viewport
    const visible = neighborhoodsData.features.filter(feature => {
      if (!feature.geometry || !feature.geometry.coordinates) return false;
      
      // Obtener bounding box aproximado de la feature
      const coords = feature.geometry.type === 'Polygon' 
        ? feature.geometry.coordinates[0] 
        : feature.geometry.coordinates[0][0];
      
      let minLng = Infinity, maxLng = -Infinity;
      let minLat = Infinity, maxLat = -Infinity;
      
      coords.forEach(([lng, lat]) => {
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      });
      
      // Verificar si intersecta con el viewport (con margen)
      const margin = 0.01; // Margen para pre-cargar UVs cercanas
      return !(maxLng < bounds.west - margin || 
               minLng > bounds.east + margin || 
               maxLat < bounds.south - margin || 
               minLat > bounds.north + margin);
    }).slice(0, MAX_FEATURES_TO_RENDER); // Limitar cantidad máxima
    
    setVisibleFeatures(visible);
    
    const filterTime = Date.now() - startTime;
    console.log(`✅ ${visible.length} UVs visibles filtradas en ${filterTime}ms`);
    
  }, [neighborhoodsData, mapBounds, currentZoom]);

  // Cargar datos de vecindarios al montar el componente
  useEffect(() => {
    loadNeighborhoods();
  }, []);

  const loadNeighborhoods = async () => {
    setLoading(true);
    try {
      console.log('🗺️ Cargando unidades vecinales desde archivo local...');
      
      // Configurar timeout para archivos grandes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos timeout para archivo grande
      
      // Cargar el archivo GeoJSON local con timeout
      const response = await fetch('/data/geo/unidades_vecinales_simple.geojson', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Error HTTP: ${response.status} - ${response.statusText}`);
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }
      
      console.log('📁 Archivo encontrado, parseando JSON...');
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        console.log(`📊 Tamaño del archivo: ${(contentLength / 1024 / 1024).toFixed(2)} MB`);
      }
      
      const data = await response.json();
      
      if (data && data.features && Array.isArray(data.features) && data.features.length > 0) {
        console.log(`✅ Cargadas ${data.features.length} unidades vecinales reales`);
        setNeighborhoodsData(data);
        setIsDemoData(false);
        
        // Mostrar mensaje de éxito
        setTimeout(() => {
          console.log('🎯 Datos reales listos para renderizar');
          showInfoToast(`✅ ${data.features.length} unidades vecinales cargadas correctamente`);
        }, 1000);
      } else {
        throw new Error('El archivo no contiene datos válidos de unidades vecinales');
      }
    } catch (error) {
      console.error('❌ Error loading neighborhoods:', error);
      
      let errorMessage = 'Error desconocido';
      let userMessage = 'No se pudieron cargar las unidades vecinales.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Timeout - El archivo tardó demasiado en cargar';
        userMessage = 'El archivo de unidades vecinales es muy grande y tardó demasiado en cargar. Por favor, recarga la página e intenta nuevamente.';
      } else if (error.message.includes('Error del servidor')) {
        errorMessage = error.message;
        userMessage = 'Error del servidor al cargar las unidades vecinales. Verifica tu conexión a internet.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Error de conexión';
        userMessage = 'Error de conexión. Verifica tu conexión a internet y recarga la página.';
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Error al procesar el archivo de datos';
        userMessage = 'El archivo de unidades vecinales está corrupto. Por favor, contacta al administrador.';
      } else {
        errorMessage = error.message;
        userMessage = `Error al cargar las unidades vecinales: ${error.message}`;
      }
      
      console.log(`❌ Error detallado: ${errorMessage}`);
      
      // No cargar datos de demostración - mantener el estado sin datos
      setNeighborhoodsData(null);
      setIsDemoData(false);
      
      // Mostrar mensaje de error detallado
      setTimeout(() => {
        showErrorAlert(
          'Error de Carga',
          userMessage + '\n\nEl mapa funcionará solo con búsqueda de direcciones hasta que se resuelva el problema.'
        );
      }, 1500);
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

  // Búsqueda por dirección usando Nominatim
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
      // Usar Nominatim para geocodificación
      const params = new URLSearchParams({
        q: `${searchTerm}, Chile`,
        format: 'json',
        countrycodes: 'cl',
        limit: '1',
        addressdetails: '1'
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
          
          // Mostrar marcador en la dirección
          setAddressMarker({
            position: [lat, lon],
            address: result.display_name,
            result: result
          });

          // Hacer zoom a la ubicación (nivel óptimo para ver UVs)
          const targetZoom = 13; // Zoom perfecto para ver UVs y contexto
          mapInstance?.setView([lat, lon], targetZoom);
          
          showSuccessAlert(
            '¡Dirección Encontrada!',
            `Ubicación: ${result.display_name}`
          );
        } else {
          showErrorAlert('Dirección No Encontrada', 'No se encontró la dirección especificada');
        }
      } else {
        throw new Error('Error en la búsqueda');
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

    // Hacer zoom a nivel óptimo para ver las UVs
    const targetZoom = 13; // Nivel perfecto para ver UVs con contexto
    mapInstance.setView([centerLat, centerLng], targetZoom);

    // Abrir popup después de que se carguen las UVs
    setTimeout(() => {
      const layers = mapInstance._layers;
      Object.values(layers).forEach(layer => {
        if (layer.feature && layer.feature.properties.t_id_uv_ca === uv.id) {
          layer.openPopup();
        }
      });
    }, 800); // Más tiempo para que se rendericen las UVs
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
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
            onKeyDown={(e) => {
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

      {/* Mensaje informativo cuando no hay datos */}
      {!loading && !neighborhoodsData && (
        <div className="landing-map-no-data">
          <div className="no-data-message">
            <h3>⚠️ Datos de Unidades Vecinales No Disponibles</h3>
            <p>No se pudieron cargar los datos de las unidades vecinales.</p>
            <p>El mapa funciona solo con búsqueda de direcciones.</p>
            <button 
              className="retry-button"
              onClick={loadNeighborhoods}
            >
              🔄 Reintentar Carga
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas dinámicas - Solo mostrar si hay datos reales */}
      {neighborhoodsData && (
        <div className="landing-map-stats">
          <div className="demo-stat-card">
            <span className="demo-stat-number">{neighborhoodsData.features.length.toLocaleString('es-CL')}</span>
            <span className="demo-stat-label">Unidades Vecinales</span>
            <span className="demo-stat-note">Datos Reales</span>
          </div>
          <div className="demo-stat-card">
            <span className="demo-stat-number">
              {currentZoom >= MIN_ZOOM_FOR_UVS ? visibleFeatures.length : 0}
            </span>
            <span className="demo-stat-label">Visibles</span>
            <span className="demo-stat-note">En Pantalla</span>
          </div>
          <div className="demo-stat-card">
            <span className="demo-stat-number">
              {neighborhoodsData.features
                .filter(f => f.properties.PERSONAS && parseInt(f.properties.PERSONAS) > 0)
                .reduce((sum, f) => sum + (parseInt(f.properties.PERSONAS) || 0), 0)
                .toLocaleString('es-CL')}
            </span>
            <span className="demo-stat-label">Habitantes</span>
            <span className="demo-stat-note">Censo 2017</span>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div className="landing-map-wrapper">
        {loading && (
          <div className="demo-map-loading">
            <div className="demo-loading-spinner"></div>
            <p>Cargando unidades vecinales...</p>
            <p className="demo-loading-tip">💡 Archivo de 75MB - puede tomar 30-60 segundos</p>
            <p className="demo-loading-detail">📊 6,891 unidades vecinales de Santiago</p>
            <div className="demo-loading-progress">
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <p className="progress-text">Descargando datos geográficos...</p>
            </div>
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

          {/* Capturar instancia del mapa y zoom */}
          <MapInstanceCapture setMapInstance={setMapInstance} setCurrentZoom={setCurrentZoom} setMapBounds={setMapBounds} />

          {/* Capa de Unidades Vecinales - Solo visible con zoom suficiente y filtradas por viewport */}
          {showNeighborhoods && visibleFeatures.length > 0 && currentZoom >= MIN_ZOOM_FOR_UVS && (
            <GeoJSON
              key={`geojson-${currentZoom}-${visibleFeatures.length}`} // Force re-render on zoom/viewport change
              data={{
                type: 'FeatureCollection',
                features: visibleFeatures
              }}
              style={{
                fillColor: '#f97316',
                fillOpacity: 0.2,
                color: '#f97316',
                weight: 2
              }}
              onEachFeature={(feature, layer) => {
                console.log('🗺️ Renderizando feature:', feature.properties?.uv_carto);
                
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
                  this.setStyle({ fillOpacity: 0.4, weight: 3 });
                });
                
                layer.on('mouseout', function() {
                  this.setStyle({ fillOpacity: 0.2, weight: 2 });
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
                  <p className="demo-popup-note">💡 Regístrate para conectar con vecinos de esta zona</p>
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