// Servicio de Feed con algoritmo de priorización
// Implementa la Propiedad 1: Priorización de Feed

class FeedService {
  // Pesos de tipo de contenido
  CONTENT_WEIGHTS = {
    need: 1.0,           // Necesidades Locales
    action: 0.8,         // Acciones Comunitarias
    update: 0.5,         // Actualizaciones de Vecinos
    service: 0.3         // Elementos del Directorio
  };

  // Urgencia para necesidades
  URGENCY_WEIGHTS = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  // Calcular relevancia de un item de feed
  calculateRelevance(item, userLocation, currentTime = new Date()) {
    const typeWeight = this.CONTENT_WEIGHTS[item.type] || 0.5;
    const urgency = this.URGENCY_WEIGHTS[item.urgency] || 1;
    
    // Calcular distancia en kilómetros
    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      item.location.latitude,
      item.location.longitude
    ) / 1000;

    // Calcular tiempo transcurrido en horas
    const itemTime = new Date(item.createdAt);
    const timeElapsed = (currentTime - itemTime) / (1000 * 60 * 60);

    // Fórmula de relevancia: R = (W_tipo * U) / ((D + 1)^2 * (T + 1))
    // Donde:
    // W_tipo = peso del tipo de contenido
    // U = urgencia (solo para necesidades)
    // D = distancia en km
    // T = tiempo transcurrido en horas
    
    const relevance = (typeWeight * urgency) / (Math.pow(distance + 1, 2) * (timeElapsed + 1));
    
    return relevance;
  }

  // Calcular distancia usando Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Generar feed priorizado
  generateFeed(needs, actions, updates, services, userLocation, limit = 20) {
    // Convertir todos los items a formato de feed
    const feedItems = [
      ...needs.map(n => ({
        ...n,
        type: 'need',
        urgency: n.urgency,
        location: n.location,
        createdAt: n.createdAt
      })),
      ...actions.map(a => ({
        ...a,
        type: 'action',
        urgency: 'medium', // Las acciones no tienen urgencia
        location: a.location,
        createdAt: a.createdAt
      })),
      ...updates.map(u => ({
        ...u,
        type: 'update',
        urgency: 'low',
        location: u.location,
        createdAt: u.createdAt
      })),
      ...services.map(s => ({
        ...s,
        type: 'service',
        urgency: 'low',
        location: s.location,
        createdAt: s.createdAt
      }))
    ];

    // Calcular relevancia para cada item
    const itemsWithRelevance = feedItems.map(item => ({
      ...item,
      relevance: this.calculateRelevance(item, userLocation)
    }));

    // Ordenar por relevancia (descendente)
    const sortedItems = itemsWithRelevance.sort((a, b) => b.relevance - a.relevance);

    // Retornar los top N items
    return sortedItems.slice(0, limit);
  }

  // Filtrar feed por tipo de contenido
  filterFeedByType(feedItems, types) {
    if (!types || types.length === 0) {
      return feedItems;
    }
    return feedItems.filter(item => types.includes(item.type));
  }

  // Filtrar feed por distancia máxima
  filterFeedByDistance(feedItems, userLocation, maxDistanceKm) {
    return feedItems.filter(item => {
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        item.location.latitude,
        item.location.longitude
      ) / 1000;
      return distance <= maxDistanceKm;
    });
  }

  // Filtrar feed por fecha
  filterFeedByDate(feedItems, maxHoursOld) {
    const now = new Date();
    return feedItems.filter(item => {
      const itemTime = new Date(item.createdAt);
      const hoursOld = (now - itemTime) / (1000 * 60 * 60);
      return hoursOld <= maxHoursOld;
    });
  }

  // Obtener estadísticas del feed
  getFeedStats(feedItems) {
    const stats = {
      total: feedItems.length,
      byType: {},
      byUrgency: {},
      averageRelevance: 0
    };

    let totalRelevance = 0;

    feedItems.forEach(item => {
      // Contar por tipo
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;

      // Contar por urgencia
      stats.byUrgency[item.urgency] = (stats.byUrgency[item.urgency] || 0) + 1;

      // Acumular relevancia
      totalRelevance += item.relevance || 0;
    });

    stats.averageRelevance = feedItems.length > 0 ? totalRelevance / feedItems.length : 0;

    return stats;
  }
}

const feedService = new FeedService();
export default feedService;
