import { supabase } from '../config/supabase';

class SupabaseNotificationsService {
  async getNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select(`*, from_user:users!notifications_from_user_id_fkey(id, name, avatar)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data;
  }

  async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) throw error;
    return count;
  }

  async markAsRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    if (error) throw error;
    return true;
  }

  async markAllAsRead(userId) {
    const { data, error } = await supabase.rpc('mark_notifications_read', {
      user_id_param: userId
    });
    if (error) throw error;
    return data;
  }

  async createNotification({ userId, type, fromUserId, message, postId, eventId, projectId }) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        from_user_id: fromUserId,
        message,
        post_id: postId,
        event_id: eventId,
        project_id: projectId
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  subscribeToNotifications(userId, callback) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
}

export default new SupabaseNotificationsService();
