import { supabase } from '../config/supabase';

class SupabaseFriendsService {
  // Obtener amigos del usuario
  async getFriends(userId) {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:friend_id(id, username, full_name, avatar_url, location),
          user:user_id(id, username, full_name, avatar_url, location)
        `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) throw error;

      // Mapear para obtener el amigo correcto
      const friends = data?.map(friendship => {
        return friendship.user_id === userId ? friendship.friend : friendship.user;
      }) || [];

      return friends;
    } catch (error) {
      console.error('Error getting friends:', error);
      throw error;
    }
  }

  // Obtener solicitudes de amistad pendientes
  async getFriendRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester:user_id(id, username, full_name, avatar_url, location)
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting friend requests:', error);
      throw error;
    }
  }

  // Enviar solicitud de amistad
  async sendFriendRequest(userId, friendId) {
    try {
      // Verificar si ya existe una relación
      const { data: existing } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
        .single();

      if (existing) {
        throw new Error('Ya existe una relación de amistad');
      }

      const { data, error } = await supabase
        .from('friendships')
        .insert([
          {
            user_id: userId,
            friend_id: friendId,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  // Aceptar solicitud de amistad
  async acceptFriendRequest(requestId, userId) {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId)
        .eq('friend_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  // Rechazar solicitud de amistad
  async rejectFriendRequest(requestId, userId) {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId)
        .eq('friend_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  }

  // Eliminar amistad
  async removeFriend(userId, friendId) {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  // Verificar si son amigos
  async areFriends(userId, friendId) {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
        .eq('status', 'accepted')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking friendship:', error);
      return false;
    }
  }

  // Buscar usuarios para agregar como amigos
  async searchUsers(query, currentUserId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url, location')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .neq('id', currentUserId)
        .limit(limit);

      if (error) throw error;

      // Filtrar usuarios que ya son amigos o tienen solicitud pendiente
      const users = [];
      for (const user of data || []) {
        const { data: friendship } = await supabase
          .from('friendships')
          .select('*')
          .or(`and(user_id.eq.${currentUserId},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${currentUserId})`)
          .single();

        if (!friendship) {
          users.push(user);
        }
      }

      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Obtener sugerencias de amigos
  async getFriendSuggestions(userId, limit = 10) {
    try {
      // Por ahora, obtener usuarios aleatorios que no sean amigos
      const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url, location')
        .neq('id', userId)
        .limit(limit * 2); // Obtener más para filtrar

      if (error) throw error;

      // Filtrar usuarios que ya son amigos
      const suggestions = [];
      for (const user of data || []) {
        if (suggestions.length >= limit) break;

        const { data: friendship } = await supabase
          .from('friendships')
          .select('*')
          .or(`and(user_id.eq.${userId},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${userId})`)
          .single();

        if (!friendship) {
          suggestions.push(user);
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting friend suggestions:', error);
      throw error;
    }
  }

  // Obtener conteo de solicitudes pendientes
  async getPendingRequestsCount(userId) {
    try {
      const { count, error } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting pending requests count:', error);
      throw error;
    }
  }
}

const supabaseFriendsService = new SupabaseFriendsService();
export default supabaseFriendsService;