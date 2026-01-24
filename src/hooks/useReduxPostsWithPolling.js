// =====================================================
// HOOK REDUX POSTS CON POLLING REAL-TIME
// Integra el sistema de polling con Redux para posts
// =====================================================

import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useCallback } from 'react';
import { usePollingRealtime } from './usePollingRealtime';
import {
  loadPosts,
  createPost,
  updatePost,
  deletePost,
  addReaction,
  addComment,
  clearError,
  addPostFromRealtime,
  updatePostFromRealtime,
  removePostFromRealtime
} from '../store/slices/postsSlice';
import {
  selectAllPosts,
  selectPostsLoading,
  selectPostsError,
  selectUserPosts,
  selectPostsByCategory
} from '../store/selectors/postsSelectors';

/**
 * Hook que combina Redux con polling real-time para posts
 * Mantiene la misma API que useReduxPosts pero añade funcionalidad real-time
 */
export const useReduxPostsWithPolling = (options = {}) => {
  const {
    enablePolling = true,
    pollingInterval = 3000,
    showNotifications = true
  } = options;

  const dispatch = useDispatch();
  
  const posts = useSelector(selectAllPosts);
  const loading = useSelector(selectPostsLoading);
  const error = useSelector(selectPostsError);

  // Configurar polling real-time para posts
  const { data: realtimePosts, error: pollingError } = usePollingRealtime('posts', {
    interval: pollingInterval,
    enabled: enablePolling,
    onInsert: useCallback((newPost) => {
      console.log('🆕 Nuevo post detectado:', newPost.content?.substring(0, 50) + '...');
      
      // Agregar al store de Redux
      dispatch(addPostFromRealtime(newPost));
      
      // Mostrar notificación si está habilitado
      if (showNotifications && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Nuevo post en tu vecindario', {
          body: newPost.content?.substring(0, 100) + '...',
          icon: '/favicon.ico',
          tag: `post-${newPost.id}`
        });
      }
    }, [dispatch, showNotifications]),
    
    onUpdate: useCallback((updatedPost, oldPost) => {
      console.log('📝 Post actualizado:', updatedPost.id);
      dispatch(updatePostFromRealtime(updatedPost));
    }, [dispatch]),
    
    onDelete: useCallback((deletedPost) => {
      console.log('🗑️ Post eliminado:', deletedPost.id);
      dispatch(removePostFromRealtime(deletedPost.id));
    }, [dispatch])
  });

  // Cargar posts iniciales si no hay datos
  useEffect(() => {
    if (posts.length === 0 && !loading) {
      dispatch(loadPosts());
    }
  }, [dispatch, posts.length, loading]);

  // Solicitar permisos de notificación
  useEffect(() => {
    if (showNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [showNotifications]);

  // Funciones de manejo de posts (mantienen la misma API)
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

  // Información de estado del polling
  const pollingStatus = {
    isPolling: enablePolling,
    interval: pollingInterval,
    error: pollingError,
    lastUpdate: realtimePosts?.length > 0 ? new Date().toISOString() : null
  };

  return {
    // Datos principales
    posts,
    loading,
    error,
    
    // Funciones de manejo (API compatible)
    createPost: handleCreatePost,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,
    addReaction: handleAddReaction,
    addComment: handleAddComment,
    clearError: handleClearError,
    
    // Información del polling
    pollingStatus,
    
    // Funciones de utilidad (mantienen compatibilidad)
    getUserPosts: (userId) => {
      console.warn('getUserPosts debe ser usado con useSelector directamente en el componente');
      return [];
    },
    getPostsByCategory: (category) => {
      console.warn('getPostsByCategory debe ser usado con useSelector directamente en el componente');
      return [];
    }
  };
};

export default useReduxPostsWithPolling;