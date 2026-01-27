import EventsWidget from '../EventsWidget/EventsWidget';
import ProfileInfoCard from './ProfileInfoCard';

const ProfileSidebar = ({ 
  activeTab, 
  isOwnProfile, 
  profileUser, 
  isPage, 
  isGroup, 
  isEvent, 
  isProject, 
  isHelp, 
  isResource 
}) => {
  if (activeTab !== 'timeline') return null;

  return (
    <div className="widgets-sidebar">
      {isOwnProfile ? (
        <EventsWidget />
      ) : (
        <ProfileInfoCard
          profileUser={profileUser}
          isPage={isPage}
          isGroup={isGroup}
          isEvent={isEvent}
          isProject={isProject}
          isHelp={isHelp}
          isResource={isResource}
        />
      )}
    </div>
  );
};

export default ProfileSidebar;