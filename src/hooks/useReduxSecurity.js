import { useSelector, useDispatch } from 'react-redux';
import {
  loadSecurityReports,
  createSecurityReport,
  clearError
} from '../store/slices/securitySlice';
import {
  selectSecurityReports,
  selectSecurityLoading,
  selectSecurityError,
  selectReportsByNeighborhood,
  selectRecentReports,
  selectSecurityReportsCount
} from '../store/selectors/securitySelectors';
import { selectUser } from '../store/selectors/authSelectors';
import { showSuccessToast } from '../utils/sweetalert';

export const useReduxSecurity = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const reports = useSelector(selectSecurityReports);
  const loading = useSelector(selectSecurityLoading);
  const error = useSelector(selectSecurityError);
  const reportsCount = useSelector(selectSecurityReportsCount);

  const loadReports = () => {
    dispatch(loadSecurityReports());
  };

  const createReport = async (reportData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const result = await dispatch(createSecurityReport({ reportData, user })).unwrap();
      showSuccessToast('Reporte de seguridad creado exitosamente');
      return result;
    } catch (error) {
      return { success: false, error };
    }
  };

  const clearSecurityError = () => {
    dispatch(clearError());
  };

  // Helper functions from SecurityContext
  const getReportsByNeighborhood = (neighborhoodId) => {
    return reports.filter(report => report.neighborhoodId === neighborhoodId);
  };

  const getRecentReports = (hours = 24) => {
    const now = new Date();
    const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
    return reports.filter(report => new Date(report.timestamp) > cutoff);
  };

  return {
    reports,
    loading,
    error,
    reportsCount,
    loadReports,
    createReport,
    clearError: clearSecurityError,
    // Helper functions
    getReportsByNeighborhood,
    getRecentReports
  };
};