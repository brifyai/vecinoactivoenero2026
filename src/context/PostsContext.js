import { createContext, useContext, useState, useEffect } from 'react';
import storageService from '../services/storageService';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/selectors/authSelectors';
import { useNotifications } from './NotificationsContext';

const PostsContext = createContext();

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
};

export const PostsProvider = ({ children }) => {
  const user = useSelector(selectUser);
  const { addNotification } = useNotifications();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar posts al iniciar
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    setLoading(true);
    const savedPosts = storageService.getPosts();
    setPosts(savedPosts);
    setLoading(false);
  };

  const createPost = (postData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const newPost = {
      id: Date.now(),
      author: user.name,
      authorId: user.id,
      avatar: user.avatar,
      time: 'Justo ahora',
      content: postData.content,
      image: postData.image || null,
      feeling: postData.feeling || null,
      location: postData.location || null,
      privacy: postData.privacy || 'public',
      category: postData.category || 'general',
      hashtags: postData.hashtags || [],
      likes: 0,
      comments: 0,
      shares: 0,
      reactions: [],
      createdAt: new Date().toISOString(),
      // Campos vecinales
      neighborhoodId: user.neighborhoodId || null,
      neighborhoodName: user.neighborhoodName || '',
      neighborhoodCode: user.neighborhoodCode || ''
    };

    storageService.addPost(newPost);
    setPosts([newPost, ...posts]);
    
    return { success: true, post: newPost };
  };

  const updatePost = (postId, updates) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const post = posts.find(p => p.id === postId);
    if (!post) return { success: false, error: 'Publicación no encontrada' };
    
    // Verificar que el usuario sea el autor
    if (post.authorId !== user.id) {
      return { success: false, error: 'No tienes permiso para editar esta publicación' };
    }

    storageService.updatePost(postId, updates);
    setPosts(posts.map(p => p.id === postId ? { ...p, ...updates } : p));
    
    return { success: true };
  };

  const deletePost = (postId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const post = posts.find(p => p.id === postId);
    if (!post) return { success: false, error: 'Publicación no encontrada' };
    
    // Verificar que el usuario sea el autor
    if (post.authorId !== user.id) {
      return { success: false, error: 'No tienes permiso para eliminar esta publicación' };
    }

    storageService.deletePost(postId);
    setPosts(posts.filter(p => p.id !== postId));
    
    return { success: true };
  };

  const addReaction = (postId, reactionType) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const post = posts.find(p => p.id === postId);
    if (!post) return { success: false, error: 'Publicación no encontrada' };

    const reaction = {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      type: reactionType,
      createdAt: new Date().toISOString()
    };

    storageService.addReaction(postId, reaction);
    
    // Crear notificación para el autor del post (si no es el mismo usuario)
    if (post.authorId !== user.id) {
      addNotification(post.authorId, {
        type: 'like',
        from: user.id,
        fromName: user.name,
        fromAvatar: user.avatar,
        postId: postId,
        message: `A ${user.name} le gustó tu publicación`,
        read: false
      });
    }
    
    // Actualizar el post
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const reactions = storageService.getReactions(postId);
        return {
          ...p,
          likes: reactions.length,
          reactions: reactions.map(r => r.type)
        };
      }
      return p;
    });
    
    setPosts(updatedPosts);
    return { success: true };
  };

  const removeReaction = (postId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    storageService.removeReaction(postId, user.id);
    
    // Actualizar el post
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const reactions = storageService.getReactions(postId);
        return {
          ...post,
          likes: reactions.length,
          reactions: reactions.map(r => r.type)
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
    return { success: true };
  };

  const addComment = (postId, commentText) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const post = posts.find(p => p.id === postId);
    if (!post) return { success: false, error: 'Publicación no encontrada' };

    const comment = {
      id: Date.now(),
      author: user.name,
      authorId: user.id,
      avatar: user.avatar,
      content: commentText,
      time: 'Justo ahora',
      likes: 0,
      replies: [],
      createdAt: new Date().toISOString()
    };

    storageService.addComment(postId, comment);
    
    // Crear notificación para el autor del post (si no es el mismo usuario)
    if (post.authorId !== user.id) {
      addNotification(post.authorId, {
        type: 'comment',
        from: user.id,
        fromName: user.name,
        fromAvatar: user.avatar,
        postId: postId,
        message: `${user.name} comentó tu publicación`,
        read: false
      });
    }
    
    // Actualizar contador de comentarios
    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        const comments = storageService.getComments(postId);
        return { ...p, comments: comments.length };
      }
      return p;
    });
    
    setPosts(updatedPosts);
    return { success: true, comment };
  };

  const getComments = (postId) => {
    return storageService.getComments(postId);
  };

  const getReactions = (postId) => {
    return storageService.getReactions(postId);
  };

  const sharePost = (postId, shareText) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    const originalPost = posts.find(p => p.id === postId);
    if (!originalPost) return { success: false, error: 'Publicación no encontrada' };

    const sharedPost = {
      id: Date.now(),
      author: user.name,
      authorId: user.id,
      avatar: user.avatar,
      time: 'Justo ahora',
      content: shareText,
      sharedPost: originalPost,
      likes: 0,
      comments: 0,
      shares: 0,
      reactions: [],
      createdAt: new Date().toISOString()
    };

    storageService.addPost(sharedPost);
    setPosts([sharedPost, ...posts]);
    
    // Incrementar contador de shares del post original
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 };
      }
      return post;
    });
    storageService.updatePost(postId, { shares: originalPost.shares + 1 });
    setPosts(updatedPosts);
    
    return { success: true, post: sharedPost };
  };

  const getPostsByCategory = (category) => {
    if (category === 'all') return posts;
    return posts.filter(p => p.category === category);
  };

  const value = {
    posts,
    loading,
    createPost,
    updatePost,
    deletePost,
    addReaction,
    removeReaction,
    addComment,
    getComments,
    getReactions,
    sharePost,
    getPostsByCategory,
    refreshPosts: loadPosts
  };

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
};
