import { createSelector } from '@reduxjs/toolkit';

// Selectores básicos
export const selectCampaigns = (state) => state.campaigns.items;
export const selectCampaignsLoading = (state) => state.campaigns.loading;
export const selectCampaignsError = (state) => state.campaigns.error;
export const selectCampaignStats = (state) => state.campaigns.stats;
export const selectSelectedCampaign = (state) => state.campaigns.selectedCampaign;

// Selectores memoizados
export const selectCampaignsByStatus = createSelector(
  [selectCampaigns, (_, status) => status],
  (campaigns, status) => campaigns.filter(campaign => campaign.status === status)
);

export const selectCampaignsByType = createSelector(
  [selectCampaigns, (_, type) => type],
  (campaigns, type) => campaigns.filter(campaign => campaign.type === type)
);

export const selectActiveCampaigns = createSelector(
  [selectCampaigns],
  (campaigns) => campaigns.filter(campaign => campaign.status === 'active')
);

export const selectDraftCampaigns = createSelector(
  [selectCampaigns],
  (campaigns) => campaigns.filter(campaign => campaign.status === 'draft')
);

export const selectCompletedCampaigns = createSelector(
  [selectCampaigns],
  (campaigns) => campaigns.filter(campaign => campaign.status === 'completed')
);

export const selectRecentCampaigns = createSelector(
  [selectCampaigns],
  (campaigns) => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return campaigns.filter(campaign => new Date(campaign.created_at) > oneWeekAgo);
  }
);

export const selectCampaignsByNeighborhood = createSelector(
  [selectCampaigns, (_, neighborhoodId) => neighborhoodId],
  (campaigns, neighborhoodId) => campaigns.filter(campaign => campaign.neighborhood_id === neighborhoodId)
);