import { useParams, useLocation } from 'react-router-dom';
import { useReduxAuth as useAuth } from '../hooks/useReduxAuth';
import { useSidebar } from '../context/SidebarContext';
import { useUserProfileData } from '../hooks/useUserProfileData';
import { useUserProfileState } from '../hooks/useUserProfileState';
import { useUserProfilePosts } from '../hooks/useUserProfilePosts';
import ProfileHeader from '../components/ProfileHeader/ProfileHeader';
import UserNotFound from '../components/UserProfile/UserNotFound';
import ProfileTabs from '../components/UserProfile/ProfileTabs';
import ActivityFeed from '../components/UserProfile/ActivityFeed';
import PostsContainer from '../components/UserProfile/PostsContainer';
import ProfileSidebar from '../components/UserProfile/ProfileSidebar';
import PhotosSection from '../components/UserProfile/PhotosSection';
import PhotoLightbox from '../components/PhotoLightbox/PhotoLightbox';
import './Timeline.css';

const UserProfile = () => {
  const { username, slug } = useParams();
  const location = useLocation();
  const { user: currentUser } = useAuth();
  const { isRightSidebarCollapsed } = useSidebar();

  // Determine route type
  const isPage = location.pathname.startsWith('/pagina/') || location.pathname.startsWith('/paginas/');
  const isGroup = location.pathname.startsWith('/grupo/');
  const isEvent = location.pathname.startsWith('/evento/');
  const isProject = location.pathname.startsWith('/proyecto/');
  const isHelp = location.pathname.startsWith('/ayuda/');
  const isResource = location.pathname.startsWith('/recursos/');
  const identifier = isPage || isGroup || isEvent || isProject || isHelp || isResource ? slug : username;

  // Custom hooks
  const { profileUser, loading } = useUserProfileData(
    identifier, currentUser, isPage, isGroup, isEvent, isProject, isHelp, isResource
  );

  const {
    visiblePosts,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    userPhotos,
    lightboxOpen,
    setLightboxOpen,
    lightboxIndex,
    loadMore,
    handlePhotoClick
  } = useUserProfileState();

  const { posts, hasMorePosts } = useUserProfilePosts(profileUser, visiblePosts);

  // Loading state
  if (loading) {
    return (
      <div className="timeline">
        <div className="loading-profile">Cargando perfil...</div>
      </div>
    );
  }

  // User not found state
  if (!profileUser) {
    return (
      <div className={`timeline ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <UserNotFound identifier={identifier} />
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser?.id;

  return (
    <div className={`timeline ${isRightSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ProfileHeader 
        user={{
          id: profileUser.id,
          name: profileUser.name,
          username: profileUser.username,
          email: profileUser.email,
          avatar: profileUser.avatar,
          coverPhoto: profileUser.cover,
          bio: profileUser.bio,
          location: profileUser.location,
          following: profileUser.following,
          followers: profileUser.followers,
          verified: profileUser.verified || false,
          neighborhoodName: profileUser.neighborhoodName,
          neighborhoodCode: profileUser.neighborhoodCode,
          isVerifiedNeighbor: profileUser.isVerifiedNeighbor
        }}
        isOwnProfile={isOwnProfile}
      />
      
      <ProfileTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <div className="timeline-content">
        <ActivityFeed isOwnProfile={isOwnProfile} activeTab={activeTab} />

        <PostsContainer
          activeTab={activeTab}
          posts={posts}
          hasMorePosts={hasMorePosts}
          loadMore={loadMore}
          isOwnProfile={isOwnProfile}
        />
        
        <ProfileSidebar
          activeTab={activeTab}
          isOwnProfile={isOwnProfile}
          profileUser={profileUser}
          isPage={isPage}
          isGroup={isGroup}
          isEvent={isEvent}
          isProject={isProject}
          isHelp={isHelp}
          isResource={isResource}
        />
      </div>

      <PhotosSection
        activeTab={activeTab}
        userPhotos={userPhotos}
        handlePhotoClick={handlePhotoClick}
      />

      {lightboxOpen && (
        <PhotoLightbox
          photos={userPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default UserProfile;
