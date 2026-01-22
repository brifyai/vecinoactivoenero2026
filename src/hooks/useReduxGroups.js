import { useSelector, useDispatch } from 'react-redux';
import {
  loadGroups,
  createGroup,
  joinGroup,
  leaveGroup,
  updateGroup,
  deleteGroup,
  postToGroup,
  clearError
} from '../store/slices/groupsSlice';
import {
  selectAllGroups,
  selectMyGroups,
  selectGroupsLoading,
  selectGroupsError,
  selectMyGroupsCount,
  selectSuggestedGroups
} from '../store/selectors/groupsSelectors';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast, showErrorToast } from '../utils/sweetalert';

export const useReduxGroups = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const allGroups = useSelector(selectAllGroups);
  const myGroups = useSelector(selectMyGroups);
  const loading = useSelector(selectGroupsLoading);
  const error = useSelector(selectGroupsError);
  const myGroupsCount = useSelector(selectMyGroupsCount);
  const suggestedGroups = useSelector(selectSuggestedGroups);

  const loadUserGroups = () => {
    if (user) {
      dispatch(loadGroups(user.id));
    }
  };

  const createNewGroup = async (groupData) => {
    if (!user) {
      showErrorToast('Debes iniciar sesión');
      return null;
    }

    try {
      const result = await dispatch(createGroup({ groupData, userId: user.id })).unwrap();
      showSuccessToast('¡Grupo creado exitosamente!');
      return result;
    } catch (error) {
      showErrorToast(error || 'Error al crear grupo');
      return null;
    }
  };

  const joinGroupById = async (groupId) => {
    if (!user) {
      showErrorToast('Debes iniciar sesión');
      return false;
    }

    try {
      await dispatch(joinGroup({ groupId, userId: user.id })).unwrap();
      showSuccessToast('¡Te has unido al grupo!');
      return true;
    } catch (error) {
      showErrorToast(error || 'Error al unirse al grupo');
      return false;
    }
  };

  const leaveGroupById = async (groupId) => {
    if (!user) {
      showErrorToast('Debes iniciar sesión');
      return false;
    }

    try {
      await dispatch(leaveGroup({ groupId, userId: user.id })).unwrap();
      showSuccessToast('Has salido del grupo');
      return true;
    } catch (error) {
      showErrorToast(error || 'Error al salir del grupo');
      return false;
    }
  };

  const updateGroupById = async (groupId, updates) => {
    if (!user) {
      showErrorToast('Debes iniciar sesión');
      return false;
    }

    try {
      await dispatch(updateGroup({ groupId, updates, userId: user.id })).unwrap();
      showSuccessToast('Grupo actualizado');
      return true;
    } catch (error) {
      showErrorToast(error || 'Error al actualizar grupo');
      return false;
    }
  };

  const deleteGroupById = async (groupId) => {
    if (!user) {
      showErrorToast('Debes iniciar sesión');
      return false;
    }

    try {
      await dispatch(deleteGroup({ groupId, userId: user.id })).unwrap();
      showSuccessToast('Grupo eliminado');
      return true;
    } catch (error) {
      showErrorToast(error || 'Error al eliminar grupo');
      return false;
    }
  };

  const createGroupPost = async (groupId, postData) => {
    if (!user) {
      showErrorToast('Debes iniciar sesión');
      return null;
    }

    try {
      const result = await dispatch(postToGroup({ groupId, postData, userId: user.id })).unwrap();
      showSuccessToast('Publicación creada');
      return result.post;
    } catch (error) {
      showErrorToast(error || 'Error al publicar');
      return null;
    }
  };

  const getGroupPosts = (groupId) => {
    const group = allGroups.find(g => g.id === groupId);
    return group?.posts || [];
  };

  const searchGroups = (query) => {
    if (!query || !query.trim()) return allGroups;
    const lowerQuery = query.toLowerCase();
    return allGroups.filter(group =>
      group.name.toLowerCase().includes(lowerQuery) ||
      group.description.toLowerCase().includes(lowerQuery)
    );
  };

  const clearGroupsError = () => {
    dispatch(clearError());
  };

  return {
    groups: allGroups,
    myGroups,
    loading,
    error,
    myGroupsCount,
    suggestedGroups,
    loadGroups: loadUserGroups,
    createGroup: createNewGroup,
    joinGroup: joinGroupById,
    leaveGroup: leaveGroupById,
    updateGroup: updateGroupById,
    deleteGroup: deleteGroupById,
    postToGroup: createGroupPost,
    getGroupPosts,
    searchGroups,
    clearError: clearGroupsError
  };
};
