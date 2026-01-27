import { supabase } from '../config/supabase';

class SupabaseUsersService {
  /**
   * Obtener todos los usuarios de la base de datos
   */
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ Usuarios cargados desde Supabase:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Error obteniendo usuario por ID:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por username
   */
  async getUserByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Error obteniendo usuario por username:', error);
      throw error;
    }
  }

  /**
   * Obtener vecinos por ubicación (barrio, comuna, etc.)
   */
  async getNeighborsByLocation(neighborhoodId = null, neighborhoodName = null, neighborhoodCode = null) {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });

      // Filtrar por diferentes criterios de ubicación
      if (neighborhoodId) {
        query = query.eq('neighborhood_id', neighborhoodId);
      } else if (neighborhoodName) {
        query = query.eq('neighborhood_name', neighborhoodName);
      } else if (neighborhoodCode) {
        query = query.eq('neighborhood_code', neighborhoodCode);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('✅ Vecinos cargados por ubicación:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error cargando vecinos por ubicación:', error);
      throw error;
    }
  }

  /**
   * Buscar usuarios por nombre o username
   */
  async searchUsers(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .order('name', { ascending: true })
        .limit(50);

      if (error) throw error;

      console.log('✅ Usuarios encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error buscando usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios con paginación
   */
  async getUsersPaginated(page = 1, pageSize = 20) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      console.log(`✅ Página ${page} cargada:`, data?.length || 0, 'de', count);
      
      return {
        users: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    } catch (error) {
      console.error('❌ Error cargando usuarios paginados:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Perfil actualizado:', userId);
      return data;
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuario
   */
  async getUserStats(userId) {
    try {
      // Obtener conteos de posts, amigos, etc.
      const [postsCount, friendsCount, followersCount] = await Promise.all([
        this.getUserPostsCount(userId),
        this.getUserFriendsCount(userId),
        this.getUserFollowersCount(userId)
      ]);

      return {
        posts: postsCount,
        friends: friendsCount,
        followers: followersCount
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        posts: 0,
        friends: 0,
        followers: 0
      };
    }
  }

  async getUserPostsCount(userId) {
    try {
      const { count, error } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('❌ Error contando posts:', error);
      return 0;
    }
  }

  async getUserFriendsCount(userId) {
    try {
      const { count, error } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('❌ Error contando amigos:', error);
      return 0;
    }
  }

  async getUserFollowersCount(userId) {
    try {
      const { count, error } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('❌ Error contando seguidores:', error);
      return 0;
    }
  }

  /**
   * Verificar si un usuario existe
   */
  async userExists(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return !!data;
    } catch (error) {
      console.error('❌ Error verificando existencia de usuario:', error);
      return false;
    }
  }
}

const supabaseUsersService = new SupabaseUsersService();
export default supabaseUsersService;
