import { useSelector, useDispatch } from 'react-redux';
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
  selectPostsError,
  selectUserPosts,
  selectPostsByCategory
} from '../store/selectors/postsSelectors';

/**
 * Hook personalizado que replica la API de usePosts() pero usa Redux
 */
export const useReduxPosts = () => {
  const dispatch = useDispatch();
  
  const posts = useSelector(selectAllPosts);
  const loading = useSelector(selectPostsLoading);
  const error = useSelector(selectPostsError);

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

  const getUserPosts = (userId) => {
    // Este método debe ser usado directamente con useSelector en el componente
    // No podemos llamar hooks dentro de funciones regulares
    console.warn('getUserPosts debe ser usado con useSelector directamente en el componente');
    return [];
  };

  const getPostsByCategory = (category) => {
    // Este método debe ser usado directamente con useSelector en el componente
    console.warn('getPostsByCategory debe ser usado con useSelector directamente en el componente');
    return [];
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    posts,
    loading,
    error,
    createPost: handleCreatePost,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,
    addReaction: handleAddReaction,
    addComment: handleAddComment,
    getUserPosts,
    getPostsByCategory,
    clearError: handleClearError
  };
};
