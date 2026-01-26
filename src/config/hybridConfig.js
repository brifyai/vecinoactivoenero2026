// ============================================
// CONFIGURACIÓN HÍBRIDA VECINO ACTIVO
// Supabase (Database/Storage) + Firebase (Realtime/Push)
// ============================================

export const HYBRID_CONFIG = {
  // Servicios principales
  database: 'supabase',        // PostgreSQL self-hosted
  storage: 'supabase',         // Buckets self-hosted
  auth: 'supabase',           // Auth self-hosted
  realtime: 'firebase',       // Firestore realtime
  pushNotifications: 'firebase', // FCM
  
  // Configuración de sync
  sync: {
    enabled: true,
    interval: 30000,           // 30 segundos
    retryAttempts: 3,
    retryDelay: 5000,          // 5 segundos
  },
  
  // Configuración de polling como fallback
  polling: {
    enabled: true,
    interval: 10000,           // 10 segundos
    endpoints: [
      'posts',
      'messages', 
      'notifications',
      'emergency_alerts'
    ]
  },
  
  // Configuración de Firebase
  firebase: {
    collections: {
      posts_sync: 'posts_sync',
      messages_sync: 'messages_sync', 
      notifications_sync: 'notifications_sync',
      emergency_sync: 'emergency_sync',
      user_presence: 'user_presence'
    }
  },
  
  // Configuración de Supabase
  supabase: {
    tables: {
      posts: 'posts',
      messages: 'messages',
      notifications: 'notifications', 
      emergency_alerts: 'emergency_alerts',
      users: 'users'
    }
  }
};

// Función para determinar qué servicio usar
export const getServiceProvider = (serviceType) => {
  return HYBRID_CONFIG[serviceType] || 'supabase';
};

// Función para verificar si un servicio está habilitado
export const isServiceEnabled = (serviceType) => {
  const provider = getServiceProvider(serviceType);
  return provider !== 'disabled';
};

// Configuración de entorno
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    isDevelopment,
    enableLogging: isDevelopment,
    enableDebugMode: isDevelopment,
    useEmulators: isDevelopment && process.env.REACT_APP_USE_EMULATORS === 'true'
  };
};

export default HYBRID_CONFIG;