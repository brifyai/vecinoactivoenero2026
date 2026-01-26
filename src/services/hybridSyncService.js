// ============================================
// SERVICIO DE SINCRONIZACIÓN HÍBRIDA
// Sincroniza datos entre Supabase y Firebase
// ============================================

import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp as firebaseTimestamp,
  where
} from 'firebase/firestore';
import { db as firebaseDb } from '../config/firebase';
import { supabase } from '../config/supabase';
import { HYBRID_CONFIG } from '../config/hybridConfig';

class HybridSyncService {
  constructor() {
    this.syncSubscriptions = new Map();
    this.isInitialized = false;
    this.userId = null;
  }

  // Inicializar servicio de sincronización
  async initialize(userId) {
    try {
      this.userId = userId;
      
      if (HYBRID_CONFIG.sync.enabled) {
        console.log('🔄 Inicializando sincronización híbrida...');
        
        // Configurar listeners de Firebase para realtime
        await this.setupFirebaseListeners();
        
        // Configurar polling como fallback
        if (HYBRID_CONFIG.polling.enabled) {
          this.setupPollingFallback();
        }
        
        this.isInitialized = true;
        console.log('✅ Sincronización híbrida inicializada');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error inicializando sincronización híbrida:', error);
      return false;
    }
  }

  // ============================================
  // POSTS SYNC
  // ============================================

  // Sincronizar posts desde Supabase a Firebase
  async syncPostToFirebase(postData) {
    try {
      const syncData = {
        ...postData,
        syncedAt: firebaseTimestamp(),
        source: 'supabase'
      };

      await setDoc(
        doc(firebaseDb, HYBRID_CONFIG.firebase.collections.posts_sync, postData.id),
        syncData
      );

      console.log('📝 Post sincronizado a Firebase:', postData.id);
    } catch (error) {
      console.error('❌ Error sincronizando post a Firebase:', error);
    }
  }

  // Escuchar cambios de posts en Firebase
  subscribeToPostsSync(callback) {
    try {
      const q = query(
        collection(firebaseDb, HYBRID_CONFIG.firebase.collections.posts_sync),
        orderBy('syncedAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const posts = [];
        snapshot.docChanges().forEach((change) => {
          const postData = {
            id: change.doc.id,
            ...change.doc.data(),
            changeType: change.type // 'added', 'modified', 'removed'
          };
          posts.push(postData);
        });

        if (posts.length > 0) {
          console.log('🔄 Posts actualizados desde Firebase:', posts.length);
          callback(posts);
        }
      });

      this.syncSubscriptions.set('posts', unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error suscribiéndose a posts sync:', error);
      return () => {};
    }
  }

  // ============================================
  // MESSAGES SYNC
  // ============================================

  // Sincronizar mensaje a Firebase
  async syncMessageToFirebase(messageData) {
    try {
      const syncData = {
        ...messageData,
        syncedAt: firebaseTimestamp(),
        source: 'supabase'
      };

      await setDoc(
        doc(firebaseDb, HYBRID_CONFIG.firebase.collections.messages_sync, messageData.id),
        syncData
      );

      console.log('💬 Mensaje sincronizado a Firebase:', messageData.id);
    } catch (error) {
      console.error('❌ Error sincronizando mensaje a Firebase:', error);
    }
  }

  // Escuchar mensajes en tiempo real
  subscribeToMessagesSync(userId, callback) {
    try {
      const q = query(
        collection(firebaseDb, HYBRID_CONFIG.firebase.collections.messages_sync),
        where('recipient_id', '==', userId),
        orderBy('syncedAt', 'desc'),
        limit(100)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.docChanges().forEach((change) => {
          const messageData = {
            id: change.doc.id,
            ...change.doc.data(),
            changeType: change.type
          };
          messages.push(messageData);
        });

        if (messages.length > 0) {
          console.log('💬 Mensajes actualizados desde Firebase:', messages.length);
          callback(messages);
        }
      });

      this.syncSubscriptions.set('messages', unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error suscribiéndose a messages sync:', error);
      return () => {};
    }
  }

  // ============================================
  // NOTIFICATIONS SYNC
  // ============================================

  // Sincronizar notificación a Firebase
  async syncNotificationToFirebase(notificationData) {
    try {
      const syncData = {
        ...notificationData,
        syncedAt: firebaseTimestamp(),
        source: 'supabase'
      };

      await setDoc(
        doc(firebaseDb, HYBRID_CONFIG.firebase.collections.notifications_sync, notificationData.id),
        syncData
      );

      console.log('🔔 Notificación sincronizada a Firebase:', notificationData.id);
    } catch (error) {
      console.error('❌ Error sincronizando notificación a Firebase:', error);
    }
  }

  // Escuchar notificaciones en tiempo real
  subscribeToNotificationsSync(userId, callback) {
    try {
      const q = query(
        collection(firebaseDb, HYBRID_CONFIG.firebase.collections.notifications_sync),
        where('user_id', '==', userId),
        orderBy('syncedAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifications = [];
        snapshot.docChanges().forEach((change) => {
          const notificationData = {
            id: change.doc.id,
            ...change.doc.data(),
            changeType: change.type
          };
          notifications.push(notificationData);
        });

        if (notifications.length > 0) {
          console.log('🔔 Notificaciones actualizadas desde Firebase:', notifications.length);
          callback(notifications);
        }
      });

      this.syncSubscriptions.set('notifications', unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error suscribiéndose a notifications sync:', error);
      return () => {};
    }
  }

  // ============================================
  // EMERGENCY ALERTS SYNC
  // ============================================

  // Sincronizar alerta de emergencia a Firebase
  async syncEmergencyToFirebase(emergencyData) {
    try {
      const syncData = {
        ...emergencyData,
        syncedAt: firebaseTimestamp(),
        source: 'supabase',
        priority: 'high' // Emergencias tienen prioridad alta
      };

      await setDoc(
        doc(firebaseDb, HYBRID_CONFIG.firebase.collections.emergency_sync, emergencyData.id),
        syncData
      );

      console.log('🚨 Emergencia sincronizada a Firebase:', emergencyData.id);
    } catch (error) {
      console.error('❌ Error sincronizando emergencia a Firebase:', error);
    }
  }

  // Escuchar alertas de emergencia en tiempo real
  subscribeToEmergencySync(neighborhoodId, callback) {
    try {
      const q = query(
        collection(firebaseDb, HYBRID_CONFIG.firebase.collections.emergency_sync),
        where('neighborhood_id', '==', neighborhoodId),
        orderBy('syncedAt', 'desc'),
        limit(20)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const emergencies = [];
        snapshot.docChanges().forEach((change) => {
          const emergencyData = {
            id: change.doc.id,
            ...change.doc.data(),
            changeType: change.type
          };
          emergencies.push(emergencyData);
        });

        if (emergencies.length > 0) {
          console.log('🚨 Emergencias actualizadas desde Firebase:', emergencies.length);
          callback(emergencies);
        }
      });

      this.syncSubscriptions.set('emergency', unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error suscribiéndose a emergency sync:', error);
      return () => {};
    }
  }

  // ============================================
  // USER PRESENCE
  // ============================================

  // Actualizar presencia del usuario
  async updateUserPresence(userId, status = 'online') {
    try {
      const presenceData = {
        userId,
        status,
        lastSeen: firebaseTimestamp(),
        platform: this.getPlatform()
      };

      await setDoc(
        doc(firebaseDb, HYBRID_CONFIG.firebase.collections.user_presence, userId),
        presenceData
      );

      console.log('👤 Presencia actualizada:', userId, status);
    } catch (error) {
      console.error('❌ Error actualizando presencia:', error);
    }
  }

  // Escuchar presencia de usuarios
  subscribeToUserPresence(userIds, callback) {
    try {
      const q = query(
        collection(firebaseDb, HYBRID_CONFIG.firebase.collections.user_presence),
        where('userId', 'in', userIds)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const presenceData = {};
        snapshot.forEach((doc) => {
          presenceData[doc.id] = doc.data();
        });

        console.log('👥 Presencia actualizada para usuarios:', Object.keys(presenceData).length);
        callback(presenceData);
      });

      this.syncSubscriptions.set('presence', unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error suscribiéndose a presencia:', error);
      return () => {};
    }
  }

  // ============================================
  // POLLING FALLBACK
  // ============================================

  // Configurar polling como fallback
  setupPollingFallback() {
    if (!HYBRID_CONFIG.polling.enabled) return;

    console.log('🔄 Configurando polling fallback...');

    this.pollingInterval = setInterval(async () => {
      try {
        // Verificar si Firebase está funcionando
        const isFirebaseWorking = await this.checkFirebaseConnection();
        
        if (!isFirebaseWorking) {
          console.log('🔄 Firebase no disponible, usando polling...');
          await this.pollSupabaseUpdates();
        }
      } catch (error) {
        console.error('❌ Error en polling fallback:', error);
      }
    }, HYBRID_CONFIG.polling.interval);
  }

  // Verificar conexión a Firebase
  async checkFirebaseConnection() {
    try {
      // Intentar una operación simple en Firebase
      const testDoc = doc(firebaseDb, 'connection_test', 'test');
      await setDoc(testDoc, { timestamp: firebaseTimestamp() });
      await deleteDoc(testDoc);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Polling de actualizaciones de Supabase
  async pollSupabaseUpdates() {
    try {
      const lastPoll = localStorage.getItem('lastPollTimestamp') || new Date(Date.now() - 60000).toISOString();
      
      // Obtener posts recientes
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .gte('updated_at', lastPoll)
        .order('updated_at', { ascending: false });

      // Obtener notificaciones recientes
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', this.userId)
        .gte('created_at', lastPoll)
        .order('created_at', { ascending: false });

      // Disparar eventos para actualizar UI
      if (posts?.length > 0) {
        window.dispatchEvent(new CustomEvent('pollingPostsUpdate', { detail: posts }));
      }

      if (notifications?.length > 0) {
        window.dispatchEvent(new CustomEvent('pollingNotificationsUpdate', { detail: notifications }));
      }

      // Actualizar timestamp del último polling
      localStorage.setItem('lastPollTimestamp', new Date().toISOString());

    } catch (error) {
      console.error('❌ Error en polling de Supabase:', error);
    }
  }

  // ============================================
  // CONFIGURACIÓN DE LISTENERS
  // ============================================

  // Configurar todos los listeners de Firebase
  async setupFirebaseListeners() {
    if (!this.userId) return;

    console.log('🔄 Configurando listeners de Firebase...');

    // Posts
    this.subscribeToPostsSync((posts) => {
      window.dispatchEvent(new CustomEvent('firebasePostsUpdate', { detail: posts }));
    });

    // Messages
    this.subscribeToMessagesSync(this.userId, (messages) => {
      window.dispatchEvent(new CustomEvent('firebaseMessagesUpdate', { detail: messages }));
    });

    // Notifications
    this.subscribeToNotificationsSync(this.userId, (notifications) => {
      window.dispatchEvent(new CustomEvent('firebaseNotificationsUpdate', { detail: notifications }));
    });

    // Actualizar presencia
    await this.updateUserPresence(this.userId, 'online');

    // Configurar cleanup al cerrar ventana
    window.addEventListener('beforeunload', () => {
      this.updateUserPresence(this.userId, 'offline');
    });
  }

  // ============================================
  // UTILIDADES
  // ============================================

  // Obtener plataforma
  getPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    return 'web';
  }

  // Limpiar recursos
  cleanup() {
    console.log('🧹 Limpiando recursos de sincronización híbrida...');

    // Cancelar suscripciones de Firebase
    this.syncSubscriptions.forEach((unsubscribe, key) => {
      console.log(`🔄 Cancelando suscripción: ${key}`);
      unsubscribe();
    });
    this.syncSubscriptions.clear();

    // Cancelar polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    // Actualizar presencia a offline
    if (this.userId) {
      this.updateUserPresence(this.userId, 'offline');
    }

    this.isInitialized = false;
  }
}

const hybridSyncService = new HybridSyncService();
export default hybridSyncService;