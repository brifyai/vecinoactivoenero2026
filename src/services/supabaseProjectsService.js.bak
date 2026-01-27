import { supabase } from '../config/supabase';

class SupabaseProjectsService {
  // Obtener proyectos
  async getProjects(filters = {}) {
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          created_by_user:created_by(id, username, full_name, avatar_url),
          project_participants(user_id, role)
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.neighborhoodId) {
        query = query.eq('neighborhood_id', filters.neighborhoodId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }

  // Crear proyecto
  async createProject(projectData) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select(`
          *,
          created_by_user:created_by(id, username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      // Agregar al creador como líder del proyecto
      if (data) {
        await this.joinProject(data.id, projectData.created_by, 'leader');
      }

      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Unirse a proyecto
  async joinProject(projectId, userId, role = 'participant') {
    try {
      const { data, error } = await supabase
        .from('project_participants')
        .upsert([
          {
            project_id: projectId,
            user_id: userId,
            role: role
          }
        ]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error joining project:', error);
      throw error;
    }
  }

  // Salir de proyecto
  async leaveProject(projectId, userId) {
    try {
      const { error } = await supabase
        .from('project_participants')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error leaving project:', error);
      throw error;
    }
  }

  // Actualizar proyecto
  async updateProject(projectId, updates, userId) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('created_by', userId)
        .select(`
          *,
          created_by_user:created_by(id, username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  // Eliminar proyecto
  async deleteProject(projectId, userId) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('created_by', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  // Obtener participantes del proyecto
  async getProjectParticipants(projectId) {
    try {
      const { data, error } = await supabase
        .from('project_participants')
        .select(`
          *,
          user:user_id(id, username, full_name, avatar_url)
        `)
        .eq('project_id', projectId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting project participants:', error);
      throw error;
    }
  }

  // Obtener proyecto por ID
  async getProjectById(projectId) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          created_by_user:created_by(id, username, full_name, avatar_url),
          project_participants(user_id, role)
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting project by ID:', error);
      throw error;
    }
  }

  // Obtener proyecto por slug
  async getProjectBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          created_by_user:created_by(id, username, full_name, avatar_url),
          project_participants(user_id, role)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting project by slug:', error);
      throw error;
    }
  }

  // Obtener proyectos del usuario
  async getUserProjects(userId) {
    try {
      const { data, error } = await supabase
        .from('project_participants')
        .select(`
          *,
          project:project_id(
            *,
            created_by_user:created_by(id, username, full_name, avatar_url)
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data?.map(item => item.project) || [];
    } catch (error) {
      console.error('Error getting user projects:', error);
      throw error;
    }
  }

  // Actualizar estado del proyecto
  async updateProjectStatus(projectId, status, userId) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId)
        .eq('created_by', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  }

  // Obtener proyectos por categoría
  async getProjectsByCategory(category, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          created_by_user:created_by(id, username, full_name, avatar_url),
          project_participants(user_id, role)
        `)
        .eq('category', category)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting projects by category:', error);
      throw error;
    }
  }
}

const supabaseProjectsService = new SupabaseProjectsService();
export default supabaseProjectsService;