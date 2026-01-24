import { supabase } from '../config/supabase';

/**
 * Servicio de Mensajes con Supabase
 */

class SupabaseMessagesService {
  
  /**
   * Obtener conversaciones del usuario
   */
  async getConversations(userId) {
    try {
      const { data, error } = await supabase.rpc('get_user_conversations', {
        user_id_param: userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener conversaciones:', error);
      throw error;
    }
  }

  /**
   * Obtener mensajes de una conversación
   */
  async getMessages(userId, otherUserId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje
   */
  async sendMessage(senderId, recipientId, content) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: senderId,
            recipient_id: recipientId,
            content,
            read: false
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Crear notificación
      await supabase.from('notifications').insert([
        {
          user_id: recipientId,
          type: 'new_message',
          from_user_id: senderId,
          message: 'Te envió un mensaje'
        }
      ]);

      return data;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  /**
   * Marcar mensaje como leído
   */
  async markAsRead(messageId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al marcar mensaje como leído:', error);
      throw error;
    }
  }

  /**
   * Marcar conversación como leída
   */
  async markConversationAsRead(userId, otherUserId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', otherUserId)
        .eq('recipient_id', userId)
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al marcar conversación como leída:', error);
      throw error;
    }
  }

  /**
   * Eliminar mensaje
   */
  async deleteMessage(messageId) {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      throw error;
    }
  }

  /**
   * Suscribirse a nuevos mensajes
   */
  subscribeToMessages(userId, callback) {
    return supabase
      .channel(`messages:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
}

export default new SupabaseMessagesService();
