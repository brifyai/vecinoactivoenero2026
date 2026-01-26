// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Configuración Firebase (CREDENCIALES REALES)
const firebaseConfig = {
  apiKey: "AIzaSyBZQYW7aRY1o07IW3NwCXY-v6Q85mMCCNU",
  authDomain: "stratega-ai-x.firebaseapp.com",
  databaseURL: "https://stratega-ai-x-default-rtdb.firebaseio.com",
  projectId: "stratega-ai-x",
  storageBucket: "stratega-ai-x.firebasestorage.app",
  messagingSenderId: "777409222994",
  appId: "1:777409222994:web:4b23f04e44e4a38aca428b"
};

console.log('🔥 Service Worker: Inicializando Firebase');

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obtener instancia de messaging
const messaging = firebase.messaging();

console.log('✅ Service Worker: Firebase Messaging listo');

// Manejar mensajes en background
messaging.onBackgroundMessage((payload) => {
  console.log('📩 Mensaje recibido en background:', payload);

  const notificationTitle = payload.notification?.title || 'Vecino Activo';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificación',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.type || 'general',
    data: payload.data,
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Click en notificación:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Abrir la aplicación
  const urlToOpen = event.notification.data?.url || '/app/feed';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: event.notification.data
          });
          return client.focus();
        }
      }
      
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

console.log('✅ Service Worker: Event listeners configurados');