import { createContext, useContext, useState, useEffect } from 'react';
import storageService from '../services/storageService';
import { useSelector } from 'react-redux';
import { selectUser } from '../store/selectors/authSelectors';
import { useDispatch } from 'react-redux';
import { createNotification } from '../store/slices/notificationsSlice';
import { showSuccessToast, showInfoToast } from '../utils/sweetalert';

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
  const dispatch = useDispatch();
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadFriends = () => {
    if (!user) return;
    
    const friendIds = storageService.getFriends(user.id);
    const allUsers = storageService.getUsers();
    const friendsList = friendIds.map(id => allUsers.find(u => u.id === id)).filter(Boolean);
    setFriends(friendsList);
    setLoading(false);
  };

  const loadFriendRequests = () => {
    if (!user) return;
    
    const requests = storageService.getFriendRequests(user.id);
    const allUsers = storageService.getUsers();
    
    const requestsWithUserData = requests.map(req => {
      const fromUser = allUsers.find(u => u.id === req.from);
      return {
        ...req,
        fromUser
      };
    });
    
    setFriendRequests(requestsWithUserData);
  };

  const sendFriendRequest = (toUserId, toUserName) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };
    
    // Verificar si ya son amigos
    if (storageService.isFriend(user.id, toUserId)) {
      showInfoToast('Ya son amigos');
      return { success: false, error: 'Ya son amigos' };
    }
    
    // Verificar si ya hay una solicitud pendiente
    const existingRequests = storageService.getFriendRequests(toUserId);
    const hasPendingRequest = existingRequests.some(req => req.from === user.id && req.status === 'pending');
    
    if (hasPendingRequest) {
      showInfoToast('Ya enviaste una solicitud a este usuario');
      return { success: false, error: 'Solicitud ya enviada' };
    }
    
    storageService.sendFriendRequest(user.id, toUserId);
    showSuccessToast(`¡Solicitud de amistad enviada a ${toUserName}!`);
    
    // Agregar notificación al otro usuario
    dispatch(createNotification({
      userId: toUserId,
      type: 'friend_request',
      from: user.id,
      fromName: user.name,
      fromAvatar: user.avatar,
      message: `${user.name} te envió una solicitud de amistad`,
      read: false
    }));
    
    return { success: true };
  };

  const acceptFriendRequest = (requestId, fromUserId, fromUserName) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };
    
    const success = storageService.acceptFriendRequest(user.id, requestId);
    
    if (success) {
      loadFriends();
      loadFriendRequests();
      showSuccessToast(`¡Ahora eres amigo de ${fromUserName}!`);
      
      // Agregar notificación al otro usuario
      dispatch(createNotification({
        userId: fromUserId,
        type: 'friend_accept',
        from: user.id,
        fromName: user.name,
        fromAvatar: user.avatar,
        message: `${user.name} aceptó tu solicitud de amistad`,
        read: false
      }));
      
      return { success: true };
    }
    
    return { success: false, error: 'Error al aceptar solicitud' };
  };

  const rejectFriendRequest = (requestId, fromUserName) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };
    
    const success = storageService.rejectFriendRequest(user.id, requestId);
    
    if (success) {
      loadFriendRequests();
      showInfoToast(`Solicitud de ${fromUserName} rechazada`);
      return { success: true };
    }
    
    return { success: false, error: 'Error al rechazar solicitud' };
  };

  const removeFriend = (friendId, friendName) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };
    
    const success = storageService.removeFriend(user.id, friendId);
    
    if (success) {
      loadFriends();
      showInfoToast(`${friendName} eliminado de tus amigos`);
      return { success: true };
    }
    
    return { success: false, error: 'Error al eliminar amigo' };
  };

  const isFriend = (userId) => {
    if (!user) return false;
    return storageService.isFriend(user.id, userId);
  };

  const getFriendSuggestions = () => {
    if (!user) return [];
    
    const allUsers = storageService.getUsers();
    const currentFriends = storageService.getFriends(user.id);
    
    // Filtrar usuarios que no son amigos y no son el usuario actual
    const suggestions = allUsers.filter(u => 
      u.id !== user.id && 
      !currentFriends.includes(u.id)
    );
    
    // Limitar a 10 sugerencias
    return suggestions.slice(0, 10);
  };

  const searchFriends = (query) => {
    if (!query.trim()) return friends;
    
    const lowerQuery = query.toLowerCase();
    return friends.filter(friend => 
      friend.name.toLowerCase().includes(lowerQuery) ||
      (friend.email && friend.email.toLowerCase().includes(lowerQuery)) ||
      (friend.location && friend.location.toLowerCase().includes(lowerQuery))
    );
  };

  const value = {
    friends,
    friendRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    isFriend,
    getFriendSuggestions,
    searchFriends,
    refreshFriends: loadFriends
  };

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
};
