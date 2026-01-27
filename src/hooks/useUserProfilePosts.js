import { useEffect, useState } from 'react';
import supabasePostsService from '../services/supabasePostsService';

export function useUserProfilePosts(profileUser, visiblePosts) {
  const [allUserPosts, setAllUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Cargar posts del usuario directamente desde el servicio
  useEffect(() => {
    async function loadUserPosts() {
      if (!profileUser?.id) {
        setAllUserPosts([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('👤 Cargando posts del usuario:', profileUser.id);
        
        const posts = await supabasePostsService.getUserPosts(profileUser.id, 50);
        
        console.log('👤 Posts cargados:', {
          userId: profileUser.id,
          username: profileUser.username,
          totalPosts: posts.length,
          firstPost: posts[0] ? {
            id: posts[0].id,
            content: posts[0].content?.substring(0, 40),
            media: posts[0].media,
            hasMedia: !!posts[0].media && posts[0].media.length > 0
          } : null
        });
        
        setAllUserPosts(posts);
      } catch (error) {
        console.error('Error cargando posts del usuario:', error);
        setAllUserPosts([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserPosts();
  }, [profileUser?.id]);

  // Limitar posts visibles
  const posts = allUserPosts.slice(0, visiblePosts);

  return {
    posts,
    allPosts: allUserPosts,
    hasMorePosts: visiblePosts < allUserPosts.length,
    loading
  };
}