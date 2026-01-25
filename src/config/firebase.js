import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAuth } from 'firebase/auth';

// Configuración Firebase - Reemplaza con tus credenciales
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "vecino-activo.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "vecino-activo",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "vecino-activo.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

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
  }
} catch (error) {
  console.log('Firebase Messaging no disponible:', error.message);
}

export { messaging };

// Función para obtener token FCM
export const getFCMToken = async () => {
  if (!messaging) {
    console.log('Firebase Messaging no está disponible');
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
    });
    
    if (token) {
      console.log('FCM Token obtenido:', token);
      return token;
    } else {
      console.log('No se pudo obtener el token FCM');
      return null;
    }
  } catch (error) {
    console.error('Error obteniendo FCM token:', error);
    return null;
  }
};

// Función para escuchar mensajes en foreground
export const onForegroundMessage = (callback) => {
  if (!messaging) {
    console.log('Firebase Messaging no está disponible');
    return () => {};
  }

  return onMessage(messaging, callback);
};

// Configuración para desarrollo
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Conectado al emulador de Firestore');
  } catch (error) {
    console.log('No se pudo conectar al emulador:', error.message);
  }
}

export default app;