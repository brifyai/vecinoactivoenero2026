/**
 * Push Notification Service - Firebase Cloud Messaging
 * Servicio para envío de notificaciones push usando FCM
 */

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from '../config/firebase';

class PushNotificationService {
  constructor() {
    this.messaging = null;
    this.initialized = false;
    this.currentToken = null;
  }

  initialize() {
    if (this.initialized) return;

    try {
      // Verificar si Firebase está disponible
      if (!app) {
        console.warn('⚠️ Firebase no configurado. Push notifications no disponibles.');
        return;
      }

      this.messaging = getMessaging(app);
      this.initialized = true;
      console.log('✅ PushNotificationService (FCM) inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando PushNotificationService:', error);
    }
  }

  /**
   * Solicitar permiso y obtener token del dispositivo
   */
  async requestPermission() {
    this.initialize();

    if (!this.initialized) {
      return { success: false, error: 'Servicio no inicializado' };
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Permiso de notificaciones concedido');
        
        const token = await getToken(this.messaging, {
          vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
        });
        
        if (token) {
          this.currentToken = token;
          console.log('✅ Token FCM obtenido:', token.substring(0, 20) + '...');
          return { success: true, token };
        } else {
          console.warn('⚠️ No se pudo obtener token FCM');
          return { success: false, error: 'No se pudo obtener token' };
        }
      } else {
        console.warn('⚠️ Permiso de notificaciones denegado');
        return { success: false, error: 'Permiso denegado' };
      }
    } catch (error) {
      console.error('❌ Error solicitando permiso:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener token actual del dispositivo
   */
  async getDeviceToken() {
    if (this.currentToken) {
      return { success: true, token: this.currentToken };
    }

    return await this.requestPermission();
  }

  /**
   * Escuchar mensajes en primer plano
   */
  onMessageReceived(callback) {
    this.initialize();

    if (!this.initialized) {
      console.warn('⚠️ No se puede escuchar mensajes: servicio no inicializado');
      return null;
    }

    try {
      const unsubscribe = onMessage(this.messaging, (payload) => {
        console.log('📬 Mensaje recibido en primer plano:', payload);
        callback(payload);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error configurando listener:', error);
      return null;
    }
  }

  /**
   * Enviar notificación a un dispositivo específico
   * NOTA: Esto debe hacerse desde el backend con Firebase Admin SDK
   * Esta función es solo para referencia de la estructura
   */
  async sendToDevice(token, notification) {
    console.warn('⚠️ sendToDevice debe ejecutarse desde el backend');
    
    // Esta es la estructura que se usaría en el backend:
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/logo192.png'
      },
      data: notification.data || {},
      token: token
    };

    return { 
      success: false, 
      error: 'Esta operación debe ejecutarse desde el backend',
      messageStructure: message 
    };
  }

  /**
   * Enviar notificación a múltiples dispositivos
   * NOTA: Esto debe hacerse desde el backend con Firebase Admin SDK
   */
  async sendToMultiple(tokens, notification) {
    console.warn('⚠️ sendToMultiple debe ejecutarse desde el backend');
    
    // Esta es la estructura que se usaría en el backend:
    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/logo192.png'
      },
      data: notification.data || {},
      tokens: tokens
    };

    return { 
      success: false, 
      error: 'Esta operación debe ejecutarse desde el backend',
      messageStructure: message 
    };
  }

  /**
   * Guardar token del usuario en la base de datos
   */
  async saveUserToken(userId, token) {
    try {
      // Aquí se guardaría el token en Supabase
      console.log('💾 Guardando token para usuario:', userId);
      
      // Implementar guardado en tabla user_device_tokens
      return { success: true };
    } catch (error) {
      console.error('❌ Error guardando token:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar estado del servicio
   */
  async checkStatus() {
    this.initialize();

    if (!this.initialized) {
      return { available: false, error: 'No inicializado' };
    }

    try {
      const permission = Notification.permission;
      const hasToken = !!this.currentToken;

      return { 
        available: true,
        permission,
        hasToken,
        token: hasToken ? this.currentToken.substring(0, 20) + '...' : null
      };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
}

export default new PushNotificationService();
