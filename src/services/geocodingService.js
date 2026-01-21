/**
 * Servicio de Geocodificación
 * Convierte direcciones en coordenadas geográficas usando Nominatim (OpenStreetMap)
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Delay entre requests para respetar la política de uso de Nominatim
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 segundo entre requests

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Geocodificar una dirección en Chile
 * @param {string} address - Dirección a buscar
 * @returns {Promise<Array>} Array de resultados con coordenadas
 */
export const geocodeAddress = async (address) => {
  try {
    // Respetar el rate limit
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }
    lastRequestTime = Date.now();

    // Construir URL de búsqueda
    const params = new URLSearchParams({
      q: address,
      format: 'json',
      countrycodes: 'cl', // Limitar a Chile
      addressdetails: '1',
      limit: '5'
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'User-Agent': 'VecinoActivo/1.0' // Requerido por Nominatim
      }
    });

    if (!response.ok) {
      throw new Error('Error en la geocodificación');
    }

    const results = await response.json();

    // Formatear resultados
    return results.map(result => ({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      address: result.address,
      type: result.type,
      importance: result.importance,
      boundingBox: result.boundingbox
    }));
  } catch (error) {
    console.error('Error geocoding address:', error);
    return [];
  }
};

/**
 * Geocodificación inversa: obtener dirección desde coordenadas
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {Promise<Object>} Información de la dirección
 */
export const reverseGeocode = async (lat, lon) => {
  try {
    // Respetar el rate limit
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await delay(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }
    lastRequestTime = Date.now();

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      format: 'json',
      addressdetails: '1'
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
      headers: {
        'User-Agent': 'VecinoActivo/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Error en la geocodificación inversa');
    }

    const result = await response.json();

    return {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      displayName: result.display_name,
      address: result.address
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

/**
 * Verificar si un punto está dentro de un polígono
 * @param {Array} point - [lat, lon]
 * @param {Object} polygon - Geometría del polígono GeoJSON
 * @returns {boolean}
 */
export const isPointInPolygon = (point, polygon) => {
  const [lat, lon] = point;
  
  // Obtener las coordenadas del polígono
  let coords;
  if (polygon.type === 'Polygon') {
    coords = polygon.coordinates[0];
  } else if (polygon.type === 'MultiPolygon') {
    // Para MultiPolygon, verificar en todos los polígonos
    for (const poly of polygon.coordinates) {
      if (isPointInSimplePolygon([lat, lon], poly[0])) {
        return true;
      }
    }
    return false;
  } else {
    return false;
  }
  
  return isPointInSimplePolygon([lat, lon], coords);
};

/**
 * Algoritmo Ray Casting para verificar si un punto está dentro de un polígono
 * @param {Array} point - [lat, lon]
 * @param {Array} polygon - Array de coordenadas [[lon, lat], ...]
 * @returns {boolean}
 */
const isPointInSimplePolygon = (point, polygon) => {
  const [lat, lon] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
};

/**
 * Encontrar la UV que contiene una dirección
 * @param {string} address - Dirección a buscar
 * @param {Object} neighborhoodsData - Datos GeoJSON de las UVs
 * @returns {Promise<Object>} UV encontrada o null
 */
export const findUVByAddress = async (address, neighborhoodsData) => {
  try {
    // Geocodificar la dirección
    const results = await geocodeAddress(address);
    
    if (results.length === 0) {
      return { error: 'No se encontró la dirección', results: [] };
    }

    // Para cada resultado, buscar la UV que lo contiene
    const matches = [];
    
    for (const result of results) {
      const point = [result.lat, result.lon];
      
      // Buscar en todas las UVs
      for (const feature of neighborhoodsData.features) {
        if (isPointInPolygon(point, feature.geometry)) {
          matches.push({
            uv: {
              id: feature.properties.t_id_uv_ca,
              codigo: feature.properties.uv_carto,
              nombre: feature.properties.t_uv_nom,
              comuna: feature.properties.t_com_nom,
              region: feature.properties.t_reg_nom,
              geometry: feature.geometry,
              feature: feature
            },
            address: result,
            coordinates: point
          });
          break; // Solo necesitamos la primera UV que coincida
        }
      }
    }

    if (matches.length === 0) {
      return { 
        error: 'La dirección no pertenece a ninguna Unidad Vecinal registrada',
        results: results,
        coordinates: results[0] ? [results[0].lat, results[0].lon] : null
      };
    }

    return { 
      success: true, 
      matches: matches,
      primaryMatch: matches[0]
    };
  } catch (error) {
    console.error('Error finding UV by address:', error);
    return { error: 'Error al buscar la dirección' };
  }
};

export default {
  geocodeAddress,
  reverseGeocode,
  isPointInPolygon,
  findUVByAddress
};
