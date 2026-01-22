// Servicio de geolocalización para obtener ubicación del usuario
// y validar ubicación dentro del vecindario

class GeolocationService {
  // Obtener ubicación actual del usuario
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada en este navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          reject(new Error(`Error de geolocalización: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // Obtener ubicación aproximada (con radio de incertidumbre)
  getApproximateLocation(latitude, longitude, radiusMeters = 300) {
    // Agregar ruido aleatorio para privacidad
    const offsetLat = (radiusMeters / 111000) * (Math.random() - 0.5) * 2;
    const offsetLon = (radiusMeters / (111000 * Math.cos((latitude * Math.PI) / 180))) * (Math.random() - 0.5) * 2;

    return {
      latitude: latitude + offsetLat,
      longitude: longitude + offsetLon,
      radiusMeters
    };
  }

  // Calcular distancia entre dos puntos (Haversine formula)
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
    return R * c; // Distancia en metros
  }

  // Verificar si una ubicación está dentro de un radio
  isWithinRadius(lat1, lon1, lat2, lon2, radiusMeters) {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= radiusMeters;
  }

  // Obtener ubicación por dirección (usando geolocalización inversa)
  // Nota: Esto requeriría una API externa como Google Maps o Nominatim
  async getLocationFromAddress(address) {
    // Placeholder - implementar con API real
    console.warn('getLocationFromAddress requiere API externa');
    return null;
  }

  // Validar ubicación por código postal
  validatePostalCode(postalCode) {
    // Placeholder - implementar con validación real
    // Por ahora solo validar formato
    const chileanPostalCodeRegex = /^\d{7}$/;
    return chileanPostalCodeRegex.test(postalCode);
  }

  // Obtener código postal desde coordenadas (requiere API)
  async getPostalCodeFromCoordinates(latitude, longitude) {
    // Placeholder - implementar con API real
    console.warn('getPostalCodeFromCoordinates requiere API externa');
    return null;
  }

  // Monitorear cambios de ubicación
  watchLocation(onLocationChange, onError) {
    if (!navigator.geolocation) {
      onError(new Error('Geolocalización no soportada'));
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        onLocationChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        onError(new Error(`Error monitoreando ubicación: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );

    return watchId;
  }

  // Detener monitoreo de ubicación
  stopWatchingLocation(watchId) {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
}

const geolocationService = new GeolocationService();
export default geolocationService;
