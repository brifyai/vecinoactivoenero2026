// Configuración de API - solo usar backend en desarrollo
const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001/api' 
  : null; // Sin backend en producción

class NeighborhoodService {
  /**
   * Verificar si el backend está disponible
   */
  isBackendAvailable() {
    return process.env.NODE_ENV === 'development' && API_URL;
  }

  /**
   * Obtener todas las unidades vecinales
   */
  async getAllNeighborhoods() {
    if (!this.isBackendAvailable()) {
      console.log('Backend not available, map will show basic view');
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/neighborhoods`);
      if (!response.ok) {
        throw new Error('Error fetching neighborhoods');
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading neighborhoods:', error);
      return null;
    }
  }

  /**
   * Obtener unidades vecinales por región
   * @param {string} region - Nombre de la región
   */
  async getNeighborhoodsByRegion(region) {
    if (!this.isBackendAvailable()) {
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/neighborhoods/region/${region}`);
      if (!response.ok) {
        throw new Error('Error fetching neighborhoods by region');
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading neighborhoods by region:', error);
      return null;
    }
  }

  /**
   * Obtener unidades vecinales dentro de un bounding box
   * @param {Object} bounds - { minLat, maxLat, minLng, maxLng }
   */
  async getNeighborhoodsByBounds(bounds) {
    if (!this.isBackendAvailable()) {
      return null;
    }

    try {
      const { minLat, maxLat, minLng, maxLng } = bounds;
      const queryParams = new URLSearchParams({
        minLat: minLat.toString(),
        maxLat: maxLat.toString(),
        minLng: minLng.toString(),
        maxLng: maxLng.toString()
      });

      const response = await fetch(`${API_URL}/neighborhoods/bbox?${queryParams}`);
      if (!response.ok) {
        throw new Error('Error fetching neighborhoods by bounds');
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading neighborhoods by bounds:', error);
      return null;
    }
  }

  /**
   * Verificar si el servidor está disponible
   */
  async checkHealth() {
    if (!this.isBackendAvailable()) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/health`);
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Backend server is not available:', error);
      return false;
    }
  }
}

export default new NeighborhoodService();
