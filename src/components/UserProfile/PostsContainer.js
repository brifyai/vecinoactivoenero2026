import Post from '../Post/Post';

const PostsContainer = ({ activeTab, posts, hasMorePosts, loadMore, isOwnProfile }) => {
  if (activeTab !== 'timeline') return null;

  return (
    <div className="posts-container">
      {posts.length > 0 ? (
        <>
          {posts.map(post => (
            <Post key={post.id} post={post} />
          ))}
          
          {hasMorePosts && (
            <button className="load-more-btn" onClick={loadMore}>
              Cargar más
            </button>
          )}
        </>
      ) : (
        <div className="no-posts">
          <p>{isOwnProfile ? 'Aún no has publicado nada.' : 'Este usuario aún no ha publicado nada.'}</p>
        </div>
      )}
    </div>
  );
};

export default PostsContainer;