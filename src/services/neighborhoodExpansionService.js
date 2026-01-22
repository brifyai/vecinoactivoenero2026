// Servicio para gestionar la expansión dinámica de vecindarios
// Implementa lógica de escalabilidad basada en densidad poblacional

const EXPANSION_RULES = {
  MIN_USERS_FOR_EXPANSION: 500,
  MAX_USERS_FOR_SPLIT: 5000,
  DEFAULT_RADIUS_KM: 1,
  EXPANDED_RADIUS_KM: 3,
  SPLIT_RADIUS_KM: 0.5
};

class NeighborhoodExpansionService {
  /**
   * Calcula el radio de búsqueda basado en la densidad de usuarios
   * @param {number} userCount - Número de usuarios en el vecindario
   * @param {number} defaultRadius - Radio por defecto en km
   * @returns {number} Radio ajustado en km
   */
  calculateDynamicRadius(userCount, defaultRadius = EXPANSION_RULES.DEFAULT_RADIUS_KM) {
    if (userCount < EXPANSION_RULES.MIN_USERS_FOR_EXPANSION) {
      // Expandir radio si hay pocos usuarios
      return EXPANSION_RULES.EXPANDED_RADIUS_KM;
    }
    
    if (userCount > EXPANSION_RULES.MAX_USERS_FOR_SPLIT) {
      // Reducir radio si hay muchos usuarios (para dividir)
      return EXPANSION_RULES.SPLIT_RADIUS_KM;
    }
    
    // Radio normal
    return defaultRadius;
  }

  /**
   * Determina si un vecindario debe expandirse
   * @param {number} userCount - Número de usuarios
   * @returns {boolean} True si debe expandirse
   */
  shouldExpand(userCount) {
    return userCount < EXPANSION_RULES.MIN_USERS_FOR_EXPANSION;
  }

  /**
   * Determina si un vecindario debe dividirse
   * @param {number} userCount - Número de usuarios
   * @returns {boolean} True si debe dividirse
   */
  shouldSplit(userCount) {
    return userCount > EXPANSION_RULES.MAX_USERS_FOR_SPLIT;
  }

  /**
   * Calcula la distancia entre dos puntos usando la fórmula de Haversine
   * @param {number} lat1 - Latitud del punto 1
   * @param {number} lon1 - Longitud del punto 1
   * @param {number} lat2 - Latitud del punto 2
   * @param {number} lon2 - Longitud del punto 2
   * @returns {number} Distancia en km
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Obtiene vecindarios adyacentes dentro de un radio
   * @param {object} neighborhood - Vecindario actual
   * @param {array} allNeighborhoods - Todos los vecindarios
   * @param {number} radiusKm - Radio de búsqueda en km
   * @returns {array} Vecindarios adyacentes
   */
  getAdjacentNeighborhoods(neighborhood, allNeighborhoods, radiusKm = EXPANSION_RULES.EXPANDED_RADIUS_KM) {
    if (!neighborhood || !neighborhood.center) {
      return [];
    }

    return allNeighborhoods.filter(n => {
      if (n.id === neighborhood.id) return false;
      
      const distance = this.calculateDistance(
        neighborhood.center.lat,
        neighborhood.center.lon,
        n.center.lat,
        n.center.lon
      );
      
      return distance <= radiusKm;
    });
  }

  /**
   * Obtiene contenido de vecindarios adyacentes con origen marcado
   * @param {array} items - Items de contenido
   * @param {object} currentNeighborhood - Vecindario actual
   * @param {array} allNeighborhoods - Todos los vecindarios
   * @param {number} radiusKm - Radio de búsqueda
   * @returns {array} Items con origen marcado
   */
  getMultiNeighborhoodContent(items, currentNeighborhood, allNeighborhoods, radiusKm) {
    const adjacentNeighborhoods = this.getAdjacentNeighborhoods(
      currentNeighborhood,
      allNeighborhoods,
      radiusKm
    );

    const adjacentIds = adjacentNeighborhoods.map(n => n.id);

    return items.map(item => {
      const isFromCurrent = item.neighborhoodId === currentNeighborhood.id;
      const isFromAdjacent = adjacentIds.includes(item.neighborhoodId);

      if (isFromCurrent) {
        return {
          ...item,
          origin: 'current',
          originLabel: 'Tu vecindario'
        };
      }

      if (isFromAdjacent) {
        const originNeighborhood = allNeighborhoods.find(n => n.id === item.neighborhoodId);
        return {
          ...item,
          origin: 'adjacent',
          originLabel: `Desde ${originNeighborhood?.name || 'vecindario cercano'}`,
          originNeighborhood: originNeighborhood
        };
      }

      return item;
    });
  }

