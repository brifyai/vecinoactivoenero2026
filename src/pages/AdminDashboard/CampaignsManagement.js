/**
 * Campaigns Management - Gestión de Campañas Administrativas
 * Página completa para administrar campañas de comunicación
 */
import React, { useEffect, useState } from 'react';
import { useReduxCampaigns } from '../../hooks/useReduxCampaigns';
import { useReduxAdmin } from '../../hooks/useReduxAdmin';
import CreateCampaignModal from '../../components/AdminDashboard/CreateCampaignModal';

// Material UI Icons
import CampaignIcon from '@mui/icons-material/Campaign';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DraftsIcon from '@mui/icons-material/Drafts';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';

import './CampaignsManagement.css';

const CampaignsManagement = () => {
  console.log('📢 CampaignsManagement component loading');

  const {
    campaigns,
    loading,
    error,
    filters,
    fetchCampaigns,
    createCampaign,
    sendCampaign,
    deleteCampaign,
    setFilters,
    getFilteredCampaigns,
    getCampaignMetrics,
    canSendCampaign,
    canEditCampaign
  } = useReduxCampaigns();

  const {
    getCurrentNeighborhoodId,
    getCurrentNeighborhoodName,
    canSendCampaigns
  } = useReduxAdmin();

  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // list, grid
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Cargar campañas al montar el componente
  useEffect(() => {
    const neighborhoodId = getCurrentNeighborhoodId();
    if (neighborhoodId && canSendCampaigns()) {
      loadCampaigns(neighborhoodId);
    }
  }, []);

  const loadCampaigns = async (neighborhoodId) => {
    console.log('📊 Cargando campañas para:', neighborhoodId);
    await fetchCampaigns({ neighborhood_id: neighborhoodId });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implementar búsqueda local por ahora
    console.log('🔍 Buscando:', searchInput);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
  };

  const handleSendCampaign = async (campaignId) => {
    if (!window.confirm('¿Estás seguro de que quieres enviar esta campaña ahora?')) {
      return;
    }

    const result = await sendCampaign(campaignId);
    if (result.success) {
      alert(`✅ Campaña enviada: ${result.sent}/${result.total} mensajes enviados exitosamente`);
      // Recargar campañas
      const neighborhoodId = getCurrentNeighborhoodId();
      if (neighborhoodId) {
        await loadCampaigns(neighborhoodId);
      }
    } else {
      alert(`❌ Error al enviar campaña: ${result.error}`);
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
      const result = await deleteCampaign(campaignId);
      if (result.success) {
        console.log('✅ Campaña eliminada correctamente');
      }
    }
  };

  const handleCreateCampaign = () => {
    console.log('📝 Abriendo modal para crear campaña');
    setShowCreateModal(true);
  };

  const handleSubmitCampaign = async (campaignData) => {
    console.log('📤 Creando campaña:', campaignData);
    
    try {
      // Llamar a la función de crear campaña del hook
      const result = await createCampaign(campaignData);
      
      if (result.success) {
        // Si el estado es 'sent', enviar inmediatamente
        if (campaignData.status === 'sent') {
          const sendResult = await sendCampaign(result.data.id);
          
          if (sendResult.success) {
            alert(`✅ Campaña "${campaignData.title}" enviada exitosamente: ${sendResult.sent}/${sendResult.total} mensajes`);
          } else {
            alert(`⚠️ Campaña creada pero hubo un error al enviar: ${sendResult.error}`);
          }
        } else {
          alert(`✅ Campaña "${campaignData.title}" ${campaignData.status === 'scheduled' ? 'programada' : 'guardada como borrador'} exitosamente`);
        }
        
        // Recargar campañas
        const neighborhoodId = getCurrentNeighborhoodId();
        if (neighborhoodId) {
          await loadCampaigns(neighborhoodId);
        }
      } else {
        alert(`❌ Error al crear campaña: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creando campaña:', error);
      alert('❌ Error al crear la campaña. Por favor intenta de nuevo.');
    }
  };

  const toggleCampaignSelection = (campaignId) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <DraftsIcon />;
      case 'scheduled': return <ScheduleIcon />;
      case 'sent': return <CheckCircleIcon />;
      default: return <CampaignIcon />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return <EmailIcon />;
      case 'push': return <NotificationsIcon />;
      case 'whatsapp': return <WhatsAppIcon />;
      default: return <CampaignIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#6b7280';
      case 'scheduled': return '#3b82f6';
      case 'sent': return '#10b981';
      default: return '#6b7280';
    }
  };

  const metrics = getCampaignMetrics();
  const filteredCampaigns = getFilteredCampaigns();

  if (!canSendCampaigns()) {
    return (
      <div className="campaigns-management">
        <div className="access-denied">
          <CampaignIcon />
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para gestionar campañas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="campaigns-management">
      {/* Header */}
      <div className="campaigns-header">
        <div className="header-info">
          <CampaignIcon className="header-icon" />
          <div>
            <h1>Gestión de Campañas</h1>
            <p>{getCurrentNeighborhoodName()} • {metrics.total} campañas totales</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="create-campaign-btn" onClick={handleCreateCampaign}>
            <AddIcon />
            Nueva Campaña
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="campaigns-metrics">
        <div className="metric-card">
          <div className="metric-icon draft">
            <DraftsIcon />
          </div>
          <div className="metric-info">
            <div className="metric-value">{metrics.draft}</div>
            <div className="metric-label">Borradores</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon scheduled">
            <ScheduleIcon />
          </div>
          <div className="metric-info">
            <div className="metric-value">{metrics.scheduled}</div>
            <div className="metric-label">Programadas</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon sent">
            <CheckCircleIcon />
          </div>
          <div className="metric-info">
            <div className="metric-value">{metrics.sent}</div>
            <div className="metric-label">Enviadas</div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon engagement">
            <TrendingUpIcon />
          </div>
          <div className="metric-info">
            <div className="metric-value">{metrics.openRate}%</div>
            <div className="metric-label">Tasa Apertura</div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="campaigns-controls">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar campañas..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit">Buscar</button>
          </form>
        </div>

        <div className="filter-section">
          <button 
            className={`filter-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterListIcon />
            Filtros
          </button>

          <div className="view-modes">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              Lista
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Cuadrícula
            </button>
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Estado:</label>
            <select 
              value={filters.status || ''} 
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="draft">Borrador</option>
              <option value="scheduled">Programada</option>
              <option value="sent">Enviada</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Tipo:</label>
            <select 
              value={filters.campaign_type || ''} 
              onChange={(e) => handleFilterChange('campaign_type', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="email">Email</option>
              <option value="push">Push</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Fecha:</label>
            <select 
              value={filters.date_range || ''} 
              onChange={(e) => handleFilterChange('date_range', e.target.value)}
            >
              <option value="">Todas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>
        </div>
      )}

      {/* Lista de campañas */}
      <div className="campaigns-content">
        {loading ? (
          <div className="campaigns-loading">
            <div className="loading-spinner"></div>
            <span>Cargando campañas...</span>
          </div>
        ) : error ? (
          <div className="campaigns-error">
            <p>Error al cargar campañas: {error}</p>
            <button onClick={() => loadCampaigns(getCurrentNeighborhoodId())}>
              Reintentar
            </button>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="campaigns-empty">
            <CampaignIcon />
            <h3>No hay campañas</h3>
            <p>No se encontraron campañas con los filtros aplicados.</p>
            <button className="create-first-campaign" onClick={handleCreateCampaign}>
              <AddIcon />
              Crear primera campaña
            </button>
          </div>
        ) : (
          <div className={`campaigns-list ${viewMode}`}>
            {filteredCampaigns.map((campaign) => (
              <div key={campaign.id} className="campaign-card">
                <div className="campaign-header">
                  <div className="campaign-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.includes(campaign.id)}
                      onChange={() => toggleCampaignSelection(campaign.id)}
                    />
                  </div>
                  <div 
                    className="campaign-type-icon"
                    style={{ backgroundColor: getStatusColor(campaign.status) }}
                  >
                    {getTypeIcon(campaign.campaign_type)}
                  </div>
                  <div className="campaign-menu">
                    <MoreVertIcon />
                  </div>
                </div>

                <div className="campaign-content">
                  <h3 className="campaign-title">{campaign.name}</h3>
                  <p className="campaign-description">{campaign.message}</p>

                  <div className="campaign-meta">
                    <div className="meta-item">
                      <PeopleIcon />
                      <span>{campaign.target_audience || 'Todos'}</span>
                    </div>
                    <div className="meta-item">
                      <CalendarTodayIcon />
                      <span>
                        {campaign.scheduled_at 
                          ? new Date(campaign.scheduled_at).toLocaleDateString()
                          : new Date(campaign.created_at).toLocaleDateString()
                        }
                      </span>
                    </div>
                  </div>

                  {campaign.stats && (
                    <div className="campaign-stats">
                      <div className="stat-item">
                        <span className="stat-value">{campaign.stats.sent || 0}</span>
                        <span className="stat-label">Enviados</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{campaign.stats.opened || 0}</span>
                        <span className="stat-label">Abiertos</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{campaign.stats.clicked || 0}</span>
                        <span className="stat-label">Clicks</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="campaign-footer">
                  <div className={`campaign-status ${campaign.status}`}>
                    {getStatusIcon(campaign.status)}
                    <span>{campaign.status}</span>
                  </div>

                  <div className="campaign-actions">
                    <button className="action-btn view">
                      <VisibilityIcon />
                    </button>
                    {canEditCampaign(campaign) && (
                      <button className="action-btn edit">
                        <EditIcon />
                      </button>
                    )}
                    {canSendCampaign(campaign) && (
                      <button 
                        className="action-btn send"
                        onClick={() => handleSendCampaign(campaign.id)}
                      >
                        <SendIcon />
                      </button>
                    )}
                    {campaign.status === 'draft' && (
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <DeleteIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Crear Campaña */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmitCampaign}
        neighborhoodId={getCurrentNeighborhoodId()}
      />
    </div>
  );
};

export default CampaignsManagement;