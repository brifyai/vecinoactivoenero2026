import { supabase } from '../config/supabase';

class SupabaseMessagesService {
  // Obtener conversaciones del usuario
  async getConversations(userId) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:participant1_id(id, username, full_name, avatar_url),
          participant2:participant2_id(id, username, full_name, avatar_url),
          last_message:messages(content, created_at, sender_id)
        `)
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  // Obtener mensajes de una conversación
  async getMessages(conversationId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, username, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data?.reverse() || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }

  // Enviar mensaje
  async sendMessage(messageData) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select(`
          *,
          sender:sender_id(id, username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Actualizar timestamp de la conversación
      if (data) {
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', messageData.conversation_id);
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Crear o obtener conversación
  async getOrCreateConversation(participant1Id, participant2Id) {
    try {
      // Buscar conversación existente
      const { data: existingConversation, error: searchError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant1_id.eq.${participant1Id},participant2_id.eq.${participant2Id}),and(participant1_id.eq.${participant2Id},participant2_id.eq.${participant1Id})`)
        .single();

      if (existingConversation) {
        return existingConversation;
      }

      // Crear nueva conversación
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            participant1_id: participant1Id,
            participant2_id: participant2Id
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
      throw error;
    }
  }

  // Marcar mensajes como leídos
  async markAsRead(conversationId, userId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  // Eliminar mensaje
  async deleteMessage(messageId, userId) {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Obtener conteo de mensajes no leídos
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', userId)
        .eq('read', false)
        .in('conversation_id', 
          supabase
            .from('conversations')
            .select('id')
            .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        );

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Suscribirse a mensajes en tiempo real
  subscribeToMessages(conversationId, callback) {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        callback
      )
      .subscribe();

    return subscription;
  }

  // Suscribirse a conversaciones en tiempo real
  subscribeToConversations(userId, callback) {
    const subscription = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(participant1_id.eq.${userId},participant2_id.eq.${userId})`
        },
        callback
      )
      .subscribe();

    return subscription;
  }

  // Cancelar suscripción
  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
}

const supabaseMessagesService = new SupabaseMessagesService();
export default supabaseMessagesService;