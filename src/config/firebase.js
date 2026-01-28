import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAuth } from 'firebase/auth';

// Configuración Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

console.log('🔥 Inicializando Firebase con proyecto:', firebaseConfig.projectId);

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);

// Messaging (solo en producción o si está disponible)
let messaging = null;
try {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging inicializado');
  }
} catch (error) {
  console.log('⚠️ Firebase Messaging no disponible:', error.message);
}

export { messaging };

// Función para obtener token FCM
export const getFCMToken = async () => {
  if (!messaging) {
    console.log('⚠️ Firebase Messaging no está disponible');
    return null;
  }

  try {
    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
      console.log('ℹ️ Este navegador no soporta notificaciones');
      return null;
    }

    // Verificar permisos actuales
    if (Notification.permission === 'denied') {
      console.log('ℹ️ Permisos de notificaciones denegados por el usuario');
      return null;
    }

    const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;
    
    if (!vapidKey) {
      console.log('ℹ️ VAPID key no configurada');
      return null;
    }

    // Solo intentar obtener token si hay permisos o están por defecto
    if (Notification.permission === 'granted' || Notification.permission === 'default') {
      const token = await getToken(messaging, { vapidKey });
      
      if (token) {
        console.log('✅ FCM Token obtenido');
        return token;
      } else {
        console.log('ℹ️ No se pudo obtener el token FCM. Verifica los permisos de notificaciones.');
        return null;
      }
    }

    return null;
  } catch (error) {
    console.log('ℹ️ No se pudo obtener FCM token (no crítico):', error.message);
    return null; // ✅ Retornar null en lugar de throw
  }
};

// Función para escuchar mensajes en foreground
export const onForegroundMessage = (callback) => {
  if (!messaging) {
    console.log('⚠️ Firebase Messaging no está disponible');
    return () => {};
  }

  return onMessage(messaging, callback);
};

export default app;