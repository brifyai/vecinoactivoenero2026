import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import useFirebaseNotifications from '../../hooks/useFirebaseNotifications';
import useFirebaseMessages from '../../hooks/useFirebaseMessages';

const FirebaseInitializer = ({ children }) => {
  const { user } = useSelector(state => state.auth);
  const userId = user?.id;

  // Inicializar hooks de Firebase
  const {
    initialize: initializeNotifications,
    requestNotificationPermission,
    initialized: notificationsInitialized
  } = useFirebaseNotifications(userId);

  const {
    subscribeToConversations
  } = useFirebaseMessages(userId);

  useEffect(() => {
    const initializeFirebase = async () => {
      if (!userId) return;

      console.log('🔥 Inicializando Firebase para usuario:', userId);

      try {
        // 1. Solicitar permisos de notificación
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
          console.log('✅ Permisos de notificación concedidos');
        } else {
          console.log('❌ Permisos de notificación denegados');
        }

        // 2. Inicializar notificaciones Firebase
        await initializeNotifications();

        // 3. Suscribirse a conversaciones
        const unsubscribeConversations = subscribeToConversations();

        console.log('🚀 Firebase inicializado completamente');

        // Cleanup function
        return () => {
          if (unsubscribeConversations) {
            unsubscribeConversations();
          }
        };
      } catch (error) {
        console.error('❌ Error inicializando Firebase:', error);
      }
    };

    initializeFirebase();
  }, [userId, initializeNotifications, requestNotificationPermission, subscribeToConversations]);

  // Mostrar indicador de estado (opcional)
  useEffect(() => {
    if (userId && notificationsInitialized) {
      console.log('🎉 Firebase completamente inicializado y listo');
      
      // Opcional: Mostrar toast de éxito
      if (window.showSuccessToast) {
        window.showSuccessToast('Notificaciones en tiempo real activadas');
      }
    }
  }, [userId, notificationsInitialized]);

  // Manejar clicks en notificaciones del service worker
  useEffect(() => {
    const handleNotificationClick = (event) => {
      console.log('Click en notificación desde service worker:', event.data);
      
      // Manejar navegación basada en el tipo de notificación
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        const notificationData = event.data.data;
        
        if (notificationData?.url) {
          // Navegar a la URL específica
          window.location.href = notificationData.url;
        } else if (notificationData?.type === 'message') {
          // Navegar a mensajes
          window.location.href = '/app/messenger';
        } else if (notificationData?.type === 'friend_request') {
          // Navegar a solicitudes de amistad
          window.location.href = '/app/friends';
        }
      }
    };

    // Escuchar mensajes del service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleNotificationClick);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleNotificationClick);
      };
    }
  }, []);

  return children;
};

export default FirebaseInitializer;