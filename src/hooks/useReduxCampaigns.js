import { useSelector, useDispatch } from 'react-redux';
import {
  createCampaign,
  fetchCampaigns,
  fetchCampaignById,
  updateCampaign,
  deleteCampaign,
  estimateAudience,
  sendCampaign,
  scheduleCampaign,
  fetchScheduledCampaigns,
  fetchCampaignStats,
  clearError,
  setFilters,
  clearFilters,
  setCurrentCampaign,
  clearCurrentCampaign,
  resetAudienceEstimate
} from '../store/slices/campaignsSlice';

/**
 * Hook personalizado para gestión de campañas con Redux
 * Proporciona una interfaz simplificada para todas las operaciones de campañas
 */
export const useReduxCampaigns = () => {
  const dispatch = useDispatch();
  
  const {
    campaigns,
    currentCampaign,
    scheduledCampaigns,
    campaignStats,
    loading,
    error,
    filters,
    audienceEstimate,
    estimatingAudience,
    sendingCampaign
  } = useSelector(state => state.campaigns);

  // =====================================================
  // OPERACIONES CRUD
  // =====================================================

  const handleCreateCampaign = async (campaignData) => {
    const result = await dispatch(createCampaign(campaignData));
    return createCampaign.fulfilled.match(result) 
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleFetchCampaigns = async (filters = {}) => {
    const result = await dispatch(fetchCampaigns(filters));
    return fetchCampaigns.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleFetchCampaignById = async (campaignId) => {
    const result = await dispatch(fetchCampaignById(campaignId));
    return fetchCampaignById.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleUpdateCampaign = async (campaignId, updates) => {
    const result = await dispatch(updateCampaign({ campaignId, updates }));
    return updateCampaign.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleDeleteCampaign = async (campaignId) => {
    const result = await dispatch(deleteCampaign(campaignId));
    return deleteCampaign.fulfilled.match(result)
      ? { success: true }
      : { success: false, error: result.payload };
  };

  // =====================================================
  // GESTIÓN DE AUDIENCIA
  // =====================================================

  const handleEstimateAudience = async (neighborhoodId, targetAudience) => {
    const result = await dispatch(estimateAudience({ neighborhoodId, targetAudience }));
    return estimateAudience.fulfilled.match(result)
      ? { success: true, count: result.payload }
      : { success: false, error: result.payload };
  };

  const handleResetAudienceEstimate = () => {
    dispatch(resetAudienceEstimate());
  };

  // =====================================================
  // ENVÍO Y PROGRAMACIÓN
  // =====================================================

  const handleSendCampaign = async (campaignId) => {
    const result = await dispatch(sendCampaign(campaignId));
    return sendCampaign.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleScheduleCampaign = async (campaignId, scheduledAt) => {
    const result = await dispatch(scheduleCampaign({ campaignId, scheduledAt }));
    return scheduleCampaign.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const handleFetchScheduledCampaigns = async () => {
    const result = await dispatch(fetchScheduledCampaigns());
    return fetchScheduledCampaigns.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  // =====================================================
  // ESTADÍSTICAS
  // =====================================================

  const handleFetchCampaignStats = async (campaignId) => {
    const result = await dispatch(fetchCampaignStats(campaignId));
    return fetchCampaignStats.fulfilled.match(result)
      ? { success: true, data: result.payload }
      : { success: false, error: result.payload };
  };

  const getCampaignStats = (campaignId) => {
    return campaignStats[campaignId] || null;
  };

  // =====================================================
  // GESTIÓN DE ESTADO LOCAL
  // =====================================================

  const handleSetFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handleSetCurrentCampaign = (campaign) => {
    dispatch(setCurrentCampaign(campaign));
  };

  const handleClearCurrentCampaign = () => {
    dispatch(clearCurrentCampaign());
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  // =====================================================
  // UTILIDADES
  // =====================================================

  const getFilteredCampaigns = () => {
    let filtered = campaigns;

    if (filters.status) {
      filtered = filtered.filter(campaign => campaign.status === filters.status);
    }

    if (filters.campaign_type) {
      filtered = filtered.filter(campaign => campaign.campaign_type === filters.campaign_type);
    }

    if (filters.neighborhood_id) {
      filtered = filtered.filter(campaign => campaign.neighborhood_id === filters.neighborhood_id);
    }

    return filtered;
  };

  const getCampaignsByStatus = (status) => {
    return campaigns.filter(campaign => campaign.status === status);
  };

  const getCampaignsByType = (type) => {
    return campaigns.filter(campaign => campaign.campaign_type === type);
  };

  const getDraftCampaigns = () => getCampaignsByStatus('draft');
  const getSentCampaigns = () => getCampaignsByStatus('sent');
  const getScheduledCampaignsFromState = () => getCampaignsByStatus('scheduled');

  const getCampaignMetrics = () => {
    const totalCampaigns = campaigns.length;
    const draftCampaigns = getDraftCampaigns().length;
    const sentCampaigns = getSentCampaigns().length;
    const scheduledCampaignsCount = getScheduledCampaignsFromState().length;

    // Calcular métricas de engagement
    let totalSent = 0;
    let totalOpened = 0;
    let totalClicked = 0;

    campaigns.forEach(campaign => {
      if (campaign.stats) {
        totalSent += campaign.stats.sent || 0;
        totalOpened += campaign.stats.opened || 0;
        totalClicked += campaign.stats.clicked || 0;
      }
    });

    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;

    return {
      total: totalCampaigns,
      draft: draftCampaigns,
      sent: sentCampaigns,
      scheduled: scheduledCampaignsCount,
      totalSent,
      totalOpened,
      totalClicked,
      openRate,
      clickRate
    };
  };

  const canSendCampaign = (campaign) => {
    return campaign && ['draft', 'scheduled'].includes(campaign.status);
  };

  const canEditCampaign = (campaign) => {
    return campaign && ['draft'].includes(campaign.status);
  };

  const canScheduleCampaign = (campaign) => {
    return campaign && ['draft'].includes(campaign.status);
  };

  // =====================================================
  // RETURN OBJECT
  // =====================================================

  return {
    // Estado
    campaigns,
    currentCampaign,
    scheduledCampaigns,
    campaignStats,
    loading,
    error,
    filters,
    audienceEstimate,
    estimatingAudience,
    sendingCampaign,

    // Operaciones CRUD
    createCampaign: handleCreateCampaign,
    fetchCampaigns: handleFetchCampaigns,
    fetchCampaignById: handleFetchCampaignById,
    updateCampaign: handleUpdateCampaign,
    deleteCampaign: handleDeleteCampaign,

    // Gestión de audiencia
    estimateAudience: handleEstimateAudience,
    resetAudienceEstimate: handleResetAudienceEstimate,

    // Envío y programación
    sendCampaign: handleSendCampaign,
    scheduleCampaign: handleScheduleCampaign,
    fetchScheduledCampaigns: handleFetchScheduledCampaigns,

    // Estadísticas
    fetchCampaignStats: handleFetchCampaignStats,
    getCampaignStats,

    // Gestión de estado
    setFilters: handleSetFilters,
    clearFilters: handleClearFilters,
    setCurrentCampaign: handleSetCurrentCampaign,
    clearCurrentCampaign: handleClearCurrentCampaign,
    clearError: handleClearError,

    // Utilidades
    getFilteredCampaigns,
    getCampaignsByStatus,
    getCampaignsByType,
    getDraftCampaigns,
    getSentCampaigns,
    getScheduledCampaignsFromState,
    getCampaignMetrics,
    canSendCampaign,
    canEditCampaign,
    canScheduleCampaign
  };
};