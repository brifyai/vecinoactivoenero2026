import { useState } from 'react';
import { showErrorAlert, showSuccessAlert, showInfoToast } from '../utils/sweetalert';

export function useLandingMapSearch(neighborhoodsData, mapInstance) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchMode, setSearchMode] = useState('uv'); // 'uv' o 'address'
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [addressMarker, setAddressMarker] = useState(null);

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
          
          setAddressMarker({
            position: [lat, lon],
            address: result.display_name,
            result: result
          });

          const targetZoom = 13;
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

    const targetZoom = 13;
    mapInstance.setView([centerLat, centerLng], targetZoom);

    // Abrir popup después de que se carguen las UVs
    setTimeout(() => {
      const layers = mapInstance._layers;
      Object.values(layers).forEach(layer => {
        if (layer.feature && layer.feature.properties.t_id_uv_ca === uv.id) {
          layer.openPopup();
        }
      });
    }, 800);
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
    setAddressMarker(null);
  };

  return {
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
  };
}