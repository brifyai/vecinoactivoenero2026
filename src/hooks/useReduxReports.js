import { useSelector, useDispatch } from 'react-redux';
import { useMemo } from 'react';
import {
  loadReports,
  loadBlockedUsers,
  createReport,
  blockUser,
  unblockUser,
  reviewReport,
  clearError
} from '../store/slices/reportsSlice';
import {
  selectAllReports,
  selectBlockedUsers,
  selectReportsLoading,
  selectReportsError,
  selectPendingReports,
  selectUserReports,
  selectReportsCount,
  selectPendingReportsCount,
  selectUserBlockedUsers,
  selectIsUserBlocked
} from '../store/selectors/reportsSelectors';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast } from '../utils/sweetalert';

export const useReduxReports = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const reports = useSelector(selectAllReports);
  const blockedUsers = useSelector(selectBlockedUsers);
  const loading = useSelector(selectReportsLoading);
  const error = useSelector(selectReportsError);
  const reportsCount = useSelector(selectReportsCount);
  const pendingReportsCount = useSelector(selectPendingReportsCount);

  const loadUserReports = () => {
    dispatch(loadReports());
  };

  const loadUserBlockedUsers = () => {
    dispatch(loadBlockedUsers());
  };

  const reportContent = async (data) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      await dispatch(createReport({ reportData: data, user })).unwrap();
      showSuccessToast('Reporte enviado exitosamente');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const blockUserAction = async (userId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      await dispatch(blockUser({ userId, user })).unwrap();
      showSuccessToast('Usuario bloqueado');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const unblockUserAction = async (userId) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      await dispatch(unblockUser({ userId, user })).unwrap();
      showSuccessToast('Usuario desbloqueado');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const reviewReportAction = async (reportId, action, notes = '') => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      await dispatch(reviewReport({ reportId, action, notes, user })).unwrap();
      showSuccessToast('Reporte revisado');
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const clearReportsError = () => {
    dispatch(clearError());
  };

  // Helper functions - usando useMemo para optimización
  const userBlockedUsers = useMemo(() => {
    if (!user) return [];
    return blockedUsers.filter(b => b.blockerId === user.id);
  }, [blockedUsers, user]);

  const pendingReports = useMemo(() => {
    return reports.filter(r => r.status === 'pending');
  }, [reports]);

  const userReports = useMemo(() => {
    if (!user) return [];
    return reports.filter(r => r.reporterId === user.id);
  }, [reports, user]);

  const isUserBlocked = (userId) => {
    if (!user) return false;
    return blockedUsers.some(b => b.blockerId === user.id && b.blockedUserId === userId);
  };

  return {
    reports,
    blockedUsers,
    loading,
    error,
    reportsCount,
    pendingReportsCount,
    loadReports: loadUserReports,
    loadBlockedUsers: loadUserBlockedUsers,
    reportContent,
    blockUser: blockUserAction,
    unblockUser: unblockUserAction,
    reviewReport: reviewReportAction,
    clearError: clearReportsError,
    // Helper functions y datos computados
    isUserBlocked,
    blockedUsers: userBlockedUsers,
    pendingReports,
    userReports
  };
};