import { supabase } from '../config/supabase';

/**
 * Servicio de Publicaciones con Supabase
 */

class SupabasePostsService {
  
  /**
   * Obtener todas las publicaciones
   */
  async getPosts(neighborhoodId = null, limit = 50, offset = 0) {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:users!posts_author_id_fkey(id, name, avatar, verified),
          reactions:post_reactions(id, emoji, user_id),
          comments:comments(
            id, 
            content, 
            likes, 
            created_at,
            author:users!comments_author_id_fkey(id, name, avatar)
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filtrar por vecindario si se especifica
      if (neighborhoodId) {
        query = query.eq('neighborhood_id', neighborhoodId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error al obtener posts:', error);
      throw error;
    }
  }

  /**
   * Obtener posts de un usuario
   */
  async getUserPosts(userId, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users!posts_author_id_fkey(id, name, avatar, verified),
          reactions:post_reactions(id, emoji, user_id),
          comments:comments(count)
        `)
        .eq('author_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener posts del usuario:', error);
      throw error;
    }
  }

  /**
   * Crear publicación
   */
  async createPost({ authorId, content, image, feeling, location, privacy, category, hashtags }) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            author_id: authorId,
            content,
            image,
            feeling,
            location,
            privacy: privacy || 'public',
            category: category || 'general',
            hashtags: hashtags || []
          }
        ])
        .select(`
          *,
          author:users!posts_author_id_fkey(id, name, avatar, verified)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al crear post:', error);
      throw error;
    }
  }

  /**
   * Actualizar publicación
   */
  async updatePost(postId, updates) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al actualizar post:', error);
      throw error;
    }
  }

  /**
   * Eliminar publicación
   */
  async deletePost(postId) {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error al eliminar post:', error);
      throw error;
    }
  }

  /**
   * Agregar reacción
   */
  async addReaction(postId, userId, emoji) {
    try {
      // Verificar si ya existe la reacción
      const { data: existing } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('emoji', emoji)
        .single();

      if (existing) {
        // Eliminar reacción si ya existe
        const { error } = await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existing.id);

        if (error) throw error;
        return { removed: true };
      } else {
        // Agregar nueva reacción
        const { data, error } = await supabase
          .from('post_reactions')
          .insert([
            {
              post_id: postId,
              user_id: userId,
              emoji
            }
          ])
          .select()
          .single();

        if (error) throw error;
        return { added: true, data };
      }
    } catch (error) {
      console.error('Error al agregar reacción:', error);
      throw error;
    }
  }

  /**
   * Agregar comentario
   */
  async addComment(postId, authorId, content) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            author_id: authorId,
            content
          }
        ])
        .select(`
          *,
          author:users!comments_author_id_fkey(id, name, avatar)
        `)
        .single();

      if (error) throw error;

      // Actualizar contador de comentarios
      await supabase.rpc('increment_post_comments', { post_id: postId });

      return data;
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      throw error;
    }
  }

  /**
   * Obtener comentarios de un post
   */
  async getComments(postId) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:users!comments_author_id_fkey(id, name, avatar)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      throw error;
    }
  }

  /**
   * Dar like a comentario
   */
  async likeComment(commentId) {
    try {
      const { data, error } = await supabase.rpc('increment_comment_likes', {
        comment_id: commentId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error al dar like a comentario:', error);
      throw error;
    }
  }

  /**
   * Suscribirse a nuevos posts en tiempo real
   */
  subscribeToNewPosts(callback) {
    return supabase
      .channel('posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts'
      }, callback)
      .subscribe();
  }

  /**
   * Suscribirse a cambios en un post específico
   */
  subscribeToPost(postId, callback) {
    return supabase
      .channel(`post:${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: `id=eq.${postId}`
      }, callback)
      .subscribe();
  }
}

export default new SupabasePostsService();
