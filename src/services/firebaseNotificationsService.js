import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db, getFCMToken, onForegroundMessage } from '../config/firebase';

class FirebaseNotificationsService {
  constructor() {
    this.fcmToken = null;
    this.unsubscribeForeground = null;
  }

  // Inicializar servicio de notificaciones
  async initialize(userId) {
    try {
      // Obtener token FCM
      this.fcmToken = await getFCMToken();
      
      if (this.fcmToken && userId) {
        // Guardar token en Firestore asociado al usuario
        await this.saveFCMToken(userId, this.fcmToken);
      }

      // Configurar listener para mensajes en foreground
      this.setupForegroundListener();

      console.log('Servicio de notificaciones inicializado');
      return this.fcmToken;
    } catch (error) {
      console.error('Error inicializando notificaciones:', error);
      return null;
    }
  }

  // Guardar token FCM del usuario
  async saveFCMToken(userId, token) {
    try {
      const tokenData = {
        userId,
        token,
        platform: this.getPlatform(),
        updatedAt: serverTimestamp()
      };

      // Buscar token existente
      const q = query(
        collection(db, 'fcmTokens'),
        where('userId', '==', userId),
        where('platform', '==', this.getPlatform())
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Actualizar token existente
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, tokenData);
      } else {
        // Crear nuevo token
        await addDoc(collection(db, 'fcmTokens'), tokenData);
      }

      console.log('Token FCM guardado para usuario:', userId);
    } catch (error) {
      console.error('Error guardando token FCM:', error);
    }
  }

  // Configurar listener para mensajes en foreground
  setupForegroundListener() {
    this.unsubscribeForeground = onForegroundMessage((payload) => {
      console.log('Notificación recibida en foreground:', payload);
      
      // Mostrar notificación personalizada en la UI
      this.showInAppNotification(payload);
      
      // Disparar evento personalizado
      window.dispatchEvent(new CustomEvent('firebaseNotification', {
        detail: payload
      }));
    });
  }

  // Mostrar notificación dentro de la app
  showInAppNotification(payload) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'firebase-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <h4>${payload.notification?.title || 'Nueva notificación'}</h4>
        <p>${payload.notification?.body || ''}</p>
      </div>
      <button class="notification-close">×</button>
    `;

    // Estilos
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 16px;
      max-width: 300px;
      z-index: 10000;
      border-left: 4px solid #667eea;
      animation: slideIn 0.3s ease-out;
    `;

    // Agregar estilos de animación
    if (!document.getElementById('firebase-notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'firebase-notification-styles';
      styles.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .firebase-notification .notification-content h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        .firebase-notification .notification-content p {
          margin: 0;
          font-size: 13px;
          color: #666;
        }
        .firebase-notification .notification-close {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #999;
        }
      `;
      document.head.appendChild(styles);
    }

    // Agregar al DOM
    document.body.appendChild(notification);

    // Configurar cierre automático
    const closeBtn = notification.querySelector('.notification-close');
    const autoClose = setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);

    // Configurar cierre manual
    closeBtn.addEventListener('click', () => {
      clearTimeout(autoClose);
      notification.remove();
    });

    // Click en notificación
    notification.addEventListener('click', (e) => {
      if (e.target !== closeBtn) {
        // Manejar click en notificación
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
        notification.remove();
      }
    });
  }

  // Crear notificación
  async createNotification(notificationData) {
    try {
      const notification = {
        ...notificationData,
        timestamp: serverTimestamp(),
        read: false
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      console.log('Notificación creada:', docRef.id);
      
      return { id: docRef.id, ...notification };
    } catch (error) {
      console.error('Error creando notificación:', error);
      throw error;
    }
  }

  // Obtener notificaciones del usuario
  async getNotifications(userId, limitCount = 50) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const notifications = [];
      
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        });
      });

      return notifications;
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      return [];
    }
  }

  // Escuchar notificaciones en tiempo real
  subscribeToNotifications(userId, callback) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      return onSnapshot(q, (snapshot) => {
        const notifications = [];
        snapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          });
        });
        
        console.log(`Notificaciones actualizadas para usuario ${userId}:`, notifications.length);
        callback(notifications);
      }, (error) => {
        console.error('Error en suscripción de notificaciones:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Error suscribiéndose a notificaciones:', error);
      return () => {};
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      console.log(`Notificación ${notificationId} marcada como leída`);
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      throw error;
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = [];

      snapshot.forEach((doc) => {
        updatePromises.push(
          updateDoc(doc.ref, { read: true })
        );
      });

      await Promise.all(updatePromises);
      console.log(`Todas las notificaciones marcadas como leídas para usuario ${userId}`);
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  // Eliminar notificación
  async deleteNotification(notificationId) {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
      console.log(`Notificación ${notificationId} eliminada`);
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      throw error;
    }
  }

  // Obtener conteo de notificaciones no leídas
  async getUnreadCount(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error obteniendo conteo de no leídas:', error);
      return 0;
    }
  }

  // Obtener plataforma
  getPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    return 'web';
  }

  // Limpiar recursos
  cleanup() {
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
      this.unsubscribeForeground = null;
    }
  }
}

const firebaseNotificationsService = new FirebaseNotificationsService();
export default firebaseNotificationsService;