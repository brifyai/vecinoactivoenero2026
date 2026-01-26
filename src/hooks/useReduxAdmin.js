import { useSelector, useDispatch } from 'react-redux';
import {
  fetchAdminRoles,
  createAdminRole,
  checkUserPermissions,
  fetchUserNeighborhoods,
  fetchDashboardConfig,
  updateDashboardConfig,
  fetchDashboardStats,
  fetchNeighborhoodUsers,
  searchUsers,
  clearError,
  setCurrentAdmin,
  setCurrentNeighborhood,
  clearCurrentNeighborhood,
  updateConfigValue,
  clearUserSearchResults
} from '../store/slices/adminDashboardSlice';

/**
 * Hook personalizado para gestión administrativa con Redux
 * Proporciona una interfaz simplificada para todas las operaciones administrativas
 */
export const useReduxAdmin = () => {
  const dispatch = useDispatch();
  
  const {
    currentAdmin,
    permissions,
    userNeighborhoods,
    currentNeighborhood,
    adminRoles,
    dashboardConfig,
    dashboardStats,
    neighborhoodUsers,
    userSearchResults,
    loading,
    error,
    permissionsLoading,
    configLoading,
    statsLoading,
    usersLoading,
    searchLoading
  } = useSelector(state => state.adminDashboard);

  // =====================================================
  // GESTIÓN DE ROLES Y PERMISOS
  // =====================================================

  const handleFetchAdminRoles = async (filters = {}) => {
    const result = await dispatch(fetchAdminRoles(filters));
    return fetchAdminRoles.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleCreateAdminRole = async (roleData) => {
    const result = await dispatch(createAdminRole(roleData));
    return createAdminRole.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleCheckUserPermissions = async (userId, neighborhoodId) => {
    const result = await dispatch(checkUserPermissions({ userId, neighborhoodId }));
    return checkUserPermissions.fulfilled.match(result)
      ? { success: true, permissions: result.payload }
      : { success: false, error: result.payload };
  };

  const handleFetchUserNeighborhoods = async (userId) => {
    const result = await dispatch(fetchUserNeighborhoods(userId));
    return fetchUserNeighborhoods.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  // =====================================================
  // CONFIGURACIÓN DEL DASHBOARD
  // =====================================================

  const handleFetchDashboardConfig = async (neighborhoodId, configKey = null) => {
    const result = await dispatch(fetchDashboardConfig({ neighborhoodId, configKey }));
    return fetchDashboardConfig.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleUpdateDashboardConfig = async (neighborhoodId, configKey, configValue, updatedBy) => {
    const result = await dispatch(updateDashboardConfig({ 
      neighborhoodId, 
      configKey, 
      configValue, 
      updatedBy 
    }));
    return updateDashboardConfig.fulfilled.match(result)
      ? { success: true }
      : { success: false, error: result.payload };
  };

  const getConfigValue = (configKey, defaultValue = null) => {
    return dashboardConfig[configKey] || defaultValue;
  };

  // =====================================================
  // ESTADÍSTICAS
  // =====================================================

  const handleFetchDashboardStats = async (neighborhoodId) => {
    const result = await dispatch(fetchDashboardStats(neighborhoodId));
    return fetchDashboardStats.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  // =====================================================
  // GESTIÓN DE USUARIOS
  // =====================================================

  const handleFetchNeighborhoodUsers = async (neighborhoodId, filters = {}) => {
    const result = await dispatch(fetchNeighborhoodUsers({ neighborhoodId, filters }));
    return fetchNeighborhoodUsers.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleSearchUsers = async (searchTerm, neighborhoodId = null) => {
    const result = await dispatch(searchUsers({ searchTerm, neighborhoodId }));
    return searchUsers.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleClearUserSearchResults = () => {
    dispatch(clearUserSearchResults());
  };

  // =====================================================
  // GESTIÓN DE ESTADO LOCAL
  // =====================================================

  const handleSetCurrentAdmin = (admin) => {
    dispatch(setCurrentAdmin(admin));
  };

  const handleSetCurrentNeighborhood = (neighborhood) => {
    dispatch(setCurrentNeighborhood(neighborhood));
  };

  const handleClearCurrentNeighborhood = () => {
    dispatch(clearCurrentNeighborhood());
  };

  const handleUpdateConfigValue = (configKey, configValue) => {
    dispatch(updateConfigValue({ configKey, configValue }));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  // =====================================================
  // UTILIDADES DE PERMISOS
  // =====================================================

  const hasPermission = (permission) => {
    return permissions[permission] || false;
  };

  const hasRole = (roleType) => {
    return permissions.role_types.includes(roleType);
  };

  const canManageTickets = () => hasPermission('can_manage_tickets');
  const canSendCampaigns = () => hasPermission('can_send_campaigns');
  const canManageUsers = () => hasPermission('can_manage_users');
  const canViewAnalytics = () => hasPermission('can_view_analytics');
  const isAdmin = () => hasPermission('is_admin');

  const isSuperAdmin = () => hasRole('super_admin');
  const isUVAdmin = () => hasRole('uv_admin');
  const isDelegate = () => hasRole('delegate');
  const isModerator = () => hasRole('moderator');

  // =====================================================
  // UTILIDADES DE VECINDARIOS
  // =====================================================

  const getAdministeredNeighborhoods = () => {
    return userNeighborhoods.map(item => ({
      ...item.neighborhood,
      role_type: item.role_type
    }));
  };

  const getCurrentNeighborhoodId = () => {
    return currentNeighborhood?.id || null;
  };

  const getCurrentNeighborhoodName = () => {
    return currentNeighborhood?.nombre || 'Sin seleccionar';
  };

  // =====================================================
  // UTILIDADES DE ESTADÍSTICAS
  // =====================================================

  const getTicketStats = () => dashboardStats.tickets;
  const getCampaignStats = () => dashboardStats.campaigns;
  const getUserStats = () => dashboardStats.users;

  const getTotalTickets = () => dashboardStats.tickets.total;
  const getPendingTickets = () => dashboardStats.tickets.pending;
  const getResolvedTickets = () => dashboardStats.tickets.resolved;
  const getUrgentTickets = () => dashboardStats.tickets.urgent;

  const getTotalCampaigns = () => dashboardStats.campaigns.total;
  const getSentCampaigns = () => dashboardStats.campaigns.sent;
  const getScheduledCampaigns = () => dashboardStats.campaigns.scheduled;

  const getTotalUsers = () => dashboardStats.users.total;
  const getVerifiedUsers = () => dashboardStats.users.verified;

  // =====================================================
  // UTILIDADES DE CONFIGURACIÓN
  // =====================================================

  const getNotificationSettings = () => {
    return getConfigValue('notification_settings', {
      email_enabled: true,
      push_enabled: true,
      whatsapp_enabled: false
    });
  };

  const getTicketCategories = () => {
    return getConfigValue('ticket_categories', [
      'security', 'infrastructure', 'noise', 'cleaning', 'lighting', 'other'
    ]);
  };

  // =====================================================
  // RETURN OBJECT
  // =====================================================

  return {
    // Estado
    currentAdmin,
    permissions,
    userNeighborhoods,
    currentNeighborhood,
    adminRoles,
    dashboardConfig,
    dashboardStats,
    neighborhoodUsers,
    userSearchResults,
    loading,
    error,
    permissionsLoading,
    configLoading,
    statsLoading,
    usersLoading,
    searchLoading,

    // Gestión de roles y permisos
    fetchAdminRoles: handleFetchAdminRoles,
    createAdminRole: handleCreateAdminRole,
    checkUserPermissions: handleCheckUserPermissions,
    fetchUserNeighborhoods: handleFetchUserNeighborhoods,

    // Configuración del dashboard
    fetchDashboardConfig: handleFetchDashboardConfig,
    updateDashboardConfig: handleUpdateDashboardConfig,
    getConfigValue,

    // Estadísticas
    fetchDashboardStats: handleFetchDashboardStats,

    // Gestión de usuarios
    fetchNeighborhoodUsers: handleFetchNeighborhoodUsers,
    searchUsers: handleSearchUsers,
    clearUserSearchResults: handleClearUserSearchResults,

    // Gestión de estado
    setCurrentAdmin: handleSetCurrentAdmin,
    setCurrentNeighborhood: handleSetCurrentNeighborhood,
    clearCurrentNeighborhood: handleClearCurrentNeighborhood,
    updateConfigValue: handleUpdateConfigValue,
    clearError: handleClearError,

    // Utilidades de permisos
    hasPermission,
    hasRole,
    canManageTickets,
    canSendCampaigns,
    canManageUsers,
    canViewAnalytics,
    isAdmin,
    isSuperAdmin,
    isUVAdmin,
    isDelegate,
    isModerator,

    // Utilidades de vecindarios
    getAdministeredNeighborhoods,
    getCurrentNeighborhoodId,
    getCurrentNeighborhoodName,

    // Utilidades de estadísticas
    getTicketStats,
    getCampaignStats,
    getUserStats,
    getTotalTickets,
    getPendingTickets,
    getResolvedTickets,
    getUrgentTickets,
    getTotalCampaigns,
    getSentCampaigns,
    getScheduledCampaigns,
    getTotalUsers,
    getVerifiedUsers,

    // Utilidades de configuración
    getNotificationSettings,
    getTicketCategories
  };
};