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
import { db } from '../config/firebase';

class FirebaseMessagesService {
  // Enviar mensaje instantáneo
  async sendMessage(messageData) {
    try {
      const messageRef = await addDoc(collection(db, 'messages'), {
        ...messageData,
        timestamp: serverTimestamp(),
        read: false,
        delivered: false
      });

      console.log('Mensaje enviado:', messageRef.id);
      return { id: messageRef.id, ...messageData };
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  }

  // Escuchar mensajes de una conversación en tiempo real
  subscribeToMessages(conversationId, callback) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc'),
        limit(100)
      );

      return onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          });
        });
        
        console.log(`Mensajes actualizados para conversación ${conversationId}:`, messages.length);
        callback(messages);
      }, (error) => {
        console.error('Error en suscripción de mensajes:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Error suscribiéndose a mensajes:', error);
      return () => {};
    }
  }

  // Obtener conversaciones del usuario
  async getConversations(userId) {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      );

      const snapshot = await getDocs(q);
      const conversations = [];
      
      snapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data(),
          lastMessageTime: doc.data().lastMessageTime?.toDate() || new Date()
        });
      });

      return conversations;
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error);
      return [];
    }
  }

  // Escuchar conversaciones en tiempo real
  subscribeToConversations(userId, callback) {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        const conversations = [];
        snapshot.forEach((doc) => {
          conversations.push({
            id: doc.id,
            ...doc.data(),
            lastMessageTime: doc.data().lastMessageTime?.toDate() || new Date()
          });
        });
        
        console.log(`Conversaciones actualizadas para usuario ${userId}:`, conversations.length);
        callback(conversations);
      }, (error) => {
        console.error('Error en suscripción de conversaciones:', error);
        callback([]);
      });
    } catch (error) {
      console.error('Error suscribiéndose a conversaciones:', error);
      return () => {};
    }
  }

  // Crear o obtener conversación
  async getOrCreateConversation(participant1Id, participant2Id) {
    try {
      const participants = [participant1Id, participant2Id].sort();
      const conversationId = `${participants[0]}_${participants[1]}`;

      // Buscar conversación existente
      const q = query(
        collection(db, 'conversations'),
        where('id', '==', conversationId)
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }

      // Crear nueva conversación
      const conversationData = {
        id: conversationId,
        participants: participants,
        participantDetails: {
          [participant1Id]: { unreadCount: 0 },
          [participant2Id]: { unreadCount: 0 }
        },
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      const conversationRef = await addDoc(collection(db, 'conversations'), conversationData);
      
      return { id: conversationRef.id, ...conversationData };
    } catch (error) {
      console.error('Error creando/obteniendo conversación:', error);
      throw error;
    }
  }

  // Marcar mensajes como leídos
  async markAsRead(conversationId, userId) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('senderId', '!=', userId),
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
      
      // Actualizar contador de no leídos en la conversación
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`participantDetails.${userId}.unreadCount`]: 0
      });

      console.log(`Mensajes marcados como leídos en conversación ${conversationId}`);
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
      throw error;
    }
  }

  // Eliminar mensaje
  async deleteMessage(messageId) {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
      console.log(`Mensaje ${messageId} eliminado`);
    } catch (error) {
      console.error('Error eliminando mensaje:', error);
      throw error;
    }
  }

  // Obtener conteo de mensajes no leídos
  async getUnreadCount(userId) {
    try {
      const conversations = await this.getConversations(userId);
      let totalUnread = 0;

      conversations.forEach(conversation => {
        const userDetails = conversation.participantDetails?.[userId];
        totalUnread += userDetails?.unreadCount || 0;
      });

      return totalUnread;
    } catch (error) {
      console.error('Error obteniendo conteo de no leídos:', error);
      return 0;
    }
  }

  // Actualizar estado de presencia (typing)
  async updateTypingStatus(conversationId, userId, isTyping) {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`typingStatus.${userId}`]: isTyping ? serverTimestamp() : null
      });
    } catch (error) {
      console.error('Error actualizando estado de escritura:', error);
    }
  }

  // Escuchar estado de typing
  subscribeToTypingStatus(conversationId, callback) {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      
      return onSnapshot(conversationRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const typingStatus = data.typingStatus || {};
          callback(typingStatus);
        }
      });
    } catch (error) {
      console.error('Error suscribiéndose al estado de typing:', error);
      return () => {};
    }
  }
}

const firebaseMessagesService = new FirebaseMessagesService();
export default firebaseMessagesService;