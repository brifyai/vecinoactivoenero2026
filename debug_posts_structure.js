// Debug posts structure to identify React object rendering issue
import { supabase } from './src/config/supabase.js';

async function debugPostsStructure() {
  try {
    console.log('🔍 Debugging posts structure...');
    
    // Get a sample post to see the structure
    const { data: posts, error } = await supabase
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
      .limit(1);

    if (error) {
      console.error('❌ Error fetching posts:', error);
      return;
    }

    if (posts && posts.length > 0) {
      console.log('📊 Sample post structure:');
      console.log(JSON.stringify(posts[0], null, 2));
      
      console.log('\n🔍 Author structure:');
      console.log('Type of author:', typeof posts[0].author);
      console.log('Author value:', posts[0].author);
      
      if (posts[0].author && typeof posts[0].author === 'object') {
        console.log('✅ Author is object with properties:', Object.keys(posts[0].author));
      } else {
        console.log('⚠️ Author is not an object:', posts[0].author);
      }
    } else {
      console.log('📭 No posts found in database');
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugPostsStructure();