import { useSelector, useDispatch } from 'react-redux';
import {
  loadModerationData,
  createModerationReport,
  assignToModerator,
  resolveReport,
  rejectReport,
  addModerator,
  removeModerator,
  updateModeratorReputation,
  clearError
} from '../store/slices/moderationSlice';
import {
  selectModerationReports,
  selectModerators,
  selectModerationLoading,
  selectModerationError,
  selectPendingModerationReports,
  selectModeratorReports,
  selectModerationStatistics
} from '../store/selectors/moderationSelectors';
import { showSuccessToast } from '../utils/sweetalert';

export const useReduxModeration = () => {
  const dispatch = useDispatch();
  const reports = useSelector(selectModerationReports);
  const moderators = useSelector(selectModerators);
  const loading = useSelector(selectModerationLoading);
  const error = useSelector(selectModerationError);
  const statistics = useSelector(selectModerationStatistics);

  const loadData = () => {
    dispatch(loadModerationData());
  };

  const createReport = async (reporterUserId, contentId, contentType, reason, description) => {
    try {
      await dispatch(createModerationReport({
        reporterUserId,
        contentId,
        contentType,
        reason,
        description
      })).unwrap();
      showSuccessToast('Reporte de moderación creado exitosamente');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const assignReportToModerator = async (reportId, moderatorId) => {
    try {
      await dispatch(assignToModerator({ reportId, moderatorId })).unwrap();
      showSuccessToast('Reporte asignado al moderador');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const resolveReportAction = async (reportId, action, notes = '') => {
    try {
      await dispatch(resolveReport({ reportId, action, notes })).unwrap();
      showSuccessToast('Reporte resuelto exitosamente');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const rejectReportAction = async (reportId) => {
    try {
      await dispatch(rejectReport({ reportId })).unwrap();
      showSuccessToast('Reporte rechazado');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const addModeratorAction = async (userId) => {
    try {
      const result = await dispatch(addModerator({ userId })).unwrap();
      showSuccessToast('Moderador agregado exitosamente');
      return { success: true, moderator: result };
    } catch (error) {
      return { success: false, error };
    }
  };

  const removeModeratorAction = async (userId) => {
    try {
      await dispatch(removeModerator({ userId })).unwrap();
      showSuccessToast('Moderador removido');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateReputationAction = (userId, delta) => {
    dispatch(updateModeratorReputation({ userId, delta }));
  };

  const clearModerationError = () => {
    dispatch(clearError());
  };

  // Helper functions from ModerationContext
  const getPendingReports = () => {
    return reports.filter(r => r.status === 'pending');
  };

  const getModeratorReports = (moderatorId) => {
    return reports.filter(r => r.moderatorId === moderatorId);
  };

  return {
    reports,
    moderators,
    loading,
    error,
    statistics,
    loadModerationData: loadData,
    createReport,
    assignToModerator: assignReportToModerator,
    resolveReport: resolveReportAction,
    rejectReport: rejectReportAction,
    addModerator: addModeratorAction,
    removeModerator: removeModeratorAction,
    updateModeratorReputation: updateReputationAction,
    clearError: clearModerationError,
    // Helper functions
    getPendingReports,
    getModeratorReports
  };
};