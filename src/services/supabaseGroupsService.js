import { supabase } from '../config/supabase';

class SupabaseGroupsService {
  // Obtener grupos
  async getGroups(filters = {}) {
    try {
      let query = supabase
        .from('groups')
        .select(`
          *,
          created_by_user:created_by(id, username, name, avatar),
          group_members(user_id, role)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.privacy) {
        query = query.eq('privacy', filters.privacy);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Mapear avatar a avatar_url para compatibilidad con el frontend
      const groupsWithAvatarUrl = data?.map(group => ({
        ...group,
        created_by_user: group.created_by_user ? {
          ...group.created_by_user,
          avatar_url: group.created_by_user.avatar
        } : null
      })) || [];
      
      return groupsWithAvatarUrl;
    } catch (error) {
      console.error('Error getting groups:', error);
      throw error;
    }
  }

  // Crear grupo
  async createGroup(groupData) {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([groupData])
        .select(`
          *,
          created_by_user:created_by(id, username, name, avatar)
        `)
        .single();

      if (error) throw error;

      // Agregar al creador como admin del grupo
      if (data) {
        await this.joinGroup(data.id, groupData.created_by, 'admin');
      }

      // Mapear avatar a avatar_url para compatibilidad con el frontend
      if (data && data.created_by_user) {
        data.created_by_user.avatar_url = data.created_by_user.avatar;
      }

      return data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Unirse a grupo
  async joinGroup(groupId, userId, role = 'member') {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .upsert([
          {
            group_id: groupId,
            user_id: userId,
            role: role
          }
        ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  // Salir de grupo
  async leaveGroup(groupId, userId) {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  // Actualizar grupo
  async updateGroup(groupId, updates, userId) {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', groupId)
        .eq('created_by', userId)
        .select(`
          *,
          created_by_user:created_by(id, username, name, avatar)
        `)
        .single();

      if (error) throw error;
      
      // Mapear avatar a avatar_url para compatibilidad con el frontend
      if (data && data.created_by_user) {
        data.created_by_user.avatar_url = data.created_by_user.avatar;
      }
      
      return data;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  // Eliminar grupo
  async deleteGroup(groupId, userId) {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId)
        .eq('created_by', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  // Obtener miembros del grupo
  async getGroupMembers(groupId) {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          user:user_id(id, username, name, avatar)
        `)
        .eq('group_id', groupId);

      if (error) throw error;
      
      // Mapear avatar a avatar_url para compatibilidad con el frontend
      const membersWithAvatarUrl = data?.map(member => ({
        ...member,
        user: member.user ? {
          ...member.user,
          avatar_url: member.user.avatar
        } : null
      })) || [];
      
      return membersWithAvatarUrl;
    } catch (error) {
      console.error('Error getting group members:', error);
      throw error;
    }
  }

  // Obtener grupo por ID
  async getGroupById(groupId) {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          created_by_user:created_by(id, username, name, avatar),
          group_members(user_id, role)
        `)
        .eq('id', groupId)
        .single();

      if (error) throw error;
      
      // Mapear avatar a avatar_url para compatibilidad con el frontend
      if (data && data.created_by_user) {
        data.created_by_user.avatar_url = data.created_by_user.avatar;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting group by ID:', error);
      throw error;
    }
  }

  // Obtener grupo por slug
  async getGroupBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          created_by_user:created_by(id, username, name, avatar),
          group_members(user_id, role)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      
      // Mapear avatar a avatar_url para compatibilidad con el frontend
      if (data && data.created_by_user) {
        data.created_by_user.avatar_url = data.created_by_user.avatar;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting group by slug:', error);
      throw error;
    }
  }

  // Obtener grupos del usuario
  async getUserGroups(userId) {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          group:group_id(
            *,
            created_by_user:created_by(id, username, name, avatar)
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      
      // Mapear avatar a avatar_url para compatibilidad con el frontend
      const groups = data?.map(item => {
        const group = item.group;
        if (group && group.created_by_user) {
          group.created_by_user.avatar_url = group.created_by_user.avatar;
        }
        return group;
      }) || [];
      
      return groups;
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  }
}

const supabaseGroupsService = new SupabaseGroupsService();
export default supabaseGroupsService;