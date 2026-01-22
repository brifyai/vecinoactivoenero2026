import { createContext, useContext, useEffect } from 'react';
import { useReduxFriends } from '../hooks/useReduxFriends';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/selectors/authSelectors';
import storageService from '../services/storageService';

const FriendsContext = createContext();

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};

export const FriendsProvider = ({ children }) => {
  const user = useSelector(selectUser);
  const reduxFriends = useReduxFriends();

  // Auto-load friends when user changes
  useEffect(() => {
    if (user) {
      reduxFriends.loadFriends();
      reduxFriends.loadFriendRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Helper functions that use storageService directly
  const isFriend = (userId) => {
    if (!user) return false;
    return storageService.isFriend(user.id, userId);
  };

  const getFriendSuggestions = () => {
    if (!user) return [];
    
    const allUsers = storageService.getUsers();
    const currentFriends = storageService.getFriends(user.id);
    
    const suggestions = allUsers.filter(u => 
      u.id !== user.id && 
      !currentFriends.includes(u.id)
    );
    
    return suggestions.slice(0, 10);
  };

  const searchFriends = (query) => {
    if (!query.trim()) return reduxFriends.friends;
    
    const lowerQuery = query.toLowerCase();
    return reduxFriends.friends.filter(friend => 
      friend.name.toLowerCase().includes(lowerQuery) ||
      (friend.email && friend.email.toLowerCase().includes(lowerQuery)) ||
      (friend.location && friend.location.toLowerCase().includes(lowerQuery))
    );
  };

  const value = {
    ...reduxFriends,
    isFriend,
    getFriendSuggestions,
    searchFriends,
    refreshFriends: reduxFriends.loadFriends
  };

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
};