  /**
   * Divide un vecindario en sub-vecindarios
   * @param {object} neighborhood - Vecindario a dividir
   * @param {number} subCount - Número de sub-vecindarios
   * @returns {array} Array de sub-vecindarios
   */
  splitNeighborhood(neighborhood, subCount = 4) {
    if (!neighborhood || !neighborhood.center) {
      return [neighborhood];
    }

    const subNeighborhoods = [];
    const baseRadius = EXPANSION_RULES.SPLIT_RADIUS_KM;

    // Crear sub-vecindarios en cuadrantes
    const offsets = [
      { lat: baseRadius / 2, lon: baseRadius / 2 },    // NE
      { lat: baseRadius / 2, lon: -baseRadius / 2 },   // NW
      { lat: -baseRadius / 2, lon: baseRadius / 2 },   // SE
      { lat: -baseRadius / 2, lon: -baseRadius / 2 }   // SW
    ];

    for (let i = 0; i < Math.min(subCount, offsets.length); i++) {
      const offset = offsets[i];
      subNeighborhoods.push({
        id: `${neighborhood.id}-sub-${i}`,
        name: `${neighborhood.name} - Zona ${i + 1}`,
        parentId: neighborhood.id,
        center: {
          lat: neighborhood.center.lat + offset.lat,
          lon: neighborhood.center.lon + offset.lon
        },
        radius: EXPANSION_RULES.SPLIT_RADIUS_KM,
        userCount: 0,
        createdAt: new Date().toISOString()
      });
    }

    return subNeighborhoods;
  }

  /**
   * Obtiene estadísticas de un vecindario
   * @param {object} neighborhood - Vecindario
   * @param {array} users - Todos los usuarios
   * @returns {object} Estadísticas
   */
  getNeighborhoodStats(neighborhood, users) {
    const usersInNeighborhood = users.filter(u => u.neighborhood === neighborhood.name);
    
    return {
      neighborhoodId: neighborhood.id,
      neighborhoodName: neighborhood.name,
      userCount: usersInNeighborhood.length,
      shouldExpand: this.shouldExpand(usersInNeighborhood.length),
      shouldSplit: this.shouldSplit(usersInNeighborhood.length),
      dynamicRadius: this.calculateDynamicRadius(usersInNeighborhood.length),
      status: this.shouldExpand(usersInNeighborhood.length) 
        ? 'expanding' 
        : this.shouldSplit(usersInNeighborhood.length) 
          ? 'splitting' 
          : 'normal'
    };
  }

  /**
   * Obtiene recomendaciones de acción para un vecindario
   * @param {object} neighborhood - Vecindario
   * @param {array} users - Todos los usuarios
   * @returns {object} Recomendaciones
   */
  getRecommendations(neighborhood, users) {
    const stats = this.getNeighborhoodStats(neighborhood, users);

    const recommendations = {
      stats,
      actions: []
    };

    if (stats.shouldExpand) {
      recommendations.actions.push({
        type: 'expand',
        message: `Vecindario con pocos usuarios (${stats.userCount}). Expandiendo radio de búsqueda a ${stats.dynamicRadius}km.`,
        priority: 'high'
      });
    }

    if (stats.shouldSplit) {
      recommendations.actions.push({
        type: 'split',
        message: `Vecindario muy poblado (${stats.userCount} usuarios). Considerar dividir en sub-vecindarios.`,
        priority: 'medium'
      });
    }

    if (!stats.shouldExpand && !stats.shouldSplit) {
      recommendations.actions.push({
        type: 'normal',
        message: `Vecindario en estado normal (${stats.userCount} usuarios).`,
        priority: 'low'
      });
    }

    return recommendations;
  }
}

const neighborhoodExpansionService = new NeighborhoodExpansionService();
export default neighborhoodExpansionService;
