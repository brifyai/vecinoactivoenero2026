// =====================================================
// HOOK REDUX POSTS SIN POLLING
// Hook limpio para manejo de posts sin polling destructivo
// =====================================================

import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import {
  loadPosts,
  createPost,
  updatePost,
  deletePost,
  addReaction,
  addComment,
  clearError
} from '../store/slices/postsSlice';
import {
  selectAllPosts,
  selectPostsLoading,
  selectPostsError
} from '../store/selectors/postsSelectors';

/**
 * Hook Redux para posts SIN polling
 * Carga datos una vez y permite operaciones CRUD
 */
export const useReduxPosts = (options = {}) => {
  console.log('🔵 useReduxPosts: Hook LLAMADO');
  const dispatch = useDispatch();
  
  const posts = useSelector(selectAllPosts);
  const loading = useSelector(selectPostsLoading);
  const error = useSelector(selectPostsError);

  // Cargar posts iniciales - SIEMPRE cargar para asegurar datos frescos
  useEffect(() => {
    console.log('🔵 useReduxPosts: Verificando posts...', {
      postsLength: posts.length,
      loading,
      error
    });
    
    // SIEMPRE cargar si no está cargando (para obtener datos frescos con media)
    if (!loading) {
      console.log('🔵 useReduxPosts: Cargando posts frescos...');
      dispatch(loadPosts({ 
        neighborhoodId: null,
        limit: 50, 
        offset: 0 
      }));
    }
  }, [dispatch]); // Solo ejecutar una vez al montar
  
  // Log cuando cambien los posts
  useEffect(() => {
    if (posts.length > 0) {
      console.log('🔵 useReduxPosts: Posts actualizados:', posts.length);
      console.log('🔵 Primeros 2 posts:', posts.slice(0, 2).map(p => ({
        id: p.id,
        content: p.content?.substring(0, 30),
        media: p.media,
        mediaType: typeof p.media,
        mediaIsArray: Array.isArray(p.media),
        mediaLength: p.media?.length,
        hasMedia: !!p.media && p.media?.length > 0
      })));
    }
  }, [posts]);

  // Funciones de manejo de posts
  const handleCreatePost = async (postData) => {
    const result = await dispatch(createPost(postData));
    if (createPost.fulfilled.match(result)) {
      return { success: true, post: result.payload };
    } else {
      return { success: false, error: result.error.message };
    }
  };

  const handleUpdatePost = async (postId, updates) => {
    const result = await dispatch(updatePost({ postId, updates }));
    if (updatePost.fulfilled.match(result)) {
      return { success: true };
    } else {
      return { success: false, error: result.error.message };
    }
  };

  const handleDeletePost = async (postId) => {
    const result = await dispatch(deletePost(postId));
    if (deletePost.fulfilled.match(result)) {
      return { success: true };
    } else {
      return { success: false, error: result.error.message };
    }
  };

  const handleAddReaction = async (postId, emoji) => {
    const result = await dispatch(addReaction({ postId, emoji }));
    if (addReaction.fulfilled.match(result)) {
      return { success: true };
    } else {
      return { success: false, error: result.error.message };
    }
  };

  const handleAddComment = async (postId, content) => {
    const result = await dispatch(addComment({ postId, content }));
    if (addComment.fulfilled.match(result)) {
      return { success: true, comment: result.payload.comment };
    } else {
      return { success: false, error: result.error.message };
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const refresh = () => {
    dispatch(loadPosts({ 
      neighborhoodId: null, 
      limit: 50, 
      offset: 0 
    }));
  };

  return {
    // Datos principales
    posts,
    loading,
    error,
    
    // Funciones de manejo
    createPost: handleCreatePost,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,
    addReaction: handleAddReaction,
    addComment: handleAddComment,
    clearError: handleClearError,
    refresh
  };
};

export default useReduxPosts;