import { supabase } from '../config/supabase';

class SupabaseProjectsService {
  async getProjects(neighborhoodId = null) {
    let query = supabase
      .from('projects')
      .select(`
        *,
        creator:users!projects_creator_id_fkey(id, name, avatar),
        volunteers:project_volunteers(user:users(id, name, avatar)),
        voters:project_voters(count)
      `)
      .order('created_at', { ascending: false });

    if (neighborhoodId) {
      query = query.eq('neighborhood_id', neighborhoodId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createProject({ title, description, category, creatorId, neighborhoodId, neighborhoodName, neighborhoodCode, budget, fundingGoal, startDate, endDate, tags, images }) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        slug, title, description, category, creator_id: creatorId,
        neighborhood_id: neighborhoodId, neighborhood_name: neighborhoodName, neighborhood_code: neighborhoodCode,
        budget: budget || 0, funding_goal: fundingGoal || 0, start_date: startDate, end_date: endDate,
        tags: tags || [], images: images || []
      }])
      .select(`*, creator:users!projects_creator_id_fkey(id, name, avatar)`)
      .single();
    if (error) throw error;
    return data;
  }

  async voteProject(projectId, userId) {
    const { data: existing } = await supabase
      .from('project_voters')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase.from('project_voters').delete().eq('id', existing.id);
      await supabase.rpc('decrement_project_votes', { project_id: projectId });
      return { removed: true };
    } else {
      await supabase.from('project_voters').insert([{ project_id: projectId, user_id: userId }]);
      await supabase.rpc('increment_project_votes', { project_id: projectId });
      return { added: true };
    }
  }

  async joinAsVolunteer(projectId, userId) {
    const { data: existing } = await supabase
      .from('project_volunteers')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase.from('project_volunteers').delete().eq('id', existing.id);
      return { removed: true };
    } else {
      const { data, error } = await supabase
        .from('project_volunteers')
        .insert([{ project_id: projectId, user_id: userId }])
        .select()
        .single();
      if (error) throw error;
      return { added: true, data };
    }
  }

  async addUpdate(projectId, authorId, content, images) {
    const { data, error } = await supabase
      .from('project_updates')
      .insert([{ project_id: projectId, author_id: authorId, content, images: images || [] }])
      .select(`*, author:users!project_updates_author_id_fkey(id, name, avatar)`)
      .single();
    if (error) throw error;
    return data;
  }

  async getUpdates(projectId) {
    const { data, error } = await supabase
      .from('project_updates')
      .select(`*, author:users!project_updates_author_id_fkey(id, name, avatar)`)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async updateStatus(projectId, newStatus) {
    const updates = { status: newStatus };
    if (newStatus === 'completado') {
      updates.completion_date = new Date().toISOString();
    }
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateProject(projectId, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteProject(projectId) {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw error;
    return true;
  }
}

export default new SupabaseProjectsService();
