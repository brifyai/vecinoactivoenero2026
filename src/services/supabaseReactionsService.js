import { supabase } from '../config/supabase';

class SupabaseReactionsService {
  // Obtener la reacción del usuario para un post específico
  async getUserReaction(postId, userId) {
    const { data, error } = await supabase
      .from('post_reactions')
      .select('emoji')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error getting user reaction:', error);
      return null;
    }

    return data?.emoji || null;
  }

  // Obtener todas las reacciones de un post
  async getPostReactions(postId) {
    const { data, error } = await supabase
      .from('post_reactions')
      .select('emoji, user_id')
      .eq('post_id', postId);

    if (error) throw error;

    // Contar reacciones y obtener emojis únicos
    const reactionCount = data.length;
    const uniqueReactions = [...new Set(data.map(r => r.emoji))].slice(0, 3);

    return {
      count: reactionCount,
      reactions: uniqueReactions,
      userReactions: data
    };
  }

  // Agregar o actualizar una reacción
  async addOrUpdateReaction(postId, userId, emoji) {
    // Primero eliminar cualquier reacción anterior del usuario en este post
    await supabase
      .from('post_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    
    // Luego insertar la nueva reacción
    const { data, error } = await supabase
      .from('post_reactions')
      .insert({
        post_id: postId,
        user_id: userId,
        emoji: emoji
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Eliminar una reacción
  async removeReaction(postId, userId) {
    const { error } = await supabase
      .from('post_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  }

  // Obtener el conteo de reacciones de múltiples posts
  async getMultiplePostsReactions(postIds) {
    const { data, error } = await supabase
      .from('post_reactions')
      .select('post_id, emoji')
      .in('post_id', postIds);

    if (error) throw error;

    // Agrupar por post_id
    const grouped = {};
    data.forEach(reaction => {
      if (!grouped[reaction.post_id]) {
        grouped[reaction.post_id] = {
          count: 0,
          reactions: []
        };
      }
      grouped[reaction.post_id].count++;
      if (!grouped[reaction.post_id].reactions.includes(reaction.emoji)) {
        grouped[reaction.post_id].reactions.push(reaction.emoji);
      }
    });

    // Limitar a 3 reacciones únicas por post
    Object.keys(grouped).forEach(postId => {
      grouped[postId].reactions = grouped[postId].reactions.slice(0, 3);
    });

    return grouped;
  }
}

export default new SupabaseReactionsService();
