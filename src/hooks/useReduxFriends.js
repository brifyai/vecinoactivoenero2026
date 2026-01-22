import { useSelector, useDispatch } from 'react-redux';
import {
  loadFriends,
  loadFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  clearError
} from '../store/slices/friendsSlice';
import {
  selectFriends,
  selectFriendRequests,
  selectFriendsLoading,
  selectFriendsError,
  selectFriendsCount,
  selectPendingRequestsCount
} from '../store/selectors/friendsSelectors';
import { createNotification } from '../store/slices/notificationsSlice';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast, showInfoToast } from '../utils/sweetalert';

export const useReduxFriends = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const friends = useSelector(selectFriends);
  const friendRequests = useSelector(selectFriendRequests);
  const loading = useSelector(selectFriendsLoading);
  const error = useSelector(selectFriendsError);
  const friendsCount = useSelector(selectFriendsCount);
  const pendingRequestsCount = useSelector(selectPendingRequestsCount);

  const loadUserFriends = () => {
    if (user) {
      dispatch(loadFriends(user.id));
    }
  };

  const loadUserFriendRequests = () => {
    if (user) {
      dispatch(loadFriendRequests(user.id));
    }
  };

  const sendRequest = async (toUserId, toUserName) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      await dispatch(sendFriendRequest({ fromUserId: user.id, toUserId })).unwrap();
      
      // Crear notificación
      dispatch(createNotification({
        userId: toUserId,
        type: 'friend_request',
        from: user.id,
        fromName: user.name,
        fromAvatar: user.avatar,
        message: `${user.name} te envió una solicitud de amistad`,
        read: false
      }));

      showSuccessToast(`¡Solicitud de amistad enviada a ${toUserName}!`);
      return { success: true };
    } catch (error) {
      showInfoToast('Ya enviaste una solicitud a este usuario');
      return { success: false, error };
    }
  };

  const acceptRequest = async (fromUserId, fromUserName) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      await dispatch(acceptFriendRequest({ userId: user.id, fromUserId })).unwrap();
      
      // Crear notificación
      dispatch(createNotification({
        userId: fromUserId,
        type: 'friend_accept',
        from: user.id,
        fromName: user.name,
        fromAvatar: user.avatar,
        message: `${user.name} aceptó tu solicitud de amistad`,
        read: false
      }));

      showSuccessToast(`¡Ahora eres amigo de ${fromUserName}!`);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const rejectRequest = async (fromUserId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      await dispatch(rejectFriendRequest({ userId: user.id, fromUserId })).unwrap();
      showSuccessToast('Solicitud rechazada');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const removeFriendship = async (friendId, friendName) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      await dispatch(removeFriend({ userId: user.id, friendId })).unwrap();
      showSuccessToast(`${friendName} eliminado de tus amigos`);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const clearFriendsError = () => {
    dispatch(clearError());
  };

  return {
    friends,
    friendRequests,
    loading,
    error,
    friendsCount,
    pendingRequestsCount,
    loadFriends: loadUserFriends,
    loadFriendRequests: loadUserFriendRequests,
    sendFriendRequest: sendRequest,
    acceptFriendRequest: acceptRequest,
    rejectFriendRequest: rejectRequest,
    removeFriend: removeFriendship,
    clearError: clearFriendsError
  };
};
