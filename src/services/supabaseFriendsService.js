import { supabase } from '../config/supabase';

class SupabaseFriendsService {
  async getFriends(userId) {
    const { data, error } = await supabase
      .from('friendships')
      .select(`friend:users!friendships_friend_id_fkey(id, name, avatar, verified)`)
      .eq('user_id', userId)
      .eq('status', 'accepted');
    if (error) throw error;
    return data.map(item => item.friend);
  }

  async getFriendRequests(userId) {
    const { data, error } = await supabase
      .from('friendships')
      .select(`id, user:users!friendships_user_id_fkey(id, name, avatar), created_at`)
      .eq('friend_id', userId)
      .eq('status', 'pending');
    if (error) throw error;
    return data;
  }

  async sendFriendRequest(fromUserId, toUserId) {
    const { data, error } = await supabase
      .from('friendships')
      .insert([{ user_id: fromUserId, friend_id: toUserId, status: 'pending' }])
      .select()
      .single();
    if (error) throw error;

    await supabase.from('notifications').insert([{
      user_id: toUserId,
      type: 'friend_request',
      from_user_id: fromUserId,
      message: 'Te envió una solicitud de amistad'
    }]);

    return data;
  }

  async acceptFriendRequest(userId, fromUserId) {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('user_id', fromUserId)
      .eq('friend_id', userId);
    if (error) throw error;

    await supabase.from('friendships').insert([{
      user_id: userId,
      friend_id: fromUserId,
      status: 'accepted',
      accepted_at: new Date().toISOString()
    }]);

    await supabase.from('notifications').insert([{
      user_id: fromUserId,
      type: 'friend_accepted',
      from_user_id: userId,
      message: 'Aceptó tu solicitud de amistad'
    }]);

    return true;
  }

  async rejectFriendRequest(userId, fromUserId) {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'rejected' })
      .eq('user_id', fromUserId)
      .eq('friend_id', userId);
    if (error) throw error;
    return true;
  }

  async removeFriend(userId, friendId) {
    await supabase.from('friendships').delete().eq('user_id', userId).eq('friend_id', friendId);
    await supabase.from('friendships').delete().eq('user_id', friendId).eq('friend_id', userId);
    return true;
  }
}

export default new SupabaseFriendsService();
