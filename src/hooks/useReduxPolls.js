import { useSelector, useDispatch } from 'react-redux';
import {
  loadPolls,
  createPoll,
  vote,
  closePoll,
  clearError
} from '../store/slices/pollsSlice';
import {
  selectPolls,
  selectPollsLoading,
  selectPollsError,
  selectActivePoll,
  selectPollById
} from '../store/selectors/pollsSelectors';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast } from '../utils/sweetalert';

export const useReduxPolls = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const polls = useSelector(selectPolls);
  const loading = useSelector(selectPollsLoading);
  const error = useSelector(selectPollsError);
  const activePolls = useSelector(selectActivePoll);

  const loadUserPolls = (neighborhoodId) => {
    dispatch(loadPolls(neighborhoodId));
  };

  const createNewPoll = async (pollData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const result = await dispatch(createPoll({
        ...pollData,
        createdBy: user.id,
        createdAt: new Date().toISOString()
      })).unwrap();
      showSuccessToast('Encuesta creada exitosamente');
      return { success: true, poll: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  const voteOnPoll = async (pollId, optionId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      await dispatch(vote({ pollId, optionId, userId: user.id })).unwrap();
      showSuccessToast('¡Voto registrado exitosamente!');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const closePollAction = async (pollId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      await dispatch(closePoll({ pollId, userId: user.id })).unwrap();
      showSuccessToast('Encuesta cerrada');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const clearPollsError = () => {
    // dispatch(clearError()); // Comentado porque clearError no existe en el slice
  };

  // Helper functions from PollsContext
  const getUserVote = (pollId) => {
    if (!user) return null;
    const poll = polls.find(p => p.id === pollId);
    return poll?.votes?.find(v => v.userId === user.id) || null;
  };

  const getActivePollsCount = () => {
    return polls.filter(poll => poll.status === 'active').length;
  };

  const getPollsByStatus = (status) => {
    return polls.filter(poll => poll.status === status);
  };

  return {
    polls,
    loading,
    error,
    activePollsCount: activePolls.length,
    loadPolls: loadUserPolls,
    createPoll: createNewPoll,
    vote: voteOnPoll,
    closePoll: closePollAction,
    clearError: clearPollsError,
    // Helper functions
    getUserVote,
    getActivePollsCount,
    getPollsByStatus
  };
};