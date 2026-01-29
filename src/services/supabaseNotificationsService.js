import { supabase } from '../config/supabase';

class SupabaseNotificationsService {
  // Obtener notificaciones del usuario
  async getNotifications(userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          from_user:from_user_id(id, username, name, avatar),
          post:post_id(id, content)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      // Mapear avatar a avatar_url para compatibilidad con el frontend
      const notificationsWithAvatarUrl = data?.map(notification => ({
        ...notification,
        from_user: notification.from_user ? {
          ...notification.from_user,
          avatar_url: notification.from_user.avatar
        } : null
      })) || [];
      
      return notificationsWithAvatarUrl;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  // Crear nueva notificación
  async createNotification(notificationData) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId, userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Eliminar notificación
  async deleteNotification(notificationId, userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Limpiar todas las notificaciones del usuario
  async clearAll(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }

  // Obtener conteo de notificaciones no leídas
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Suscribirse a cambios en tiempo real
  subscribeToNotifications(userId, callback) {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return subscription;
  }

  // Cancelar suscripción
  unsubscribeFromNotifications(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }

  // Crear notificación de solicitud de amistad
  async createFriendRequestNotification(fromUserId, toUserId) {
    const notificationData = {
      user_id: toUserId,
      from_user_id: fromUserId,
      type: 'friend_request',
      message: 'Te ha enviado una solicitud de amistad',
      read: false
    };

    return this.createNotification(notificationData);
  }

  // Crear notificación de nuevo mensaje
  async createMessageNotification(fromUserId, toUserId, messagePreview) {
    const notificationData = {
      user_id: toUserId,
      from_user_id: fromUserId,
      type: 'new_message',
      message: `Nuevo mensaje: ${messagePreview}`,
      read: false
    };

    return this.createNotification(notificationData);
  }

  // Crear notificación de reacción a post
  async createPostReactionNotification(fromUserId, toUserId, postId, reactionType) {
    const notificationData = {
      user_id: toUserId,
      from_user_id: fromUserId,
      post_id: postId,
      type: 'post_reaction',
      message: `Reaccionó ${reactionType} a tu publicación`,
      read: false
    };

    return this.createNotification(notificationData);
  }

  // Crear notificación de comentario en post
  async createCommentNotification(fromUserId, toUserId, postId, commentPreview) {
    const notificationData = {
      user_id: toUserId,
      from_user_id: fromUserId,
      post_id: postId,
      type: 'post_comment',
      message: `Comentó en tu publicación: ${commentPreview}`,
      read: false
    };

    return this.createNotification(notificationData);
  }
}

const supabaseNotificationsService = new SupabaseNotificationsService();
export default supabaseNotificationsService;