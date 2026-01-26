import { useState, useEffect } from 'react';
import { showErrorAlert, showInfoToast } from '../utils/sweetalert';

export function useLandingMapData() {
  const [neighborhoodsData, setNeighborhoodsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleFeatures, setVisibleFeatures] = useState([]);

  // Configuración de zoom para mostrar UVs
  const MIN_ZOOM_FOR_UVS = 10;
  const MAX_FEATURES_TO_RENDER = 500;

  // Filtrar features visibles en el viewport actual - versión simplificada para evitar bucles
  const filterVisibleFeatures = (mapBounds, currentZoom) => {
    // Evitar bucles infinitos con verificaciones tempranas
    if (!neighborhoodsData || !mapBounds || currentZoom < MIN_ZOOM_FOR_UVS) {
      // Solo actualizar si realmente hay cambios
      setVisibleFeatures(prev => prev.length > 0 ? [] : prev);
      return;
    }

    // Usar setTimeout para evitar bucles de renderizado
    setTimeout(() => {
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
        const margin = 0.01;
        return !(maxLng < bounds.west - margin || 
                 minLng > bounds.east + margin || 
                 maxLat < bounds.south - margin || 
                 minLat > bounds.north + margin);
      }).slice(0, MAX_FEATURES_TO_RENDER);
      
      // Solo actualizar si hay cambios significativos
      setVisibleFeatures(prev => {
        if (prev.length !== visible.length) {
          return visible;
        }
        return prev;
      });
      
      const filterTime = Date.now() - startTime;
      console.log(`✅ ${visible.length} UVs visibles filtradas en ${filterTime}ms`);
    }, 0);
  };

  const loadNeighborhoods = async () => {
    setLoading(true);
    try {
      console.log('🗺️ Cargando unidades vecinales desde archivo local...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
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
        
        setTimeout(() => {
          console.log('🎯 Datos reales listos para renderizar');
          showInfoToast(`✅ ${data.features.length} unidades vecinales cargadas correctamente`);
        }, 1000);
      } else {
        throw new Error('El archivo no contiene datos válidos de unidades vecinales');
      }
    } catch (error) {
      console.error('❌ Error loading neighborhoods:', error);
      
      let userMessage = 'No se pudieron cargar las unidades vecinales.';
      
      if (error.name === 'AbortError') {
        userMessage = 'El archivo de unidades vecinales es muy grande y tardó demasiado en cargar. Por favor, recarga la página e intenta nuevamente.';
      } else if (error.message.includes('Error del servidor')) {
        userMessage = 'Error del servidor al cargar las unidades vecinales. Verifica tu conexión a internet.';
      } else if (error.message.includes('Failed to fetch')) {
        userMessage = 'Error de conexión. Verifica tu conexión a internet y recarga la página.';
      } else if (error.message.includes('JSON')) {
        userMessage = 'El archivo de unidades vecinales está corrupto. Por favor, contacta al administrador.';
      } else {
        userMessage = `Error al cargar las unidades vecinales: ${error.message}`;
      }
      
      setNeighborhoodsData(null);
      
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

  // Cargar datos al montar el componente
  useEffect(() => {
    loadNeighborhoods();
  }, []);

  return {
    neighborhoodsData,
    loading,
    visibleFeatures,
    filterVisibleFeatures,
    loadNeighborhoods,
    MIN_ZOOM_FOR_UVS
  };
}