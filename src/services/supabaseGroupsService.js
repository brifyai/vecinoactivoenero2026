import { supabase } from '../config/supabase';

class SupabaseGroupsService {
  async getGroups() {
    const { data, error } = await supabase
      .from('groups')
      .select(`*, creator:users!groups_created_by_fkey(id, name, avatar), members:group_members(count)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getUserGroups(userId) {
    const { data, error } = await supabase
      .from('group_members')
      .select(`group:groups(*, creator:users!groups_created_by_fkey(id, name, avatar), members:group_members(count))`)
      .eq('user_id', userId);
    if (error) throw error;
    return data.map(item => item.group);
  }

  async createGroup({ name, description, image, createdBy, privacy }) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { data, error } = await supabase
      .from('groups')
      .insert([{ slug, name, description, image, created_by: createdBy, privacy: privacy || 'public' }])
      .select()
      .single();
    if (error) throw error;
    
    await this.joinGroup(data.id, createdBy, 'admin');
    return data;
  }

  async joinGroup(groupId, userId, role = 'member') {
    const { data, error } = await supabase
      .from('group_members')
      .insert([{ group_id: groupId, user_id: userId, role }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async leaveGroup(groupId, userId) {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }

  async updateGroup(groupId, updates) {
    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteGroup(groupId) {
    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    if (error) throw error;
    return true;
  }

  async postToGroup(groupId, userId, content, image) {
    const { data, error } = await supabase
      .from('group_posts')
      .insert([{ group_id: groupId, user_id: userId, content, image }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getGroupPosts(groupId) {
    const { data, error } = await supabase
      .from('group_posts')
      .select(`*, user:users(id, name, avatar)`)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
}

export default new SupabaseGroupsService();
