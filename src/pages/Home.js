import React, { useState } from 'react';
import { useReduxPostsWithPolling as usePosts } from '../hooks/useReduxPostsWithPolling';
import { useSidebar } from '../context/SidebarContext';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import CreatePost from '../components/CreatePost/CreatePost';
import Post from '../components/Post/Post';
// Stories removed - generic Facebook feature
// import Stories from '../components/Stories/Stories';
import ProfileCard from '../components/ProfileCard/ProfileCard';
import FriendSuggestions from '../components/FriendSuggestions/FriendSuggestions';
// LikedPages removed - generic Facebook feature
// import LikedPages from '../components/LikedPages/LikedPages';
import MyPhotos from '../components/MyPhotos/MyPhotos';
// EventCard removed - generic Facebook feature
// import EventCard from '../components/EventCard/EventCard';
// GroupsWidget removed - generic Facebook feature
// import GroupsWidget from '../components/GroupsWidget/GroupsWidget';
import SkeletonLoader from '../components/SkeletonLoader/SkeletonLoader';
import PublicIcon from '@mui/icons-material/Public';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CampaignIcon from '@mui/icons-material/Campaign';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CelebrationIcon from '@mui/icons-material/Celebration';
import './Home.css';

const Home = () => {
  const { posts, createPost, pollingStatus } = usePosts({
    enablePolling: true,
    pollingInterval: 3000,
    showNotifications: true
  });
  const { isRightSidebarCollapsed } = useSidebar();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('all'); // 'all' o 'myNeighborhood'

  const categories = [
    { value: 'all', label: 'Todos', icon: <ListAltIcon />, color: '#6b7280' },
    { value: 'anuncio', label: 'Anuncios', icon: <CampaignIcon />, color: '#3b82f6' },
    { value: 'marketplace', label: 'Marketplace', icon: <ShoppingCartIcon />, color: '#10b981' },
    { value: 'consulta', label: 'Consultas', icon: <HelpOutlineIcon />, color: '#f59e0b' },
    { value: 'evento', label: 'Eventos', icon: <CelebrationIcon />, color: '#8b5cf6' }
  ];

  // Filtrar por categoría
  let filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  // Filtrar por vecindario
  if (neighborhoodFilter === 'myNeighborhood' && user?.neighborhoodId) {
    filteredPosts = filteredPosts.filter(p => p.neighborhoodId === user.neighborhoodId);
  }

  const { displayedItems, hasMore, isLoading, loadMoreRef } = useInfiniteScroll(filteredPosts, 5);

  const handleNewPost = (newPost) => {
    createPost(newPost);
  };

  const handleSharePost = (sharedPost) => {
    // El sharePost ya está manejado en el PostsContext
  };

  return (
    <div className={`home-page ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="home-left">
        {/* Stories removed - generic Facebook feature */}
        <ProfileCard />
        {/* Sugerencias de amigos por distancia */}
        {user?.latitude && user?.longitude && (
          <FriendSuggestions 
            maxDistance={user.maxDistance || 5} 
            limit={5} 
          />
        )}
        {/* LikedPages removed - generic Facebook feature */}
      </div>

      <div className="home-center">
        {/* Indicador de estado del polling */}
        {pollingStatus.isPolling && (
          <div className="polling-status">
            <div className="polling-indicator">
              <span className="polling-dot"></span>
              <span className="polling-text">
                Actualizaciones en tiempo real activas (cada {pollingStatus.interval / 1000}s)
              </span>
            </div>
          </div>
        )}

        {/* Filtro de vecindario */}
        {user?.neighborhoodId && (
          <div className="neighborhood-filter">
            <button
              className={`filter-toggle ${neighborhoodFilter === 'all' ? 'active' : ''}`}
              onClick={() => setNeighborhoodFilter('all')}
            >
              <PublicIcon style={{ marginRight: '8px', fontSize: '20px' }} />
              Todos los Vecindarios
            </button>
            <button
              className={`filter-toggle ${neighborhoodFilter === 'myNeighborhood' ? 'active' : ''}`}
              onClick={() => setNeighborhoodFilter('myNeighborhood')}
            >
              <HomeWorkIcon style={{ marginRight: '8px', fontSize: '20px' }} />
              Mi Barrio ({user.neighborhoodName})
            </button>
          </div>
        )}

        {/* Filtros de categoría */}
        <div className="category-filters" style={{ gap: '6px', display: 'flex', columnGap: '6px', rowGap: '6px' }}>
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`category-filter-btn ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
              style={{ margin: '0', marginRight: '0', marginLeft: '0' }}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <CreatePost onPost={handleNewPost} />
        {displayedItems.map(post => (
          <Post key={post.id} post={post} onShare={handleSharePost} />
        ))}
        
        {isLoading && <SkeletonLoader type="post" count={2} />}
        
        {hasMore && <div ref={loadMoreRef} style={{ height: '20px' }} />}
        
        {posts.length === 0 && !isLoading && (
          <div className="no-posts">
            <p>No hay publicaciones aún. ¡Sé el primero en publicar!</p>
          </div>
        )}

        {filteredPosts.length === 0 && posts.length > 0 && !isLoading && (
          <div className="no-posts">
            <p>No hay publicaciones en esta categoría</p>
          </div>
        )}
      </div>

      <div className="home-right">
        <MyPhotos />
        {/* EventCard removed - generic Facebook feature */}
        {/* GroupsWidget removed - generic Facebook feature */}
      </div>
    </div>
  );
};

export default Home;
