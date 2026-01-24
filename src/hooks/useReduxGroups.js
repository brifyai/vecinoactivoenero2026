import { useSelector, useDispatch } from 'react-redux';
import {
  loadGroups,
  createGroup,
  joinGroup,
  leaveGroup,
  updateGroup,
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

  // deleteGroupById y createGroupPost no están implementados en el slice migrado
  // TODO: Implementar estas funciones cuando se necesiten

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
    // deleteGroup y postToGroup no disponibles aún
    getGroupPosts,
    searchGroups,
    clearError: clearGroupsError
  };
};
