import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  sendEmergencyAlert,
  getEmergencyHistory,
  resolveEmergency,
  clearSendError,
  clearHistoryError,
  updateSettings,
  resetEmergencyState,
  selectEmergencyState,
  selectIsLoading,
  selectIsSending,
  selectSendError,
  selectLastAlert,
  selectEmergencies,
  selectIsLoadingHistory,
  selectHistoryError,
  selectEmergencyStats,
  selectEmergencySettings,
  selectActiveEmergencies,
  selectRecentEmergencies,
  selectEmergenciesByType
} from '../store/slices/emergencySlice';

/**
 * Hook personalizado para manejar el estado de emergencias con Redux
 * Proporciona acceso a todas las funcionalidades de emergencia
 */
export const useReduxEmergency = () => {
  const dispatch = useDispatch();

  // Selectores de estado
  const emergencyState = useSelector(selectEmergencyState);
  const isLoading = useSelector(selectIsLoading);
  const isSending = useSelector(selectIsSending);
  const sendError = useSelector(selectSendError);
  const lastAlert = useSelector(selectLastAlert);
  const emergencies = useSelector(selectEmergencies);
  const isLoadingHistory = useSelector(selectIsLoadingHistory);
  const historyError = useSelector(selectHistoryError);
  const stats = useSelector(selectEmergencyStats);
  const settings = useSelector(selectEmergencySettings);
  const activeEmergencies = useSelector(selectActiveEmergencies);
  const recentEmergencies = useSelector(selectRecentEmergencies);

  // Acciones asíncronas
  const handleSendEmergencyAlert = useCallback((emergencyData) => {
    return dispatch(sendEmergencyAlert(emergencyData));
  }, [dispatch]);

  const handleGetEmergencyHistory = useCallback((neighborhoodId, limit = 50) => {
    return dispatch(getEmergencyHistory({ neighborhoodId, limit }));
  }, [dispatch]);

  const handleResolveEmergency = useCallback((emergencyId, resolutionNotes, resolvedBy) => {
    return dispatch(resolveEmergency({ emergencyId, resolutionNotes, resolvedBy }));
  }, [dispatch]);

  // Acciones síncronas
  const handleClearSendError = useCallback(() => {
    dispatch(clearSendError());
  }, [dispatch]);

  const handleClearHistoryError = useCallback(() => {
    dispatch(clearHistoryError());
  }, [dispatch]);

  const handleUpdateSettings = useCallback((newSettings) => {
    dispatch(updateSettings(newSettings));
  }, [dispatch]);

  const handleResetEmergencyState = useCallback(() => {
    dispatch(resetEmergencyState());
  }, [dispatch]);

  // Selectores con parámetros - crear funciones que retornan selectores
  const createEmergenciesByTypeSelector = useCallback((type) => {
    return (state) => state.emergency.emergencies.filter(emergency => emergency.type === type);
  }, []);

  // Función para obtener emergencias por tipo
  const getEmergenciesByType = useCallback((type) => {
    const selector = createEmergenciesByTypeSelector(type);
    return selector({ emergency: emergencyState });
  }, [createEmergenciesByTypeSelector, emergencyState]);

  // Funciones de utilidad
  const getEmergencyById = useCallback((emergencyId) => {
    return emergencies.find(emergency => emergency.id === emergencyId);
  }, [emergencies]);

  const getEmergenciesByStatus = useCallback((status) => {
    return emergencies.filter(emergency => emergency.status === status);
  }, [emergencies]);

  const getEmergenciesInDateRange = useCallback((startDate, endDate) => {
    return emergencies.filter(emergency => {
      const emergencyDate = new Date(emergency.timestamp);
      return emergencyDate >= startDate && emergencyDate <= endDate;
    });
  }, [emergencies]);

  const hasActiveEmergencies = activeEmergencies.length > 0;
  const hasRecentEmergencies = recentEmergencies.length > 0;

  // Estadísticas calculadas
  const emergencyMetrics = {
    total: stats.totalEmergencies,
    active: stats.activeEmergencies,
    resolved: stats.resolvedEmergencies,
    averageResponseTime: stats.averageResponseTime,
    hasActive: hasActiveEmergencies,
    hasRecent: hasRecentEmergencies,
    recentCount: recentEmergencies.length
  };

  return {
    // Estado
    emergencyState,
    isLoading,
    isSending,
    sendError,
    lastAlert,
    emergencies,
    isLoadingHistory,
    historyError,
    stats,
    settings,
    activeEmergencies,
    recentEmergencies,
    emergencyMetrics,

    // Acciones
    sendEmergencyAlert: handleSendEmergencyAlert,
    getEmergencyHistory: handleGetEmergencyHistory,
    resolveEmergency: handleResolveEmergency,
    clearSendError: handleClearSendError,
    clearHistoryError: handleClearHistoryError,
    updateSettings: handleUpdateSettings,
    resetEmergencyState: handleResetEmergencyState,

    // Utilidades
    getEmergencyById,
    getEmergenciesByStatus,
    getEmergenciesByType,
    getEmergenciesInDateRange,
    hasActiveEmergencies,
    hasRecentEmergencies
  };
};

export default useReduxEmergency;